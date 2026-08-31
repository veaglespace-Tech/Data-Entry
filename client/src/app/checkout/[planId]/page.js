"use client";

import { use, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAuthLoading } from "@/redux/slice/authSlice";
import { useInitiatePaymentMutation, useGetPlanQuery, useActivateFreePlanMutation } from "@/redux/api/apiSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { Shield, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function CheckoutPage({ params }) {
  const resolvedParams = use(params);
  const planId = parseInt(resolvedParams.planId);
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  const router = useRouter();
  const [initiatePayment, { isLoading: isProcessing }] = useInitiatePaymentMutation();
  const [activateFree, { isLoading: isActivatingFree }] = useActivateFreePlanMutation();

  const { data: planData, isLoading: isPlanLoading } = useGetPlanQuery(planId);
  const plan = planData?.data;

  // Retrieve temp registration data if user is not logged in yet
  const [tempUserData, setTempUserData] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('tempUserData');
    if (stored) {
      setTempUserData(JSON.parse(stored));
    }
  }, []);

  const activeUser = user || tempUserData;

  // Redirect to register if neither user nor temp data is found
  useEffect(() => {
    if (!loading && !user && !tempUserData) {
      // Check after a tiny delay to ensure sessionStorage is read
      setTimeout(() => {
        if (!sessionStorage.getItem('tempUserData')) {
          router.push("/register");
        }
      }, 100);
    }
  }, [user, tempUserData, loading, router]);

  if (loading || isPlanLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!activeUser) return <div style={{ padding: 40, textAlign: 'center' }}>Loading user data...</div>;

  if (!plan) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Invalid Plan Selected</div>;
  }

  // GST Calculation
  const gstRate = 0.18;
  const gstAmount = plan.price * gstRate;
  const finalPrice = plan.price + gstAmount;

  const handlePayment = async () => {
    if (plan.price === 0) {
      try {
        const res = await activateFree({
          planId: plan.id,
          tempUserData: user ? null : activeUser,
        }).unwrap();
        toast.success("Free plan activated!");
        router.push(`/payment/success?token=${res.token}`);
      } catch (err) {
        toast.error("Failed to activate free plan.");
      }
      return;
    }

    try {
      // 1. Get Hash and TXNID from our backend
      const res = await initiatePayment({
        planId: planId,
        amount: finalPrice,
        firstname: activeUser.name,
        email: activeUser.email,
        phone: activeUser.mobile || "9999999999", // Fallback if mobile is empty
        productinfo: `Subscription to ${plan.name} Plan`,
        tempUserData: user ? null : activeUser, // Pass temp data only if not fully registered
      }).unwrap();

      const { hash, txnid, key } = res.data;

      // 2. Create PayU Form dynamically and submit it
      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute("action", "https://test.payu.in/_payment");

      const addField = (name, value) => {
        const input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", name);
        input.setAttribute("value", value);
        form.appendChild(input);
      };

      addField("key", key);
      addField("txnid", txnid);
      addField("amount", finalPrice);
      addField("productinfo", `Subscription to ${plan.name} Plan`);
      addField("firstname", activeUser.name);
      addField("email", activeUser.email);
      addField("phone", activeUser.mobile || "9999999999");
      addField("surl", "http://localhost:5000/api/payment/success"); // Backend callback
      addField("furl", "http://localhost:5000/api/payment/failure"); // Backend callback
      addField("hash", hash);

      document.body.appendChild(form);
      form.submit(); // Takes user to PayU page
    } catch (error) {
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: 'relative' }}>
      <div className="bg-mesh"></div>
      <Navbar />

      <main style={{ padding: '80px 24px', maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 32, textAlign: 'center', letterSpacing: '-0.02em' }}>
          Complete your purchase
        </h1>

        <div className="glass-card animate-fade-in-up" style={{ padding: 40 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 24, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}>
              <Zap size={28} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{plan.name} Plan</h2>
              <p style={{ color: '#64748b', fontSize: 15 }}>Unlock premium data management features</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 16 }}>
              <span>Base Price</span>
              <span style={{ fontWeight: 500, color: '#0f172a' }}>₹{plan.price.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 16 }}>
              <span>GST (18%)</span>
              <span style={{ fontWeight: 500, color: '#0f172a' }}>₹{gstAmount.toLocaleString()}</span>
            </div>
            <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#0f172a' }}>Total Amount</span>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.02em' }}>₹{finalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0' }}>
            <Shield size={24} style={{ color: '#10b981' }} />
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              Your payment is securely processed. We do not store any of your credit card or banking information.
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing || isActivatingFree}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: 18 }}
          >
            {isProcessing || isActivatingFree ? "Processing..." : plan.price === 0 ? "Activate Free Plan" : `Pay ₹${finalPrice.toLocaleString()} Securely`}
            {!(isProcessing || isActivatingFree) && <ArrowRight size={20} />}
          </button>
        </div>
      </main>
    </div>
  );
}
