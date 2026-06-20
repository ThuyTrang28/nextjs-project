// app/layout.js
import "./globals.css";

export const metadata = {
  title: "DIOR Beauty | Sephora",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}