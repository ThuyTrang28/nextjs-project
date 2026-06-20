<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use App\Models\Product;
use App\Models\Post;

class HomeController extends Controller
{
    /**
     * Hiển thị dữ liệu cần thiết cho trang chủ (Home Page).
     */
    public function index()
    {
        // Lấy danh sách Banner cho Slideshow
        $slideshowBanners = Banner::where('position', 'slideshow')
                                    ->where('status', 1)
                                    ->orderBy('sort_order', 'asc')
                                    ->get();

        // Lấy 8 Sản phẩm nổi bật (có thể là sản phẩm mới nhất hoặc sản phẩm bán chạy)
        $featuredProducts = Product::where('status', 1)
                                    ->orderBy('created_at', 'desc')
                                    ->limit(8)
                                    ->get();

        // Lấy 3 Bài viết mới nhất
        $latestPosts = Post::where('status', 1)
                            ->orderBy('created_at', 'desc')
                            ->limit(3)
                            ->get();

        $data = [
            'banners' => $slideshowBanners,
            'featured_products' => $featuredProducts,
            'latest_posts' => $latestPosts,
        ];
        
        // Trả về response JSON hoặc view (tùy thuộc vào kiến trúc Front-end của bạn)
        return response()->json([
            'status' => true,
            'message' => 'Tải dữ liệu trang chủ thành công',
            'data' => $data
        ], 200);
    }
}