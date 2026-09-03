"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "@/redux/api/apiSlice";
import { setCredentials } from "@/redux/slice/authSlice";
import toast from "react-hot-toast";
import { User, Mail, Lock, UserPlus, Database, Phone, MapPin, Globe, Map, Users } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [gender, setGender] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading: loading }] = useRegisterMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    
    try {
      // Save temp registration data to sessionStorage
      const tempUserData = { name, email, password, mobile, address, country, state, gender };
      sessionStorage.setItem('tempUserData', JSON.stringify(tempUserData));
      
      toast.success("Details saved! Please choose a plan.");
      router.push("/subscription");
    } catch (error) {
      toast.error("Failed to proceed");
    }
  };

  return (
    <>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 24px', position: 'relative' }}>
        <div className="bg-mesh"></div>
        <div className="bg-blob-accent" style={{ top: '10%', right: '10%' }}></div>

        <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 460, padding: 48, margin: '40px 0', position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
          {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/veagle-logo.webp" 
              alt="Main Brand Logo" 
              className="animate-flip-y"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
            DataVault
          </span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Create an account
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 16, marginBottom: 40 }}>
          Start managing your data in minutes
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Country</label>
            <div style={{ position: 'relative' }}>
              <Globe size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">State</label>
            <div style={{ position: 'relative' }}>
              <Map size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Gender</label>
            <div style={{ position: 'relative' }}>
              <Users size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <select
                className="form-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52, appearance: 'none' }}
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                className="form-input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingLeft: 44, height: 52 }}
              />
            </div>
          </div>



          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 8, padding: '16px', fontSize: 16 }}
          >
            {loading ? "Creating Account..." : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 15, color: '#64748b' }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
