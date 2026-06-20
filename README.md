# nextjs-project

Repo gồm 2 phần:

- `lenguyenthuytrang-nextjs/` — frontend Next.js (giao diện khách hàng, checkout, thanh toán...)
- `lenguyenthuytrang_cdtt/` — backend Laravel API (đơn hàng, thanh toán, VNPay...)

## 1. Lấy code về

Clone lần đầu:

```bash
git clone https://github.com/ThuyTrang28/nextjs-project.git
cd nextjs-project
```

Đã có repo sẵn, muốn lấy code mới nhất từ `main`:

```bash
git checkout main
git pull origin main
```

Cài đặt phụ thuộc cho từng phần:

```bash
# Backend
cd lenguyenthuytrang_cdtt
composer install
cp .env.example .env   # rồi điền các giá trị cần thiết (xem mục 3)
php artisan key:generate
php artisan migrate

# Frontend
cd ../lenguyenthuytrang-nextjs
npm install
```

## 2. Quy trình tạo nhánh & merge vào `main`

Luôn tạo nhánh mới từ `main` cho mỗi tính năng/sửa lỗi, không commit thẳng vào `main`:

```bash
git checkout main
git pull origin main
git checkout -b ten-nhanh-moi
```

Sau khi code xong:

```bash
git add .
git commit -m "Mô tả ngắn thay đổi"
git push -u origin ten-nhanh-moi
```

Merge vào `main` (chọn 1 trong 2 cách):

- **Qua GitHub (khuyến nghị):** vào repo trên GitHub → tạo Pull Request từ nhánh vừa push vào `main` → review → Merge.
- **Merge cục bộ:**
  ```bash
  git checkout main
  git pull origin main
  git merge ten-nhanh-moi
  git push origin main
  ```

Sau khi đã merge, có thể xoá nhánh cũ:

```bash
git branch -d ten-nhanh-moi
git push origin --delete ten-nhanh-moi
```

## 3. Cấu hình & kiểm tra thanh toán VNPay (sandbox)

### 3.1. Biến môi trường backend (`lenguyenthuytrang_cdtt/.env`)

```
VNPAY_TMN_CODE=            # mã website do VNPay cấp khi đăng ký merchant sandbox
VNPAY_HASH_SECRET=         # chuỗi bí mật do VNPay cấp kèm TMN code
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost/lenguyenthuytrang_cdtt/public/api/vnpay/return
VNPAY_IPN_URL=http://localhost/lenguyenthuytrang_cdtt/public/api/vnpay/ipn
VNPAY_VERSION=2.1.0
VNPAY_LOCALE=vn
VNPAY_CURRENCY=VND

FRONTEND_URL=http://localhost:3000
```

Sửa `VNPAY_RETURN_URL`/`VNPAY_IPN_URL` cho khớp với host:port thật khi chạy `php artisan serve` (ví dụ `http://127.0.0.1:8000/api/vnpay/return`).

### 3.2. Đăng nhập cổng merchant sandbox VNPay

Trang quản trị merchant (xem giao dịch test, cấu hình): 

https://sandbox.vnpayment.vn/merchantv2/Users/Login.htm

Đăng nhập bằng tài khoản merchant sandbox đã đăng ký cho `VNPAY_TMN_CODE` ở trên (tài khoản này do người tạo TMN code cung cấp, không phải tài khoản VNPay cá nhân). Nếu project chưa có tài khoản sandbox riêng, có thể tự đăng ký mới tại trang đăng ký merchant sandbox của VNPay để lấy TMN code + Hash Secret test.

### 3.3. Chạy thử luồng thanh toán

1. Chạy backend: `php artisan serve` (trong `lenguyenthuytrang_cdtt`)
2. Chạy frontend: `npm run dev` (trong `lenguyenthuytrang-nextjs`)
3. Đăng nhập tài khoản người dùng trên frontend, tạo một đơn hàng, vào trang thanh toán (`/checkout/payment`) → bấm thanh toán VNPay.
4. Frontend gọi `ClientVnpayService.createPayment(orderId)` → backend trả `payment_url` → trình duyệt được chuyển sang trang thanh toán sandbox của VNPay.
5. Trên trang VNPay, chọn ngân hàng test **NCB** và nhập thông tin thẻ test do VNPay công bố cho sandbox (kiểm tra lại trên trang VNPay/dashboard merchant vì VNPay có thể thay đổi):
   - Số thẻ: `9704198526191432198`
   - Tên chủ thẻ: `NGUYEN VAN A`
   - Ngày phát hành: `07/15`
   - OTP: `123456`
6. Thanh toán xong, VNPay redirect về `GET /api/vnpay/return` → backend xác thực `vnp_SecureHash` → redirect tiếp về frontend `/checkout/result?status=...&order_id=...`.
7. Kiểm tra đơn hàng đã chuyển `payment_status = paid` trong trang lịch sử đơn hàng (`/checkout/history/[id]`).

**Lưu ý:** route IPN (`/api/vnpay/ipn`) là gọi server-to-server từ VNPay, sẽ **không** gọi được tới `localhost` — chỉ hoạt động khi backend có URL public (deploy thật, hoặc dùng ngrok/cloudflared khi cần test IPN cụ thể). Khi chạy local, việc xác nhận thanh toán vẫn đi qua route `return` nên không ảnh hưởng tới luồng test thông thường.
