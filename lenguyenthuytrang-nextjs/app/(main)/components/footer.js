"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-12 pb-8 border-t border-gray-800 font-sans antialiased">
      <div className="max-w-[1350px] mx-auto px-4 md:px-6">
        
        {/* --- TOP SECTION: MAIN CONTENT --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          
          {/* COLUMN 1: COMPANY INFO (BRAND, ADDRESS, CONTACT) */}
          <div className="flex flex-col space-y-4">
            {/* Logo */}
            <div className="mb-2">
              <h2 className="text-2xl font-serif tracking-widest font-bold">DIOR | SEPHORA</h2>
            </div>
            
            {/* Contact Details */}
            <div className="text-sm text-gray-300 space-y-3">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot mt-1 text-gray-400"></i>
                <span>
                  TTTM Vincom Center Landmark 81, 772 Điện Biên Phủ, Vinhomes Tân Cảng, Bình Thạnh, Thành phố Hồ Chí Minh 70000, Việt Nam<br />
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-phone text-gray-400"></i>
                <span className="hover:text-white cursor-pointer">1900 1234 - 0987 654 321</span>
              </div>
              
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-envelope text-gray-400"></i>
                <span className="hover:text-white cursor-pointer">support@diorbeautysephora.com</span>
              </div>

              <div className="flex items-start gap-3">
                <i className="fa-solid fa-clock mt-1 text-gray-400"></i>
                <span>
                  Thứ 2 - Chủ Nhật: 9:00 - 21:00<br />
                  (Hỗ trợ Trực tuyến 24/7)
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: INFORMATION (About, Contact, Legal) */}
          <div>
            <h3 className="text-lg font-bold mb-5 border-b border-gray-700 pb-2 inline-block">Thông tin</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/pages/gioi-thieu" className="hover:text-white hover:underline transition-colors">Giới thiệu</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition-colors">Liên hệ</Link>
              </li>
              <li>
                <Link href="/pages/chinh-sach-bao-mat" className="hover:text-white hover:underline transition-colors">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link href="/pages/dieu-khoan-su-dung" className="hover:text-white hover:underline transition-colors">Điều khoản sử dụng</Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: SHOPPING POLICY (Returns, Buying, Payment, Shipping) */}
          <div>
            <h3 className="text-lg font-bold mb-5 border-b border-gray-700 pb-2 inline-block">Chính sách mua hàng</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/pages/chinh-sach-doi-tra" className="hover:text-white hover:underline transition-colors">Chính sách đổi trả</Link>
              </li>
              <li>
                <Link href="/pages/huong-dan-mua-hang" className="hover:text-white hover:underline transition-colors">Hướng dẫn mua hàng</Link>
              </li>
              <li>
                <Link href="/pages/phuong-thuc-thanh-toan" className="hover:text-white hover:underline transition-colors">Phương thức thanh toán</Link>
              </li>
              <li>
                <Link href="/pages/chinh-sach-van-chuyen" className="hover:text-white hover:underline transition-colors">Chính sách vận chuyển</Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: CUSTOMER SUPPORT (FAQ, Warranty, Chat) */}
          <div>
            <h3 className="text-lg font-bold mb-5 border-b border-gray-700 pb-2 inline-block">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/faq" className="hover:text-white hover:underline transition-colors">Câu hỏi thường gặp (FAQ)</Link>
              </li>
              <li>
                <Link href="/support-center" className="hover:text-white hover:underline transition-colors">Trung tâm hỗ trợ / Khiếu nại</Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-white hover:underline transition-colors">Hướng dẫn bảo hành</Link>
              </li>
              <li className="flex items-center gap-2 text-green-400 font-semibold cursor-pointer hover:text-green-300">
                <i className="fa-solid fa-comments"></i>
                <span>Trò chuyện trực tuyến</span>
              </li>
            </ul>
          </div>

        </div>

        {/* --- SEPARATOR --- */}
        <hr className="border-gray-800 my-8" />

        {/* --- BOTTOM SECTION: SOCIAL & COPYRIGHT --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Copyright */}
          <div className="text-xs text-gray-500 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} Dior Beauty | Sephora. Toàn bộ bản quyền được bảo lưu.</p>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-6">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300" title="Facebook">
              <i className="fa-brands fa-facebook-f text-lg"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300" title="Instagram">
              <i className="fa-brands fa-instagram text-lg"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300" title="Twitter / X">
              <i className="fa-brands fa-x-twitter text-lg"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300" title="YouTube">
              <i className="fa-brands fa-youtube text-lg"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300" title="Pinterest">
              <i className="fa-brands fa-pinterest-p text-lg"></i>
            </a>
          </div>
        </div>

      </div>

      {/* Font Awesome Link */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </footer>
  );
}