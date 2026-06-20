<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File; // [QUAN TRỌNG] Import để xử lý file
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Sử dụng Eloquent + Eager Loading (with) thay vì Join thủ công phức tạp
            $query = Post::with('topic'); // Load quan hệ topic

            // --- LỌC/TÌM KIẾM ---
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%');
                });
            }

            if ($request->has('status') && $request->status !== null) {
                $query->where('status', $request->status);
            }

            // Sắp xếp
            $query->orderBy('created_at', 'desc');

            // Tổng số lượng (cho phân trang frontend nếu cần)
            $total = $query->count();

            // Phân trang
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            $offset = ($page - 1) * $limit;

            $query->offset($offset)->limit($limit);

            $posts = $query->get();

            // [TÙY CHỌN] Nếu frontend bắt buộc cần trường "topic_name" ở root object
            // Ta có thể map lại dữ liệu (Nếu frontend dùng post.topic.name thì không cần đoạn này)
            $posts->transform(function ($post) {
                $post->topic_name = $post->topic ? $post->topic->name : null;
                return $post;
            });

            return response()->json([
                'status' => true,
                'data' => $posts,
                'total' => $total,
                'message' => 'Tải dữ liệu thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        // 1. Validate
        $request->validate([
            'topic_id' => 'required|integer', // Có thể thêm |exists:topic,id nếu cần
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:post,slug', // Bảng post, cột slug
            'content' => 'required',
            'description' => 'nullable|string',
            'post_type' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'status' => 'integer|min:0|max:2',
        ]);

        try {
            // 2. Gán dữ liệu (Khớp chính xác với ảnh DB bạn gửi)
            $post = new Post();
            $post->topic_id = $request->topic_id;
            $post->title = $request->title;
            $post->slug = $request->slug;

            // ✅ SỬA LẠI ĐÚNG TÊN CỘT
            $post->content = $request->content;      // Cột trong DB là 'content'
            $post->post_type = $request->post_type;  // Cột trong DB là 'post_type'

            $post->description = $request->description;
            $post->status = $request->status;

            // Mặc định người tạo (nếu chưa có Auth thì để 1)
            $post->created_by = Auth::id() ?? 1;
            $post->updated_by = Auth::id() ?? 1;

            // 3. Xử lý Upload Ảnh
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $extension = $file->getClientOriginalExtension();
                $filename = date('YmdHis') . '_' . uniqid() . '.' . $extension;

                // Di chuyển file vào public/images/post
                $file->move(public_path('images/post'), $filename);

                // Lưu tên file vào DB
                $post->image = $filename;
            }

            $post->save();

            return response()->json([
                'status' => true,
                'data' => $post,
                'message' => 'Thêm bài viết thành công'
            ], 201);

        } catch (\Exception $e) {
            // Log lỗi ra để debug nếu vẫn bị 500
            Log::error("Lỗi thêm bài viết: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi Server: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) {
            return response()->json(['status' => false, 'message' => 'Bài viết không tồn tại'], 404);
        }

        $request->validate([
            // 1. Kiểm tra bảng Topic (Dùng Model class để an toàn)
            'topic_id' => ['required', \Illuminate\Validation\Rule::exists(\App\Models\Topic::class, 'id')],

            'title' => 'required|string|max:255',

            // 2. QUAN TRỌNG: Ignore ID hiện tại để không báo lỗi trùng Slug với chính nó
            'slug' => ['required', 'string', \Illuminate\Validation\Rule::unique(\App\Models\Post::class, 'slug')->ignore($post->id)],

            // 3. Đảm bảo tên trường khớp với Frontend (Frontend gửi 'content' thì ở đây phải là 'content')
            'content' => 'required',

            'post_type' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'status' => 'integer',
        ]);

        try {
            // Loại bỏ các trường không dùng để update trực tiếp
            $data = $request->except(['image', '_method']);
            $data['updated_by'] = Auth::id() ?? 1;

            // Xử lý ảnh
            if ($request->hasFile('image')) {
                // Xóa ảnh cũ
                if ($post->image && File::exists(public_path('images/post/' . $post->image))) {
                    File::delete(public_path('images/post/' . $post->image));
                }
                // Lưu ảnh mới
                $file = $request->file('image');
                $filename = date('YmdHis') . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('images/post'), $filename);
                $data['image'] = $filename;
            }

            $post->update($data);

            return response()->json([
                'status' => true,
                'data' => $post,
                'message' => 'Cập nhật thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $post = Post::find($id);
        if (!$post) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy bài viết'], 404);
        }

        try {
            // Xóa file ảnh trong thư mục
            if ($post->image && File::exists(public_path('images/post/' . $post->image))) {
                File::delete(public_path('images/post/' . $post->image));
            }

            $post->delete();

            return response()->json(['status' => true, 'message' => 'Xóa thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $post = Post::with('topic')->find($id);

        if (!$post) {
            return response()->json(['status' => false, 'message' => 'Not found'], 404);
        }
        return response()->json(['status' => true, 'data' => $post], 200);
    }
}
