import React from 'react';

// Component Card Thống kê
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex items-center justify-between transition-transform hover:scale-[1.02] duration-300">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color} text-white`}>
            <i className={`fa-solid ${icon} text-xl`}></i>
        </div>
    </div>
);

// Dữ liệu mock
const mockStats = [
    { title: 'Tổng Doanh số (30 ngày)', value: '$124,560', icon: 'fa-dollar-sign', color: 'bg-green-600' },
    { title: 'Đơn hàng mới', value: '452', icon: 'fa-truck-fast', color: 'bg-blue-600' },
    { title: 'Người dùng mới', value: '1,200', icon: 'fa-user-plus', color: 'bg-amber-500' },
    { title: 'Sản phẩm hết hàng', value: '12', icon: 'fa-triangle-exclamation', color: 'bg-red-600' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">Bảng Điều khiển Quản trị</h1>

            {/* 1. Các Thống kê Chính */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockStats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* 2. Biểu đồ & Bảng gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Biểu đồ Doanh số (Mock) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">Phân tích Doanh số 6 tháng</h2>

                    {/* --- VÙNG BIỂU ĐỒ ĐƯỜNG ẢO --- */}
                    <div className="h-64 relative bg-white p-4 rounded-lg">
                        {/* Trục X và Trục Y (Đơn giản hóa) */}
                        <div className="absolute inset-0 p-4">
                            {/* Trục Y */}
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 ml-4"></div>
                            {/* Trục X */}
                            <div className="absolute bottom-4 left-0 right-0 h-px bg-gray-300 mx-4"></div>

                            {/* Nhãn Trục Y (Tăng dần) */}
                            <span className="absolute left-0 top-4 text-xs text-gray-500">Cao</span>
                            <span className="absolute left-0 bottom-6 text-xs text-gray-500">Thấp</span>

                            {/* Nhãn Trục X (6 tháng) */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between mx-6 text-xs text-gray-500">
                                <span>T1</span>
                                <span>T2</span>
                                <span>T3</span>
                                <span>T4</span>
                                <span>T5</span>
                                <span>T6</span>
                            </div>
                        </div>

                        {/* Đường biểu đồ và các điểm dữ liệu */}
                        <div className="relative w-full h-full pt-2 pb-6 px-6">
                            {/* Đường Biểu đồ (Sử dụng SVG) */}
                            <div className="absolute inset-0">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    {/* Đường mô phỏng tăng trưởng */}
                                    <polyline
                                        fill="none"
                                        stroke="#10B981" // Màu xanh lá cây (Emerald)
                                        strokeWidth="2"
                                        points="0,80 20,70 40,55 60,30 80,45 100,10"
                                    />
                                </svg>
                            </div>

                            {/* Các điểm dữ liệu */}
                            <div className="absolute top-[80%] left-[4%] w-2 h-2 rounded-full bg-[#10B981] shadow-md"></div>
                            <div className="absolute top-[70%] left-[24%] w-2 h-2 rounded-full bg-[#10B981] shadow-md"></div>
                            <div className="absolute top-[55%] left-[44%] w-2 h-2 rounded-full bg-[#10B981] shadow-md"></div>
                            <div className="absolute top-[30%] left-[64%] w-2 h-2 rounded-full bg-[#10B981] shadow-md"></div>
                            <div className="absolute top-[45%] left-[84%] w-2 h-2 rounded-full bg-[#10B981] shadow-md"></div>
                            <div className="absolute top-[10%] left-[98%] w-2 h-2 rounded-full bg-[#10B981] shadow-md"></div>
                        </div>
                    </div>
                    {/* --- KẾT THÚC VÙNG BIỂU ĐỒ ĐƯỜNG ẢO --- */}

                </div>

                {/* Hoạt động gần đây */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800">Hoạt động Gần đây</h2>
                    <ul className="space-y-3 text-sm">
                        <li className="p-2 border-b">Đơn hàng #345 vừa được tạo.</li>
                        <li className="p-2 border-b text-blue-600">User mới: Jane Doe đã đăng ký.</li>
                        <li className="p-2 border-b">Sản phẩm 'Son Velvet' đã được cập nhật.</li>
                        <li className="p-2 text-red-600">Đơn hàng #340 bị hủy.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}