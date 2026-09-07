"use client";

import Navbar from "@/components/Navbar";

export default function PublicLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <footer style={{ borderTop: '1px solid var(--surface-border)', padding: '16px 20px', textAlign: 'center', background: 'var(--background)', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, margin: 0 }}>
          Designed & Developed by Veagle Space Technology Pvt. Ltd. | © 2026 All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
