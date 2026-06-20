"use client";

import { useState } from "react";
import ContactService from "@/services/ClientContactService";

export default function ContactPage() {
  // --- STATE ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    content: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    isLoading: false,
    successMessage: "",
    errorMessage: "",
  });

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setStatus({ isLoading: true, successMessage: "", errorMessage: "" });
    setErrors({});

    try {
      const response = await ContactService.create(formData);

      if (response.data.status) {
        setStatus({
          isLoading: false,
          successMessage: "Cảm ơn bạn! Chúng tôi đã nhận được yêu cầu và sẽ phản hồi sớm nhất.",
          errorMessage: "",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          title: "",
          content: "",
        });
      }
    } catch (error) {
      setStatus((prev) => ({ ...prev, isLoading: false }));

      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setStatus((prev) => ({
          ...prev,
          errorMessage: "Có lỗi xảy ra, vui lòng thử lại sau.",
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên Hệ Với Chúng Tôi</h1>
          <p className="text-lg text-gray-600">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CỘT TRÁI: FORM LIÊN HỆ */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
            <div className="bg-black py-6 px-8">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fa-solid fa-pen-to-square mr-3 text-gray-400"></i>
                Gửi Tin Nhắn
              </h2>
            </div>

            <div className="p-8 flex-1">
              {status.successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border-l-4 border-green-600 flex items-start">
                  <i className="fa-solid fa-circle-check text-green-600 mt-1 mr-3 text-lg"></i>
                  <div>
                    <h3 className="text-green-800 font-semibold">Thành công!</h3>
                    <p className="text-green-700 text-sm">{status.successMessage}</p>
                  </div>
                </div>
              )}

              {status.errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 flex items-start">
                  <i className="fa-solid fa-triangle-exclamation text-red-500 mt-1 mr-3 text-lg"></i>
                  <div>
                    <h3 className="text-red-800 font-semibold">Đã xảy ra lỗi</h3>
                    <p className="text-red-700 text-sm">{status.errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200 ${errors.name ? "border-red-300 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-black focus:ring-gray-200 bg-white"}`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200 ${errors.email ? "border-red-300 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-black focus:ring-gray-200 bg-white"}`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200 ${errors.phone ? "border-red-300 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-black focus:ring-gray-200 bg-white"}`}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200 ${errors.title ? "border-red-300 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-black focus:ring-gray-200 bg-white"}`}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung liên hệ <span className="text-red-500">*</span></label>
                  <textarea
                    name="content"
                    rows="4"
                    value={formData.content}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200 resize-none ${errors.content ? "border-red-300 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-black focus:ring-gray-200 bg-white"}`}
                  ></textarea>
                  {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content[0]}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status.isLoading}
                  className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 ${status.isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800 hover:-translate-y-1"}`}
                >
                  {status.isLoading ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Đang gửi...</> : "Gửi thông tin liên hệ"}
                </button>
              </form>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN & BẢN ĐỒ */}
          <div className="flex flex-col gap-8">
            
            {/* Thẻ Thông tin liên hệ */}
            <div className="bg-black text-white rounded-2xl shadow-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">Thông Tin Liên Hệ</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-gray-800 p-3 rounded-lg mr-4">
                    <i className="fa-solid fa-location-dot text-xl text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300">Địa chỉ</h4>
                    <p className="text-gray-400 mt-1">TTTM Vincom Center Landmark 81, 772 Điện Biên Phủ, Vinhomes Tân Cảng, Bình Thạnh, Thành phố Hồ Chí Minh 70000, Việt Nam</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gray-800 p-3 rounded-lg mr-4">
                    <i className="fa-solid fa-phone text-xl text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300">Hotline</h4>
                    <p className="text-gray-400 mt-1">1900 1234 - 0987 654 321</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gray-800 p-3 rounded-lg mr-4">
                    <i className="fa-solid fa-envelope text-xl text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300">Email</h4>
                    <p className="text-gray-400 mt-1">support@diorbeautysephora.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bản đồ Google Maps */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex-1 min-h-[300px] relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2098922385603!2d106.71921687481827!3d10.795230289354679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175290b070839ad%3A0x9430efdfedc17208!2sDior%20Beauty%20%E2%80%93%20Vincom%20Landmark%2081%20Boutique!5e0!3m2!1sen!2sus!4v1769035798237!5m2!1sen!2sus"
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '350px' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </div>

          </div>
        </div>
      </div>
      
      {/* FontAwesome Icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}