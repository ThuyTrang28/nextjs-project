<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Category;
use App\Models\Topic;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Exception;

class MenuController extends Controller
{
    /**
     * 1. Lấy nguồn dữ liệu cho việc tạo Menu
     * Đảm bảo lấy đúng các trường id, name, slug từ bảng lntt_category
     */
    public function getSources()
    {
        try {
            // Lấy Category: Sử dụng status = 1 (Active) dựa trên hình ảnh DB của bạn
            $categories = Category::where('status', 1)
                ->orderBy('name', 'asc')
                ->get(['id', 'name', 'slug']);

            // Lấy Topic: Đảm bảo bảng Topic có các cột tương ứng
            $topics = Topic::where('status', 1)
                ->orderBy('name', 'asc')
                ->get(['id', 'name', 'slug']);

            // Lấy Page: Chuyển đổi 'title' thành 'name' để Frontend dễ xử lý đồng bộ
            $pages = Post::where('status', 1)
                ->where('post_type', 'page')
                ->orderBy('title', 'asc')
                ->get(['id', 'title as name', 'slug']);

            return response()->json([
                'status' => true,
                'data' => [
                    'categories' => $categories,
                    'topics'     => $topics,
                    'pages'      => $pages,
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi lấy nguồn dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 2. Danh sách Menu
     */
    public function index(Request $request)
    {
        try {
            $query = Menu::query();

            if ($request->has('position')) {
                $query->where('position', $request->position);
            }

            $menus = $query->orderBy('sort_order', 'asc')->get();

            return response()->json([
                'status' => true,
                'data'   => $menus,
            ], 200);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 3. Lưu Menu mới
     */
    public function store(Request $request)
    {
        // Validate nghiêm ngặt hơn
        $request->validate([
            'name'     => 'required|string|max:255',
            'link'     => 'required|string',
            'type'     => 'required|string',
            'position' => 'required|string',
        ]);

        try {
            $menu = new Menu();
            $menu->name       = $request->name;
            $menu->link       = $request->link; // Đây thường là slug từ category/topic
            $menu->type       = strtolower($request->type);
            $menu->position   = $request->position;
            $menu->parent_id  = $request->parent_id ?? 0;
            $menu->sort_order = $request->sort_order ?? 0;
            $menu->status     = 1;
            $menu->created_at = now();
            $menu->created_by = Auth::id() ?? 1;

            if ($menu->save()) {
                return response()->json([
                    'status' => true,
                    'message' => 'Thêm menu thành công',
                    'data' => $menu
                ], 201);
            }

            throw new Exception("Không thể lưu dữ liệu vào database.");

        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * 4. Cập nhật Menu
     */
    public function update(Request $request, $id)
    {
        try {
            $menu = Menu::findOrFail($id);

            // Cập nhật các trường cho phép
            $data = $request->only(['name', 'link', 'type', 'position', 'parent_id', 'sort_order', 'status']);
            $data['updated_at'] = now();
            $data['updated_by'] = Auth::id() ?? 1;

            $menu->update($data);

            return response()->json(['status' => true, 'message' => 'Cập nhật thành công'], 200);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * 5. Xóa Menu
     */
    public function destroy($id)
    {
        try {
            $menu = Menu::findOrFail($id);

            // Xử lý logic con: Nếu xóa menu cha, các menu con đưa về gốc (parent_id = 0)
            Menu::where('parent_id', $id)->update(['parent_id' => 0]);

            $menu->delete();
            return response()->json(['status' => true, 'message' => 'Xóa menu thành công'], 200);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy hoặc lỗi: ' . $e->getMessage()], 500);
        }
    }
}
