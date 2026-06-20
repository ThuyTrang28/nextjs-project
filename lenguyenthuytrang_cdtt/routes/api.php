<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\ProductStoreController;
use App\Http\Controllers\Admin\ProductSaleController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\TopicController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Client\HomeController;
use App\Http\Controllers\Admin\ConfigController;

use App\Http\Controllers\Client\CategoryController as ClientCategoryController;
use App\Http\Controllers\Client\ProductController as ClientProductController;
use App\Http\Controllers\Client\UserController as ClientUserController;
use App\Http\Controllers\Client\OrderController as ClientOrderController;
use App\Http\Controllers\Client\PostController as ClientPostController;
use App\Http\Controllers\Client\MenuController as ClientMenuController;
use App\Http\Controllers\Client\ContactController as ClientContactController;
use App\Http\Controllers\Client\TopicController as ClientTopicController;
use App\Http\Controllers\Client\BannerController as ClientBannerController;
use App\Http\Controllers\Client\VnpayController;

// Product routes
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::get('/products-new', [ProductController::class, 'product_new']);

// Category routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

Route::prefix('menus')->group(function () {
    // Phải đặt 'sources' lên ĐẦU TIÊN
    Route::get('sources', [MenuController::class, 'getSources']);

    // Sau đó mới đến các route khác
    Route::get('/', [MenuController::class, 'index']);
    Route::post('/', [MenuController::class, 'store']);
    Route::get('/{id}', [MenuController::class, 'show']);
    Route::put('/{id}', [MenuController::class, 'update']);
    Route::delete('/{id}', [MenuController::class, 'destroy']);
});

// Banner routes
Route::get('/banners', [BannerController::class, 'index']);
Route::post('/banners', [BannerController::class, 'store']);
Route::get('/banners/{id}', [BannerController::class, 'show']);
Route::put('/banners/{id}', [BannerController::class, 'update']);
Route::delete('/banners/{id}', [BannerController::class, 'destroy']);


// ProductStore routes (đồng nhất RESTful, sửa lỗi chính tả)
Route::get('/product-stores', [ProductStoreController::class, 'index']);
Route::post('/product-stores', [ProductStoreController::class, 'store']);
Route::get('/product-stores/{id}', [ProductStoreController::class, 'show']);
Route::put('/product-stores/{id}', [ProductStoreController::class, 'update']);
Route::delete('/product-stores/{id}', [ProductStoreController::class, 'destroy']);

// ProductSale routes (Đã thêm mới)
Route::get('/product-sales', [ProductSaleController::class, 'index']);
Route::post('/product-sales', [ProductSaleController::class, 'store']);
Route::get('/product-sales/{id}', [ProductSaleController::class, 'show']);
Route::put('/product-sales/{id}', [ProductSaleController::class, 'update']);
Route::delete('/product-sales/{id}', [ProductSaleController::class, 'destroy']);

// Order routes
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::put('/orders/{id}', [OrderController::class, 'update']);
Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

// Attribute routes
Route::get('/attributes', [AttributeController::class, 'index']);
Route::post('/attributes', [AttributeController::class, 'store']);
Route::get('/attributes/{id}', [AttributeController::class, 'show']);
Route::put('/attributes/{id}', [AttributeController::class, 'update']);
Route::delete('/attributes/{id}', [AttributeController::class, 'destroy']);

// Post routes
Route::get('/posts', [PostController::class, 'index']);      // Lấy danh sách bài viết
Route::post('/posts', [PostController::class, 'store']);     // Thêm bài viết mới
Route::get('/posts/{id}', [PostController::class, 'show']);  // Xem chi tiết bài viết
Route::put('/posts/{id}', [PostController::class, 'update']);// Cập nhật bài viết
Route::delete('/posts/{id}', [PostController::class, 'destroy']); // Xóa bài viết

// Topic routes
Route::get('/topics', [TopicController::class, 'index']);       // Lấy danh sách chủ đề
Route::post('/topics', [TopicController::class, 'store']);      // Tạo chủ đề mới
Route::get('/topics/{id}', [TopicController::class, 'show']);   // Xem chi tiết chủ đề
Route::put('/topics/{id}', [TopicController::class, 'update']); // Cập nhật chủ đề
Route::delete('/topics/{id}', [TopicController::class, 'destroy']); // Xóa chủ đề

// User routes (Quản lý thành viên)
Route::get('/users', [UserController::class, 'index']);       // Danh sách thành viên
Route::post('/users', [UserController::class, 'store']);      // Thêm thành viên mới
Route::get('/users/{id}', [UserController::class, 'show']);   // Xem chi tiết
Route::put('/users/{id}', [UserController::class, 'update']); // Cập nhật (Thông tin + Mật khẩu)
Route::delete('/users/{id}', [UserController::class, 'destroy']); // Xóa thành viên

