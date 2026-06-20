"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/context/AuthContext"; 

export default function ShippingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);

    // --- HELPER FUNCTIONS ---
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/150";
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:8000/storage/${imagePath}`;
    };

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        note: ""
    });

    // 1. Load User và Giỏ hàng
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                note: ""
            });
        }

        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        } else {
            router.push('/cart'); 
        }
    }, [user, router]);

    // Tính toán tổng tiền
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shippingFee = subtotal > 50 ? 0 : 10;
    const totalAmount = subtotal + shippingFee;

    // 2. Xử lý nhập liệu
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Xử lý Chuyển trang (LƯU DATA & REDIRECT)
    const handleContinueToPayment = (e) => {
        e.preventDefault();
        
        // Lưu thông tin giao hàng vào LocalStorage để trang Payment dùng
        localStorage.setItem("shipping_info", JSON.stringify(formData));

        // Chuyển hướng sang trang thanh toán
        router.push("/checkout/payment");
    };

    if (!user) return <div className="text-center py-20">Checking login...</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Breadcrumb đơn giản */}
            <div className="flex items-center gap-2 text-sm mb-8">
                <span className="font-bold text-black">1. Shipping</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-400">2. Payment</span>
            </div>

            <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Shipping information</h1>
            
            <div className="flex flex-col md:flex-row gap-10">
                
                {/* --- CỘT TRÁI: FORM THÔNG TIN --- */}
                <div className="md:w-3/5">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-location-dot text-red-500"></i> Shipping address
                        </h2>
                        <form onSubmit={handleContinueToPayment} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Fullname</label>
                                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-black focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-black focus:outline-none" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-black focus:outline-none" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Detailed address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} required className="w-full border border-gray-300 p-2.5 rounded h-24 focus:ring-2 focus:ring-black focus:outline-none" placeholder="House number, street name, ward/commune..."></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Note (Optional)</label>
                                <textarea name="note" value={formData.note} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-black focus:outline-none" placeholder="Message for the delivery person..."></textarea>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-black text-white py-3.5 rounded-lg font-bold mt-6 hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2"
                            >
                                Continue to Payment <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG --- */}
                <div className="md:w-2/5">
                    <div className="bg-gray-50 p-6 rounded-lg sticky top-4 border border-gray-200">
                        <h2 className="font-bold text-xl mb-4 border-b pb-2">Your order ({cartItems.length})</h2>
                        
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
                                        <span className="absolute top-0 right-0 bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded-bl opacity-80">
                                            x{item.qty}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Unit price: {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <div className="text-sm font-bold text-black flex items-center">
                                        {formatPrice(item.price * item.qty)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tổng kết tiền */}
                        <div className="mt-6 pt-4 border-t-2 border-gray-200 space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping Fee:</span>
                                {shippingFee === 0 ? (
                                    <span className="text-green-600 font-bold">Freeship</span>
                                ) : (
                                    <span>{formatPrice(shippingFee)}</span>
                                )}
                            </div>
                            <div className="flex justify-between text-lg font-bold text-black pt-2 mt-2 border-t">
                                <span>Total:</span>
                                <span className="text-red-600">{formatPrice(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}