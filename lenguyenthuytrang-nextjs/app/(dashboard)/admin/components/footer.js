// app/components/footer.js
"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-700 pt-4">
          
          {/* Thông tin Bản quyền */}
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Admin Dashboard. All rights reserved.
          </div>
          
          {/* Các Liên kết Phụ */}
          <div className="flex space-x-6 text-sm">
            <Link href="#" className="hover:text-amber-400 transition duration-150">
              Chính sách Bảo mật
            </Link>
            <Link href="#" className="hover:text-amber-400 transition duration-150">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-amber-400 transition duration-150">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}