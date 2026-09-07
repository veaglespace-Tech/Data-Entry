"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <div className="bg-mesh"></div>
      <div className="bg-blob-accent"></div>

      <main style={{ padding: '20px 24px 40px', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header Section */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginTop: 10 }}>
          <div className="badge badge-primary" style={{ marginBottom: 16, padding: '6px 14px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center' }}>
            <MessageSquare size={14} style={{ marginRight: 6 }} />
            Get in touch
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: 'var(--foreground)', marginBottom: 16, letterSpacing: '-0.03em' }}>
            Let's start a <span className="gradient-text-primary">conversation</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 550, margin: '0 auto', lineHeight: 1.6 }}>
            Have a question about our platform or pricing? Our team is here to help you get the most out of DataVault.
          </p>
        </div>

        {/* Content Section */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, animationDelay: '0.1s' }}>
          
          {/* Contact Info (Left Side inside the card) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)' }}>Contact Information</h2>
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={20} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>Email Us</h3>
                <a href="mailto:support@datavault.com" style={{ fontSize: 14, fontWeight: 500, color: '#3b82f6', textDecoration: 'none' }}>support@datavault.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={20} style={{ color: '#10b981' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>Call Us</h3>
                <a href="tel:+919876543210" style={{ fontSize: 14, fontWeight: 500, color: '#10b981', textDecoration: 'none' }}>+91 98765 43210</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={20} style={{ color: '#f43f5e' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>Visit Us</h3>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>123 Data Avenue, Tech Park<br/>Pune, MH 411057</span>
              </div>
            </div>
          </div>

          {/* Contact Form (Right Side) */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', marginBottom: 20 }}>Send a message</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid var(--border-color)',
                      background: 'var(--surface)',
                      color: 'var(--foreground)',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid var(--border-color)',
                      background: 'var(--surface)',
                      color: 'var(--foreground)',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="How can we help you today?"
                  rows={3}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
                style={{ 
                  marginTop: 8, 
                  padding: '14px', 
                  fontSize: 15, 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Sending..." : (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
