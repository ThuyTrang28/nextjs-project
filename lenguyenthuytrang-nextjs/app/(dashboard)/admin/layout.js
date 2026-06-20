// app/layout.js (Root Layout - Server Component)
// Không có "use client" ở đây

// SỬA LỖI: Sử dụng đường dẫn tuyệt đối (Absolute Path) để đảm bảo tìm thấy globals.css từ mọi vị trí
import "../../globals.css"; 

// Giả sử Header và Footer là các component đã được tối ưu hoặc là Client Component riêng biệt
import Header from "./components/header";
import Footer from "./components/footer";

export default function RootLayout({ children }) {
  // Root Layout (Server Component) không chứa logic Client-side như useState, toggle

  return (
    <html lang="vi">
      {/* SỬA LỖI: Thêm các class flex để đảm bảo Footer dính đáy (Sticky Footer):
        - flex flex-col: Thiết lập Flex container theo chiều dọc.
        - min-h-screen: Đảm bảo body chiếm ít nhất toàn bộ chiều cao màn hình.
      */}
      <body className="bg-white text-gray-900">
        
        <Header /> 
        
        {/* SỬA LỖI: Sử dụng flex-grow để main chiếm hết không gian trống 
          giữa Header và Footer, đẩy Footer xuống cuối.
        */}
        <main className="grow w-full max-w-7xl mx-auto px-4 py-8">
            {children}
        </main>
        
        <Footer />
        
      </body>
    </html>
  );
}