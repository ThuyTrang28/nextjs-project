<?php

namespace App\Http\Controllers\Admin;


use App\Http\Controllers\Controller;
use App\Models\Topic;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class TopicController extends Controller
{
    /**
     * Hiển thị danh sách chủ đề (có phân trang, tìm kiếm).
     */
    public function index(Request $request)
    {
        try {
            $query = Topic::query();

            $total = $query->count();

            // Tìm kiếm
            if ($request->has('search')) {
                $search = $request->search;
                $query->where('name', 'like', '%' . $search . '%');
            }

            // Phân trang & Giới hạn
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            $offset = ($page - 1) * $limit;

            $query->offset($offset);
            $query->limit($limit);

            // Sắp xếp
            $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc');
            $query->select('id', 'name', 'slug', 'sort_order', 'status', 'created_at');

            $topics = $query->get();

            $result = [
                'status' => true,
                'data' => $topics,
                'total' => $total,
                'message' => 'Tải dữ liệu chủ đề thành công',
                'error' => null,
            ];
            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi khi tải dữ liệu chủ đề: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lưu trữ một chủ đề mới (CREATE).
     */
    public function store(Request $request)
    {
        // 1. Validate - Đảm bảo dùng 'integer' thay vì các kiểu dữ liệu DB như 'unsignedTinyInteger'
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'required|string|unique:topic,slug',
            'sort_order'  => 'sometimes|nullable|integer|min:0',
            'description' => 'sometimes|nullable|string|max:255',
            'status'      => 'sometimes|integer|in:0,1',
        ]);

        try {
            // 2. Sử dụng dữ liệu đã validate để tránh nạp các trường lạ (Mass Assignment)
            $data = $validated;

            // 3. Xử lý người tạo và các giá trị mặc định
            $data['created_by'] = Auth::id() ?? 1; // Mặc định ID 1 nếu chưa login
            $data['sort_order'] = $data['sort_order'] ?? 0;
            $data['status']     = $data['status'] ?? 1;

            // 4. Thực hiện lưu thông qua Model
            $topic = Topic::create($data);

            return response()->json([
                'status'  => true,
                'data'    => $topic,
                'message' => 'Thêm chủ đề mới thành công!'
            ], 201);
        } catch (\Exception $e) {
            // Log lỗi hoặc trả về chi tiết để debug trong quá trình làm đồ án
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hiển thị chi tiết một chủ đề (READ).
     */
    public function show($id)
    {
        // Tải chi tiết chủ đề
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Không tìm thấy chủ đề'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $topic,
            'message' => 'Tải chi tiết chủ đề thành công'
        ], 200);
    }

    /**
     * Cập nhật thông tin chủ đề (UPDATE).
     */
    public function update(Request $request, $id)
    {
        // Tìm chủ đề trước khi validate
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy ID: ' . $id], 404);
        }

        try {
            // Validate dữ liệu
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => ['required', 'string', Rule::unique('topic', 'slug')->ignore($id)],
                'sort_order' => 'sometimes|integer|min:0',
                'description' => 'sometimes|nullable|string|max:255',
                'status' => 'sometimes|integer|in:0,1',
            ]);

            // Gán dữ liệu và xử lý người cập nhật
            $data = $request->all();
            $data['updated_by'] = Auth::id() ?? 1;

            $topic->update($data);

            return response()->json([
                'status' => true,
                'data' => $topic,
                'message' => 'Cập nhật thành công!'
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi dữ liệu', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Xóa một chủ đề (DELETE).
     */
    public function destroy($id)
    {
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Không tìm thấy chủ đề để xóa'
            ], 404);
        }

        $relatedPostsCount = Post::where('topic_id', $id)->count();
        if ($relatedPostsCount > 0) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => "Không thể xóa chủ đề này. Có {$relatedPostsCount} bài viết đang sử dụng chủ đề này."
            ], 409);
        }

        try {
            $topic->delete();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Xóa chủ đề thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi khi xóa chủ đề',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
