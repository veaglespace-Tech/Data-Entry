const express = require("express");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const { protect } = require("../middleware/auth");
const { sha512 } = require("js-sha512");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const router = express.Router();
const prisma = new PrismaClient();

// Helper: Calculate plan expiry date based on plan
const calculateExpiryDate = (plan) => {
  const now = new Date();
  if (plan.price === 0) {
    // Free/Starter plan: 3 days trial
    now.setDate(now.getDate() + 3);
  } else if (plan.period === "per month") {
    now.setMonth(now.getMonth() + 1);
  } else if (plan.period === "per year") {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    // Default: 30 days
    now.setDate(now.getDate() + 30);
  }
  return now;
};

// @route   POST /api/payment/hash
// @desc    Generate PayU Hash and create pending transaction
// @access  Public
router.post(
  "/hash",
  asyncHandler(async (req, res) => {
    // Note: protect middleware is removed to allow new registrations
    const { planId, amount, firstname, email, phone, productinfo, tempUserData } = req.body;

    // Check if user is logged in by verifying auth header manually
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // Ignore, maybe it's a new user
      }
    }

    if (!planId || !amount || !firstname || !email || !phone || !productinfo) {
      res.status(400);
      throw new Error("Missing required fields for payment");
    }

    // Generate unique txnid
    const txnid = "TXN" + Date.now() + Math.floor(Math.random() * 1000);
    const key = process.env.PAYU_TEST_KEY;
    const salt = process.env.PAYU_TEST_SALT;

    // Create a pending transaction in DB
    await prisma.transaction.create({
      data: {
        txnid,
        userId: userId,
        planId,
        amount: parseFloat(amount),
        status: "PENDING",
        tempUserData: tempUserData ? tempUserData : null,
      },
    });

    // Hash sequence: key|txnid|amount|productinfo|firstname|email|||||||||||salt
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = sha512(hashString);

    res.json({
      success: true,
      data: {
        hash,
        txnid,
        key,
      },
    });
  })
);

// @route   POST /api/payment/success
// @desc    PayU Success Callback
// @access  Public
router.post(
  "/success",
  asyncHandler(async (req, res) => {
    // PayU sends the response data via POST
    const { txnid, mihpayid, status, hash, amount, productinfo, firstname, email } = req.body;
    
    // Verify reverse hash (salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    const key = process.env.PAYU_TEST_KEY;
    const salt = process.env.PAYU_TEST_SALT;
    const reverseHashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = sha512(reverseHashString);

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { txnid },
    });

    if (!transaction) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=TransactionNotFound`);
    }

    if (calculatedHash !== hash) {
      // Hash mismatch, mark as failed
      await prisma.transaction.update({
        where: { txnid },
        data: { status: "FAILED", mihpayid },
      });
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed?error=HashMismatch`);
    }

    if (status === "success") {
      let finalUserId = transaction.userId;
      let token = "";

      // If this was a new registration (userId is null)
      if (!finalUserId && transaction.tempUserData) {
        const temp = typeof transaction.tempUserData === 'string' ? JSON.parse(transaction.tempUserData) : transaction.tempUserData;
        
        // Fetch plan for expiry calculation
        const plan = await prisma.plan.findUnique({ where: { id: transaction.planId } });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temp.password, salt);

        // Create the user
        const newUser = await prisma.user.create({
          data: {
            name: temp.name,
            email: temp.email,
            mobile: temp.mobile,
            password: hashedPassword,
            role: "USER",
            planId: transaction.planId,
            planStatus: "ACTIVE",
            planExpiresAt: plan ? calculateExpiryDate(plan) : null,
          },
        });

        finalUserId = newUser.id;
        token = generateToken(newUser.id);
      } else if (finalUserId) {
        // Fetch plan for expiry calculation
        const plan = await prisma.plan.findUnique({ where: { id: transaction.planId } });
        // Update existing user planStatus and planId
        await prisma.user.update({
          where: { id: finalUserId },
          data: {
            planId: transaction.planId,
            planStatus: "ACTIVE",
            planExpiresAt: plan ? calculateExpiryDate(plan) : null,
          },
        });
        token = generateToken(finalUserId);
      }

      // Update transaction status
      await prisma.transaction.update({
        where: { txnid },
        data: { status: "SUCCESS", mihpayid, userId: finalUserId },
      });

      return res.redirect(`${process.env.CLIENT_URL}/payment/success?token=${token}`);
    } else {
      await prisma.transaction.update({
        where: { txnid },
        data: { status: "FAILED", mihpayid },
      });
      return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
    }
  })
);

// @route   POST /api/payment/failure
// @desc    PayU Failure Callback
// @access  Public
router.post(
  "/failure",
  asyncHandler(async (req, res) => {
    const { txnid, mihpayid } = req.body;
    
    if (txnid) {
      await prisma.transaction.update({
        where: { txnid },
        data: { status: "FAILED", mihpayid },
      });
    }

    return res.redirect(`${process.env.CLIENT_URL}/payment/failed`);
  })
);

// @route   POST /api/payment/free
// @desc    Activate Free Plan
// @access  Public
router.post(
  "/free",
  asyncHandler(async (req, res) => {
    const { planId, tempUserData } = req.body;

    const plan = await prisma.plan.findUnique({ where: { id: parseInt(planId) } });
    if (!plan || plan.price > 0) {
      res.status(400);
      throw new Error("Invalid free plan");
    }

    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

    let token = "";

    if (!userId && tempUserData) {
      const temp = typeof tempUserData === 'string' ? JSON.parse(tempUserData) : tempUserData;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(temp.password, salt);

      const newUser = await prisma.user.create({
        data: {
          name: temp.name,
          email: temp.email,
          mobile: temp.mobile,
          password: hashedPassword,
          role: "USER",
          planId: plan.id,
          planStatus: "ACTIVE",
          planExpiresAt: calculateExpiryDate(plan),
        },
      });
      userId = newUser.id;
      token = generateToken(userId);
    } else if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          planId: plan.id,
          planStatus: "ACTIVE",
          planExpiresAt: calculateExpiryDate(plan),
        },
      });
      token = generateToken(userId);
    } else {
      res.status(400);
      throw new Error("User data missing");
    }

    res.json({ success: true, token });
  })
);

module.exports = router;
