"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/context/AuthContext";
import ClientOrderService from "@/services/ClientOrderService"; 

export default function PaymentPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [shippingInfo, setShippingInfo] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [loading, setLoading] = useState(false);

    // --- HELPER FUNCTIONS ---
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/150";
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:8000/storage/${imagePath}`;
    };

    // 1. Load Data từ LocalStorage
    useEffect(() => {
        // Kiểm tra giỏ hàng
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        } else {
            router.push('/cart');
            return;
        }

        // Kiểm tra thông tin Shipping
        const storedShipping = localStorage.getItem('shipping_info');
        if (storedShipping) {
            setShippingInfo(JSON.parse(storedShipping));
        } else {
            alert("Vui lòng nhập thông tin giao hàng trước!");
            router.push('/checkout/shipping');
        }
    }, [router]);

    // Tính toán tổng tiền
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shippingFee = subtotal > 50 ? 0 : 10;
    const totalAmount = subtotal + shippingFee;

    // 2. Xử lý ĐẶT HÀNG (API CALL)
    const handlePlaceOrder = async () => {
        if (!shippingInfo) return;
        setLoading(true);

        const orderPayload = {
            ...shippingInfo, // Bung thông tin từ bước 1
            payment_method: paymentMethod, // Thêm phương thức thanh toán
            items: cartItems.map(item => ({
                product_id: item.id,
                qty: item.qty,
                price: item.price
            }))
        };

        try {
            const response = await ClientOrderService.checkout(orderPayload);
            
            if (response.data.status) {
                // 👇 BỔ SUNG ĐOẠN NÀY ĐỂ LẤY ID
                const newOrder = response.data.order; 
                const orderId = newOrder ? newOrder.id : null; 
                // ------------------------------------

                alert("Đặt hàng thành công!");
                localStorage.removeItem('cart');
                localStorage.removeItem('shipping_info');
                window.dispatchEvent(new Event('cart-updated'));
                
                // Bây giờ biến orderId đã tồn tại, code dưới sẽ chạy đúng
                if (orderId) {
                    router.push(`/checkout/history/${orderId}`);
                } else {
                    router.push('/checkout/history');
                }
            }
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);
            alert("Đặt hàng thất bại: " + (error.response?.data?.message || "Lỗi hệ thống"));
        } finally {
            setLoading(false);
        }
    };

    if (!user || !shippingInfo) return <div className="text-center py-20">Loading Information...</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-8">
                <span className="text-gray-500">1. Shipping</span>
                <span className="text-gray-400">/</span>
                <span className="font-bold text-black">2. Payment</span>
            </div>

            <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Payment method</h1>
            
            <div className="flex flex-col md:flex-row gap-10">
                
                {/* --- CỘT TRÁI: CHỌN THANH TOÁN --- */}
                <div className="md:w-3/5 space-y-6">
                    
                    {/* Hiển thị lại thông tin giao hàng để kiểm tra */}
                    <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-base">Deliver to:</h3>
                            <button onClick={() => router.push('/checkout/shipping')} className="text-blue-600 underline text-xs">Edit</button>
                        </div>
                        <p><span className="font-semibold">Fullname:</span> {shippingInfo.name} ({shippingInfo.phone})</p>
                        <p><span className="font-semibold">Email:</span> {shippingInfo.email}</p>
                        <p><span className="font-semibold">Address:</span> {shippingInfo.address}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <i className="fa-regular fa-credit-card text-black"></i> Choose method
                        </h2>
                        <div className="space-y-3">
                            {/* COD */}
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    value="cod" 
                                    checked={paymentMethod === 'cod'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-3 w-5 h-5 accent-black"
                                />
                                <div className="flex-1">
                                    <span className="font-semibold block">Cash on delivery (COD)</span>
                                    <span className="text-sm text-gray-500">You only have to pay when you receive the goods</span>
                                </div>
                                <i className="fa-solid fa-money-bill-wave text-gray-400 text-2xl"></i>
                            </label>

                            {/* Banking / Card */}
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    value="card" 
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mr-3 w-5 h-5 accent-black"
                                />
                                <div className="flex-1">
                                    <span className="font-semibold block">Bank transfer / VNPAY</span>
                                    <span className="text-sm text-gray-500">Scan the QR code for quick payment</span>
                                </div>
                                <i className="fa-solid fa-qrcode text-gray-400 text-2xl"></i>
                            </label>
                        </div>

                        {/* Nút Đặt hàng */}
                        <button 
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className={`w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg mt-8 hover:bg-red-700 transition shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <span><i className="fa-solid fa-spinner fa-spin mr-2"></i> Processing...</span>
                            ) : `Place Order (${formatPrice(totalAmount)})`}
                        </button>
                    </div>
                </div>

                {/* --- CỘT PHẢI: TÓM TẮT (Giống trang Shipping nhưng rút gọn hơn nếu muốn) --- */}
                <div className="md:w-2/5">
                    <div className="bg-gray-50 p-6 rounded-lg sticky top-4 border border-gray-200">
                        <h2 className="font-bold text-xl mb-4 border-b pb-2">Order ({cartItems.length} dish)</h2>
                        
                        {/* List sản phẩm */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 mb-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0 last:mb-0">
                                    <div className="w-16 h-16 bg-white rounded border border-gray-200 overflow-hidden shrink-0 relative">
                                        <img 
                                            src={getImageUrl(item.image || item.thumbnail)} 
                                            alt={item.name} 
                                            className="w-full h-full object-contain mix-blend-multiply"
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
                                        />
                                        <span className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded-bl opacity-80">x{item.qty}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                                        <p className="text-xs text-gray-500">Unit price: {formatPrice(item.price)}</p>
                                    </div>
                                    <div className="text-sm font-bold text-black flex items-center">
                                        {formatPrice(item.price * item.qty)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t-2 border-gray-200 space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping fee:</span>
                                {shippingFee === 0 ? <span className="text-green-600 font-bold">Freeship</span> : <span>{formatPrice(shippingFee)}</span>}
                            </div>
                            <div className="flex justify-between text-lg font-bold text-black pt-2 mt-2 border-t">
                                <span>Total payment:</span>
                                <span className="text-red-600">{formatPrice(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}