"use client"; 

import "../globals.css";
import { useState } from "react";
import Header from "./components/header";
import Footer from "./components/footer";

// 1. Import AuthProvider (Chú ý đường dẫn đúng với nơi bạn tạo file AuthContext)
import { AuthProvider } from "./components/context/AuthContext";

export default function RootLayout({ children }) {
  const [open, setOpen] = useState({});

  const toggle = (key) => {
    setOpen((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <html lang="vi">
      <body className="bg-white text-gray-900">
        {/* 2. Bọc AuthProvider quanh Header và Main để toàn bộ app nhận được thông tin user */}
        <AuthProvider>
            <Header open={open} toggle={toggle} />
            <main>{children}</main>
            <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}