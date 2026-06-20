<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Lấy danh sách menu tổng quát theo tham số truyền vào
     * Link gọi: /api/menu?position=mainmenu
     */
    public function index(Request $request)
    {
        try {
            $position = $request->input('position', 'mainmenu');

            $menus = Menu::where('status', 1)
                ->where('position', $position)
                ->where('parent_id', 0) // Lấy menu gốc
                ->orderBy('sort_order', 'asc')
                ->with(['children' => function ($query) {
                    // Lấy các menu con và sắp xếp chúng
                    $query->where('status', 1)->orderBy('sort_order', 'asc');
                }])
                ->get();

            return response()->json([
                'status' => true,
                'data' => $menus,
                'message' => 'Tải danh sách menu thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy menu cho Header (About Sephora, v.v.)
     */
    public function getHeaderMenu()
    {
        return $this->getMenuByPosition('mainmenu');
    }

    /**
     * Lấy menu cho Footer
     */
    public function getFooterMenu()
    {
        return $this->getMenuByPosition('footermenu');
    }

    /**
     * Hàm dùng chung để truy vấn theo vị trí
     */
    private function getMenuByPosition($position)
    {
        try {
            $data = Menu::where('status', 1)
                ->where('position', $position)
                ->where('parent_id', 0)
                ->with(['children' => function($q) {
                    $q->where('status', 1)->orderBy('sort_order', 'asc');
                }])
                ->orderBy('sort_order', 'asc')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
