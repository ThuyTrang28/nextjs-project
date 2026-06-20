"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientOrderService from "@/services/ClientOrderService";
import { useAuth } from "../../components/context/AuthContext";

// Helper format tiền
const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function OrderHistoryPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await ClientOrderService.getHistory(); // Gọi API lấy list
                if (response.data.status) {
                    setOrders(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (!user) return <div className="text-center py-20">Please log in to view your history.</div>;
    if (loading) return <div className="text-center py-20">Loading data...</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-8">Order history</h1>

            {orders.length === 0 ? (
                <div className="text-center bg-gray-50 p-10 rounded">
                    <p className="text-gray-500 mb-4">You don't have any orders.</p>
                    <Link href="/" className="text-blue-600 hover:underline">Go shopping now &rarr;</Link>
                </div>
            ) : (
                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Order code</th>
                                    <th className="px-6 py-4">Order date</th>
                                    <th className="px-6 py-4">Total amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Operation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-black">#{order.id}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-red-600">
                                            {/* Giả sử bạn lưu tổng tiền vào order, hoặc tính lại */}
                                            {/* Ở đây hiển thị tạm text nếu chưa có cột total trong bảng orders */}
                                            View Detail
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                // Cấu hình hiển thị cho từng trạng thái
                                                const statusConfig = {
                                                    0: { label: 'Canceled', color: 'bg-red-100 text-red-800', icon: 'fa-xmark' },
                                                    1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: 'fa-clock' },
                                                    2: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: 'fa-gears' },
                                                    3: { label: 'Delivering', color: 'bg-indigo-100 text-indigo-800', icon: 'fa-truck' },
                                                    4: { label: 'Complete', color: 'bg-green-100 text-green-800', icon: 'fa-check' },
                                                };

                                                // Lấy config dựa trên order.status, nếu không có thì mặc định
                                                const config = statusConfig[order.status] || { label: 'Unclear', color: 'bg-gray-100 text-gray-800' };

                                                return (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${config.color}`}>
                                                        {/* Nếu bạn muốn hiện icon thì bỏ comment dòng dưới */}
                                                        {/* <i className={`fa-solid ${config.icon}`}></i> */}
                                                        {config.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link 
                                                href={`/checkout/history/${order.id}`} 
                                                className="text-blue-600 hover:underline font-semibold"
                                            >
                                                View Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}