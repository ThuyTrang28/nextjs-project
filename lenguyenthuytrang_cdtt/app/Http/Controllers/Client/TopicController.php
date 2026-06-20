<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\Request;

class TopicController extends Controller
{
    /**
     * Lấy danh sách tất cả chủ đề (Dùng cho Menu hoặc Sidebar lọc)
     * URL: /api/client/topics
     */
    public function index()
    {
        try {
            // Lấy các chủ đề đang hiển thị (status = 1)
            // Sắp xếp theo thứ tự ưu tiên (sort_order)
            $topics = Topic::where('status', 1)
                ->orderBy('sort_order', 'asc')
                ->select('id', 'name', 'slug', 'sort_order') // Chỉ lấy các cột cần thiết
                ->get();

            return response()->json([
                'status' => true,
                'data' => $topics,
                'message' => 'Tải danh sách chủ đề thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * (Tùy chọn) Lấy thông tin chi tiết 1 chủ đề theo Slug
     * Dùng khi bạn muốn hiển thị SEO title/description cho trang danh mục
     * URL: /api/client/topics/{slug}
     */
    public function show($slug)
    {
        try {
            $topic = Topic::where('slug', $slug)
                ->where('status', 1)
                ->first();

            if (!$topic) {
                return response()->json(['status' => false, 'message' => 'Chủ đề không tồn tại'], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $topic
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

}
