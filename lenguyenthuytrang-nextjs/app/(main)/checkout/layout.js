import React from 'react';

const CheckoutLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
           
            
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Đây là nơi các trang shipping, payment, confirmation sẽ được render */}
                {children}
            </main>
        </div>
    );
};

export default CheckoutLayout;