// Contact routes (Quản lý Liên hệ/Phản hồi)
Route::get('/contacts', [ContactController::class, 'index']);       // Xem danh sách liên hệ
Route::get('/contacts/{id}', [ContactController::class, 'show']);   // Xem chi tiết (và cập nhật đã xem)
Route::put('/contacts/{id}', [ContactController::class, 'update']); // Phản hồi hoặc cập nhật trạng thái
Route::delete('/contacts/{id}', [ContactController::class, 'destroy']); // Xóa liên hệ

Route::get('/config', [ConfigController::class, 'show']);
Route::post('/config', [ConfigController::class, 'update']);

// Route lấy dữ liệu trang chủ
Route::get('/home', [HomeController::class, 'index']);

Route::get('/client/categories/menu', [ClientCategoryController::class, 'getMenu']);
Route::get('/client/categories', [ClientCategoryController::class, 'index']); // Lấy danh sách (cho trang All Categories)
Route::get('/client/categories/{slug}', [ClientCategoryController::class, 'show']); // Lấy chi tiết + sản phẩm

// CLIENT ROUTES
Route::get('/client/products/new', [ClientProductController::class, 'product_new']); // Sản phẩm mới
Route::get('/client/products/sale', [ClientProductController::class, 'product_sale']);
Route::get('/client/products/related/{id}', [ClientProductController::class, 'related']); // Sản phẩm liên quan
Route::get('/client/products', [ClientProductController::class, 'index']);           // Danh sách sản phẩm
Route::get('/client/products/{id}', [ClientProductController::class, 'show']);       // Chi tiết sản phẩm

Route::prefix('post')->group(function () {

    // 1. Lấy danh sách tất cả tin tức (có phân trang, search)
    Route::get('/', [ClientPostController::class, 'index']);

    // 2. Lấy bài viết mới nhất (cho trang chủ/sidebar)
    Route::get('/newest', [ClientPostController::class, 'getNewPosts']);

    // 3. Lấy bài viết theo Chủ đề (Topic slug)
    Route::get('/topic/{slug}', [ClientPostController::class, 'getPostByTopic']);

    // 4. Lấy chi tiết bài viết (Tin tức) theo slug
    Route::get('/detail/{slug}', [ClientPostController::class, 'getPostBySlug']);

    // 5. Lấy nội dung trang đơn (Giới thiệu, Chính sách...)
    Route::get('/page/{slug}', [ClientPostController::class, 'getPage']);
});

Route::get('menu-header', [ClientMenuController::class, 'getHeaderMenu']);
Route::get('menu-footer', [ClientMenuController::class, 'getFooterMenu']);
// Route Đăng nhập (Công khai)
Route::post('/register', [ClientUserController::class, 'register']);
Route::post('/login', [ClientUserController::class, 'login']);

// Các Route cần đăng nhập (Được bảo vệ bởi Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/client/user/profile', [ClientUserController::class, 'profile']);
    Route::put('/client/user/profile', [ClientUserController::class, 'updateProfile']);
    Route::post('/client/user/avatar', [ClientUserController::class, 'uploadAvatar']);
    Route::get('/client/user/orders', [ClientUserController::class, 'orders']);
    Route::post('/change-password', [ClientUserController::class, 'changePassword']);

    Route::post('/order/checkout', [ClientOrderController::class, 'store']);
    Route::get('/client/user/orders', [ClientOrderController::class, 'index']);
    Route::get('/client/user/orders/{id}', [ClientOrderController::class, 'show']);
    Route::put('/client/user/orders/{id}/cancel', [ClientOrderController::class, 'cancelOrder']);

    Route::post('/vnpay/create-payment/{orderId}', [VnpayController::class, 'createPayment']);
});

// VNPay chuyển hướng trình duyệt của người dùng / thực hiện các cuộc gọi máy chủ-đến-máy chủ , những thông tin này
// phải được giữ công khai - vnp_SecureHash đã được xác thực là thứ xác thực chúng.
Route::get('/vnpay/return', [VnpayController::class, 'returnUrl']);
Route::get('/vnpay/ipn', [VnpayController::class, 'ipn']);

Route::get('/email/verify/{id}/{hash}', [ClientUserController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

// 👇 (Tùy chọn) Route để gửi lại email xác thực nếu người dùng làm mất
Route::post('/email/verification-notification', [ClientUserController::class, 'resendVerificationEmail'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');


// Route gửi liên hệ
Route::post('/client/contact', [ClientContactController::class, 'store']);

Route::get('client/topics', [ClientTopicController::class, 'index']);
Route::get('client/topics/{slug}', [ClientTopicController::class, 'show']);

Route::prefix('banner')->group(function () {
    Route::get('/', [ClientBannerController::class, 'index']);
    Route::get('/list/slideshow', [CLientBannerController::class, 'list_slideshow']);
    Route::get('/list/ads', [ClientBannerController::class, 'list_ads']);
    Route::get('/show/{id}', [ClientBannerController::class, 'show']);
});
