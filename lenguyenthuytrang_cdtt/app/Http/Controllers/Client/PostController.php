<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Topic;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Lấy danh sách bài viết (Tin tức/Blog)
     * Thường dùng cho trang "Tin tức"
     */
    public function index(Request $request)
    {
        try {
            // Mặc định chỉ lấy bài viết có status = 1 (Xuất bản) và kiểu là 'post'
            $query = Post::with('topic')
                ->where('status', 1)
                ->where('post_type', 'post');

            // --- LỌC THEO CHỦ ĐỀ (Nếu frontend gửi topic_id lên) ---
            if ($request->has('topic_id')) {
                $query->where('topic_id', $request->topic_id);
            }

            // --- TÌM KIẾM ---
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where('title', 'like', '%' . $search . '%');
            }

            // Sắp xếp: Mới nhất lên đầu
            $query->orderBy('created_at', 'desc');

            // Phân trang
            $limit = $request->input('limit', 10);
            $posts = $query->paginate($limit); // Sử dụng paginate() của Laravel trả về meta data đầy đủ hơn

            return response()->json([
                'status' => true,
                'data' => $posts,
                'message' => 'Tải danh sách bài viết thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy chi tiết bài viết theo SLUG (Tốt cho SEO)
     * URL: /api/post/detail/{slug}
     */
    public function getPostBySlug($slug)
    {
        try {
            $post = Post::with('topic')
                ->where('slug', $slug)
                ->where('status', 1) // Chỉ lấy bài đang active
                ->where('post_type', 'post')
                ->first();

            if (!$post) {
                return response()->json(['status' => false, 'message' => 'Bài viết không tồn tại hoặc đã bị ẩn'], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $post,
                'message' => 'Thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy bài viết theo CHỦ ĐỀ (Slug của Topic)
     * Dùng khi user click vào menu chủ đề (VD: Tin Công Nghệ)
     */
    public function getPostByTopic($topicSlug, Request $request)
    {
        try {
            // 1. Tìm Topic theo slug
            $topic = Topic::where('slug', $topicSlug)->where('status', 1)->first();

            if (!$topic) {
                return response()->json(['status' => false, 'message' => 'Chủ đề không tồn tại'], 404);
            }

            // 2. Lấy bài viết thuộc topic đó
            $limit = $request->input('limit', 10);
            $posts = Post::where('topic_id', $topic->id)
                ->where('status', 1)
                ->where('post_type', 'post')
                ->orderBy('created_at', 'desc')
                ->paginate($limit);

            return response()->json([
                'status' => true,
                'data' => $posts,
                'topic_name' => $topic->name, // Trả thêm tên chủ đề để hiển thị tiêu đề trang
                'message' => 'Tải bài viết theo chủ đề thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy bài viết MỚI NHẤT (Thường dùng cho Home page hoặc Sidebar)
     */
    public function getNewPosts(Request $request)
    {
        $limit = $request->input('limit', 5); // Mặc định lấy 5 bài

        $posts = Post::where('status', 1)
            ->where('post_type', 'post')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => true,
            'data' => $posts,
            'message' => 'Tải bài viết mới nhất thành công'
        ], 200);
    }

    /**
     * Lấy Trang đơn (Page) - VD: Giới thiệu, Liên hệ...
     * Khác với 'post', 'page' thường không có topic và đứng độc lập
     */
    public function getPage($slug)
    {
        $page = Post::where('slug', $slug)
            ->where('status', 1)
            ->where('post_type', 'page') // Lọc loại trang đơn
            ->first();

        if (!$page) {
            return response()->json(['status' => false, 'message' => 'Trang không tồn tại'], 404);
        }

        return response()->json(['status' => true, 'data' => $page], 200);
    }
}
