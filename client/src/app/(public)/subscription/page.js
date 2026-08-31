"use client";

import { useRouter } from "next/navigation";
import { Check, Star, Zap, ArrowRight, AlertCircle } from "lucide-react";
import { useGetPlansQuery } from "@/redux/api/apiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slice/authSlice";

export default function SubscriptionPage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const { data, isLoading, isError } = useGetPlansQuery();
  const plans = data?.data || [];

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading plans...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ minHeight: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Failed to load plans.</p>
      </div>
    );
  }

  const handleSelectPlan = (planId) => {
    router.push(`/checkout/${planId}`);
  };

  return (
    <>
      <div className="bg-mesh"></div>
      <div className="bg-blob-accent"></div>

      <main style={{ padding: '80px 24px 120px', maxWidth: 1100, margin: '0 auto' }}>
        
        {user?.planStatus === "EXPIRED" && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.05)',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle color="white" size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#7f1d1d', marginBottom: 4 }}>Your plan has expired</h3>
              <p style={{ fontSize: 15, color: '#991b1b', margin: 0 }}>Please renew your subscription to regain access to your dashboard and forms.</p>
            </div>
          </div>
        )}

        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: '#0f172a', marginBottom: 20, letterSpacing: '-0.03em' }}>
            Simple, transparent <span className="gradient-text-primary">pricing</span>
          </h1>
          <p style={{ fontSize: 20, color: '#475569', maxWidth: 600, margin: '0 auto' }}>
            No hidden fees. No surprise charges. Choose the plan that best fits your needs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: 28, alignItems: 'stretch' }}>
          {plans.map((plan, index) => {
            const isHighlight = plan.name === "Pro";
            const formattedPrice = plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString()}`;
            const ctaText = plan.price === 0 ? "Get Started" : `Choose ${plan.name}`;

            return (
              <div
                key={plan.id}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.12}s`,
                  position: 'relative',
                  zIndex: isHighlight ? 10 : 1,
                }}
              >
                {isHighlight && (
                  <div style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    color: 'white',
                    padding: '6px 18px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                  }}>
                    <Star size={14} /> MOST POPULAR
                  </div>
                )}

                <div
                  onClick={() => handleSelectPlan(plan.id)}
                  style={{
                    background: isHighlight ? '#ffffff' : '#ffffff',
                    border: isHighlight ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: 24,
                    padding: '44px 32px 36px',
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isHighlight
                      ? '0 20px 50px rgba(37, 99, 235, 0.12), 0 8px 20px rgba(37, 99, 235, 0.06)'
                      : '0 8px 30px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = isHighlight
                      ? '0 28px 60px rgba(37, 99, 235, 0.18), 0 12px 28px rgba(37, 99, 235, 0.1)'
                      : '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(37, 99, 235, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = isHighlight
                      ? '0 20px 50px rgba(37, 99, 235, 0.12), 0 8px 20px rgba(37, 99, 235, 0.06)'
                      : '0 8px 30px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  {/* Plan Name */}
                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: 6,
                  }}>
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: 14,
                    color: '#64748b',
                    marginBottom: 24,
                    lineHeight: 1.5,
                    minHeight: 42,
                  }}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div style={{ marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{
                      fontSize: 44,
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                    }}>
                      {formattedPrice}
                    </span>
                    {plan.price > 0 && (
                      <span style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>
                        / {plan.period}
                      </span>
                    )}
                    {plan.price === 0 && (
                      <span style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>
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
                      width: '100%',
                      padding: '14px 20px',
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                      marginBottom: 32,
                      border: 'none',
                      borderRadius: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.25s ease',
                      ...(isHighlight
                        ? {
                            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                          }
                        : {
                            background: '#f1f5f9',
                            color: '#334155',
                            boxShadow: 'none',
                          }),
                    }}
                    onMouseEnter={(e) => {
                      if (isHighlight) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #3b82f6)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.35)';
                      } else {
                        e.currentTarget.style.background = '#e2e8f0';
                        e.currentTarget.style.color = '#1e293b';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isHighlight) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #3b82f6)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.25)';
                      } else {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#334155';
                      }
                    }}
                  >
                    {isHighlight && <Zap size={18} />}
                    {ctaText}
                    <ArrowRight size={18} />
                  </button>

                  {/* Features */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    flex: 1,
                  }}>
                    {plan.features.map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: isHighlight ? '#eff6ff' : '#f0fdf4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Check size={13} style={{ color: isHighlight ? '#2563eb' : '#16a34a' }} />
                        </div>
                        <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>
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

      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.05)', padding: '40px 24px', textAlign: 'center', background: '#ffffff' }}>
        <p style={{ color: '#64748b', fontSize: 15, fontWeight: 500 }}>
          © 2024 DataVault SaaS. Built with ❤️ for speed and beauty.
        </p>
      </footer>
    </>
  );
}
