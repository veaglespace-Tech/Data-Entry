import "./globals.css";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/redux/StoreProvider";

export const metadata = {
  title: "DataVault — Smart Data Entry Platform",
  description: "A modern, beautiful data entry platform. Create custom forms, manage entries, and export data with ease.",
  keywords: "data entry, forms, database, management, export, dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                borderRadius: "14px",
                fontSize: "15px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
