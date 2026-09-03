"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectCurrentToken, setCredentials } from "@/redux/slice/authSlice";
import { useGetPlansQuery, useGetMeQuery } from "@/redux/api/apiSlice";
import { useDispatch } from "react-redux";
import Sidebar from "@/components/Sidebar";
import { CreditCard, Calendar, Clock, ArrowUpCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardSubscriptionPage() {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();
  const { data: meData, isLoading: meLoading } = useGetMeQuery(undefined, {
    skip: !token
  });
  const plans = plansData?.data || [];

  useEffect(() => {
    if (meData?.success && meData.data) {
      dispatch(setCredentials({ user: meData.data, token }));
    }
  }, [meData, dispatch, token]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      router.push("/dashboard");
    } else if (!user && !meLoading) {
      router.push("/login");
    }
  }, [user, meLoading, router]);

  if (!user || plansLoading || meLoading) return <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}><Sidebar /><main style={{ flex: 1, padding: "32px 36px" }}>Loading...</main></div>;

  const currentPlan = plans.find((p) => p.id === user.planId);
  const isExpired = user.planStatus === "EXPIRED" || (user.planExpiresAt && new Date(user.planExpiresAt) < new Date());
  
  const expiryDate = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  
  let startedOnDate = user.createdAt ? new Date(user.createdAt) : null;
  if (expiryDate && currentPlan) {
    const calculatedStart = new Date(expiryDate);
    if (currentPlan.price === 0) {
      calculatedStart.setDate(calculatedStart.getDate() - 3);
    } else if (currentPlan.period === 'per month') {
      calculatedStart.setMonth(calculatedStart.getMonth() - 1);
    } else if (currentPlan.period === 'per year') {
      calculatedStart.setFullYear(calculatedStart.getFullYear() - 1);
    } else {
      calculatedStart.setDate(calculatedStart.getDate() - 30);
    }
    startedOnDate = calculatedStart;
  }

  // Calculate remaining days
  const now = new Date();
  let remainingDays = 0;
  if (expiryDate && expiryDate > now) {
    const diffTime = Math.abs(expiryDate - now);
    remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxHeight: "100vh" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 6 }}>
            My Subscription
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
            Manage your plan and billing details
          </p>
        </div>

        <div style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: "32px",
          border: "1px solid rgba(0,0,0,0.04)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          maxWidth: 800
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                Current Plan: {currentPlan?.name || "Unknown"}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  background: isExpired ? "#fee2e2" : "#dcfce7",
                  color: isExpired ? "#ef4444" : "#16a34a"
                }}>
                  {isExpired ? "EXPIRED" : "ACTIVE"}
                </div>
                {!isExpired && remainingDays > 0 && (
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                    {remainingDays} days remaining
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                {currentPlan?.price === 0 ? "Free" : `₹${currentPlan?.price}`}
              </p>
              <p style={{ fontSize: 13, color: '#64748b' }}>
                {currentPlan?.period}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <Calendar size={20} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>Started On</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {startedOnDate ? startedOnDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: isExpired ? '#fee2e2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExpired ? '#ef4444' : '#3b82f6' }}>
                <Clock size={20} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>{isExpired ? "Expired On" : "Expires On"}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {expiryDate ? expiryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Link 
              href="/subscription?upgrade=true"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                transition: 'all 0.2s'
              }}
            >
              <ArrowUpCircle size={18} />
              {isExpired ? "Renew Subscription" : "Upgrade Plan"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
