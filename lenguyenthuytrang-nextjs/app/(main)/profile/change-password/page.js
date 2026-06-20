"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClientUserService from "@/services/ClientUserService"; // Import Service

export default function ChangePasswordPage() {
  const router = useRouter();

  // --- STATE ---
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    type: "", // 'success' | 'error'
    message: "",
  });

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa thông báo lỗi khi user bắt đầu gõ lại
    if (status.message) setStatus({ ...status, message: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản phía Client
    if (formData.new_password !== formData.new_password_confirmation) {
        setStatus({ type: "error", message: "Mật khẩu xác nhận không khớp.", loading: false });
        return;
    }

    setStatus({ loading: true, type: "", message: "" });

    try {
      // Gọi API đổi mật khẩu
      const response = await ClientUserService.changePassword(formData);

      if (response.data.status) {
        setStatus({
          loading: false,
          type: "success",
          message: "Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.",
        });
        
        // Reset form
        setFormData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      setStatus({
        loading: false,
        type: "error",
        message: errorMsg,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md mx-auto">
        {/* Card Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Header Card */}
          <div className="bg-black py-6 px-8 text-center">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <i className="fa-solid fa-lock text-gray-400"></i>
              Change Password
            </h2>
            <p className="text-gray-400 text-sm mt-2">Protect your account</p>
          </div>

          <div className="p-8">
            {/* Thông báo trạng thái */}
            {status.message && (
              <div className={`mb-6 p-4 rounded-xl flex items-start ${
                status.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <i className={`fa-solid mt-1 mr-3 ${status.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
                <span className="text-sm font-medium">{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Mật khẩu hiện tại */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <i className="fa-solid fa-key"></i>
                  </span>
                  <input
                    type="password"
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                    placeholder="••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-gray-200 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-gray-200 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Re-enter new password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <i className="fa-solid fa-check-double"></i>
                  </span>
                  <input
                    type="password"
                    name="new_password_confirmation"
                    value={formData.new_password_confirmation}
                    onChange={handleChange}
                    placeholder="••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-gray-200 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Nút Submit */}
              <button
                type="submit"
                disabled={status.loading}
                className={`w-full py-3.5 px-6 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform transition-all duration-200 ${
                    status.loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800 hover:-translate-y-1"
                }`}
              >
                {status.loading ? (
                  <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Processing...</>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </div>
        </div>


      </div>
      
      {/* FontAwesome (Nếu chưa có trong Layout) */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}