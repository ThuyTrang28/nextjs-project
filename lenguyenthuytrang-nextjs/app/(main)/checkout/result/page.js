"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientVnpayService from '@/services/ClientVnpayService';

export default function PaymentResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');
    const message = searchParams.get('message');
    const isSuccess = status === 'success';

    const handleRetry = async () => {
        if (!orderId) {
            router.push('/checkout/history');
            return;
        }
        try {
            const res = await ClientVnpayService.createPayment(orderId);
            window.location.href = res.data.payment_url;
        } catch (error) {
            alert(error.response?.data?.message || "Không thể tạo lại link thanh toán.");
            router.push(`/checkout/history/${orderId}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
            <div className="bg-white rounded-lg border shadow-sm p-10">
                {isSuccess ? (
                    <>
                        <i className="fa-solid fa-circle-check text-6xl text-green-500 mb-4"></i>
                        <h1 className="text-2xl font-bold mb-2">Thanh toán thành công!</h1>
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-circle-xmark text-6xl text-red-500 mb-4"></i>
                        <h1 className="text-2xl font-bold mb-2">Thanh toán không thành công</h1>
                    </>
                )}

                <p className="text-gray-500 mb-8">
                    {message || (isSuccess ? "Cảm ơn bạn đã mua hàng." : "Đã có lỗi xảy ra trong quá trình thanh toán.")}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {orderId && (
                        <Link
                            href={`/checkout/history/${orderId}`}
                            className="px-6 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition"
                        >
                            Xem đơn hàng
                        </Link>
                    )}
                    {!isSuccess && orderId && (
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                        >
                            Thanh toán lại
                        </button>
                    )}
                    <Link href="/" className="px-6 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </div>
    );
}
