<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Attribute::query();

            // 1. Tìm kiếm (Giữ nguyên)
            if($request->has('search')) {
                $search = $request->search;
                $query->where('name','like','%'.$search.'%');
            }

            // 2. [SỬA LẠI] Kiểm tra limit để lấy tất cả hoặc phân trang
            if ($request->input('limit') === 'all') {

                // --- TRƯỜNG HỢP LẤY HẾT (Cho Dropdown) ---
                $query->select('id', 'name'); // Chỉ lấy cột cần thiết
                $attributes = $query->orderBy('name', 'asc')->get();

                // Trả về cấu trúc giống phân trang nhưng không có total/per_page
                return response()->json([
                    'status' => true,
                    'data' => $attributes,
                    'message' => 'Tải tất cả thuộc tính thành công'
                ], 200);

            } else {

                // --- TRƯỜNG HỢP PHÂN TRANG (Mặc định) ---
                $total = $query->count();
                $limit = $request->input('limit', 10);
                $page = $request->input('page', 1);
                $offset = ($page - 1) * $limit;

                $query->offset($offset);
                $query->limit($limit);
                $query->orderBy('created_at', 'desc');
                $query->select(['id', 'name', 'slug', 'status', 'created_at']);

                $attributes = $query->get();

                return response()->json([
                    'status' => true,
                    'data' => $attributes,
                    'total' => $total,
                    'message' => 'Tải dữ liệu thuộc tính thành công',
                ], 200);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lưu trữ một thuộc tính mới (CREATE).
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:attribute,slug',
        ]);

        try {
            $data = $request->all();
            $data['created_by'] = Auth::id() ?? 1;
            $attribute = Attribute::create($data);

            return response()->json(['status' => true, 'data' => $attribute, 'message' => 'Thêm thuộc tính thành công'], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'data' => null, 'message' => 'Lỗi khi thêm thuộc tính', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Hiển thị chi tiết một thuộc tính (READ).
     */
    public function show($id)
    {
        $attribute = Attribute::find($id);

        if (!$attribute) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Không tìm thấy thuộc tính'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $attribute,
            'message' => 'Tải chi tiết thuộc tính thành công'
        ], 200);
    }

    /**
     * Cập nhật thông tin thuộc tính (UPDATE).
     */
    public function update(Request $request, $id)
    {
        $attribute = Attribute::find($id);

        if (!$attribute) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Không tìm thấy thuộc tính để cập nhật'
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:attribute,slug,' . $id,
            'status' => 'sometimes|unsignedTinyInteger|min:0|max:1',
        ]);

        try {
            $data = $request->all();
            $data['updated_by'] = Auth::id() ?? $attribute->updated_by;

            $attribute->update($data);

            return response()->json([
                'status' => true,
                'data' => $attribute,
                'message' => 'Cập nhật thuộc tính thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi khi cập nhật thuộc tính',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa một thuộc tính (DELETE).
     */
    public function destroy($id)
    {
        $attribute = Attribute::find($id);

        if (!$attribute) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Không tìm thấy thuộc tính để xóa'
            ], 404);
        }

        try {
            $attribute->delete();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Xóa thuộc tính thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi khi xóa thuộc tính',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
