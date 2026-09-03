"use client";

import { useRouter } from "next/navigation";
import { Check, Star, Zap, ArrowRight, AlertCircle } from "lucide-react";
import { useGetPlansQuery } from "@/redux/api/apiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slice/authSlice";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const DEFAULT_PLANS = [
  {
    id: 1,
    name: "Starter",
    description: "Perfect for individuals starting out with data management.",
    price: 0,
    period: "forever",
    features: [
      "Up to 3 Custom Forms",
      "100 Data Entries per month",
      "Basic Analytics",
      "CSV Export"
    ],
    formLimit: 3,
    entryLimit: 100,
  },
  {
    id: 2,
    name: "Pro",
    description: "Ideal for growing teams and businesses.",
    price: 1499,
    period: "per month",
    features: [
      "Unlimited Custom Forms",
      "10,000 Data Entries per month",
      "Advanced Dashboard & Analytics",
      "Priority Email Support",
      "API Access"
    ],
    formLimit: -1,
    entryLimit: 10000,
  },
  {
    id: 3,
    name: "Enterprise",
    description: "For large scale data operations & high volume.",
    price: 4999,
    period: "per month",
    features: [
      "Everything in Pro",
      "Unlimited Data Entries",
      "Custom Domains",
      "Dedicated Account Manager",
      "SSO Authentication"
    ],
    formLimit: -1,
    entryLimit: -1,
  }
];

const parseFeatures = (features) => {
  if (Array.isArray(features)) return features;
  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return features.split("\n").map(f => f.trim()).filter(Boolean);
    }
  }
  return [];
};

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUpgrade = searchParams.get("upgrade") === "true";
  const user = useSelector(selectCurrentUser);
  const { data, isLoading } = useGetPlansQuery();

  // If backend returns plans, use them; otherwise fallback to DEFAULT_PLANS
  const plans = (data?.data && Array.isArray(data.data) && data.data.length > 0)
    ? data.data
    : (isLoading ? [] : DEFAULT_PLANS);

  const handleSelectPlan = (planId) => {
    let url = `/checkout/${planId}`;
    if (isUpgrade) {
      url += "?upgrade=true";
    }
    router.push(url);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <div className="bg-mesh"></div>
      <div className="bg-blob-accent"></div>

      <main style={{ flex: 1, padding: "100px 20px 60px", maxWidth: 1160, width: "100%", margin: "0 auto" }}>
        
        {user?.planStatus === "EXPIRED" && (
          <div style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: 16,
            padding: "18px 22px",
            marginBottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 4px 20px rgba(239, 68, 68, 0.05)",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #ef4444, #dc2626)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}>
              <AlertCircle color="white" size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#7f1d1d", marginBottom: 2 }}>Your plan has expired</h3>
              <p style={{ fontSize: 14, color: "#991b1b", margin: 0 }}>
                Your subscription ended on <strong>{user?.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "recently"}</strong>. Please renew to regain access to your dashboard and forms.
              </p>
            </div>
          </div>
        )}

        <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: 50 }}>
          <h1 style={{ fontSize: "clamp(32px, 4.5vw, 50px)", fontWeight: 800, color: "#0f172a", marginBottom: 16, letterSpacing: "-0.03em" }}>
            Simple, transparent <span className="gradient-text-primary">pricing</span>
          </h1>
          <p style={{ fontSize: 17, color: "#475569", maxWidth: 580, margin: "0 auto" }}>
            No hidden fees. No surprise charges. Choose the plan that best fits your needs.
          </p>
        </div>

        {/* Responsive Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
          alignItems: "stretch",
          width: "100%",
        }}>
          {plans.map((plan, index) => {
            const isHighlight = plan.name === "Pro" || index === 1;
            const formattedPrice = plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString()}`;
            const ctaText = plan.price === 0 ? "Get Started" : `Choose ${plan.name}`;
            const featureList = parseFeatures(plan.features);

            return (
              <div
                key={plan.id || index}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  position: "relative",
                  zIndex: isHighlight ? 10 : 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {isHighlight && (
                  <div style={{
                    position: "absolute",
                    top: -13,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                    color: "white",
                    padding: "5px 16px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                    whiteSpace: "nowrap",
                    zIndex: 20,
                  }}>
                    <Star size={13} /> MOST POPULAR
                  </div>
                )}

                <div
                  onClick={() => handleSelectPlan(plan.id)}
                  style={{
                    background: "#ffffff",
                    border: isHighlight ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                    borderRadius: 22,
                    padding: "36px 28px 30px",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: isHighlight
                      ? "0 16px 40px rgba(37, 99, 235, 0.1), 0 4px 12px rgba(37, 99, 235, 0.05)"
                      : "0 4px 20px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = isHighlight
                      ? "0 24px 50px rgba(37, 99, 235, 0.16)"
                      : "0 14px 30px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isHighlight
                      ? "0 16px 40px rgba(37, 99, 235, 0.1), 0 4px 12px rgba(37, 99, 235, 0.05)"
                      : "0 4px 20px rgba(0, 0, 0, 0.04)";
                  }}
                >
                  {/* Plan Name */}
                  <h3 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: 4,
                  }}>
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 20,
                    lineHeight: 1.5,
                    minHeight: 38,
                  }}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div style={{ marginBottom: 24, display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{
                      fontSize: 40,
                      fontWeight: 800,
                      color: "#0f172a",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}>
                      {formattedPrice}
                    </span>
                    {plan.price > 0 && (
                      <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                        / {plan.period}
                      </span>
                    )}
                    {plan.price === 0 && (
                      <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                        / 3 days
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.id);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 18px",
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 26,
                      border: "none",
                      borderRadius: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 0.2s ease",
                      ...(isHighlight
                        ? {
                            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                            color: "white",
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                          }
                        : {
                            background: "#f1f5f9",
                            color: "#334155",
                          }),
                    }}
                    onMouseEnter={(e) => {
                      if (isHighlight) {
                        e.currentTarget.style.background = "linear-gradient(135deg, #1d4ed8, #2563eb)";
                      } else {
                        e.currentTarget.style.background = "#e2e8f0";
                        e.currentTarget.style.color = "#0f172a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isHighlight) {
                        e.currentTarget.style.background = "linear-gradient(135deg, #2563eb, #3b82f6)";
                      } else {
                        e.currentTarget.style.background = "#f1f5f9";
                        e.currentTarget.style.color = "#334155";
                      }
                    }}
                  >
                    {isHighlight && <Zap size={16} />}
                    {ctaText}
                    <ArrowRight size={16} />
                  </button>

                  {/* Features */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    flex: 1,
                  }}>
                    {featureList.map((feature, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: isHighlight ? "#eff6ff" : "#f0fdf4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <Check size={12} style={{ color: isHighlight ? "#2563eb" : "#16a34a" }} />
                        </div>
                        <span style={{ fontSize: 13.5, color: "#475569", fontWeight: 500 }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sleek Compact Footer */}
      <footer style={{
        borderTop: "1px solid rgba(15, 23, 42, 0.06)",
        padding: "16px 20px",
        textAlign: "center",
        background: "#ffffff",
        position: "relative",
        zIndex: 10,
      }}>
        <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, margin: 0 }}>
          Designed & Developed by Veagle Space Technology Pvt. Ltd. | © 2026 All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#64748b" }}>Loading plans...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
