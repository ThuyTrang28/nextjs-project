<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    /**
     * Lấy danh sách banner (Có thể lọc theo position).
     * Mặc định chỉ lấy những banner có status = 1 (Hiện).
     */
    public function index(Request $request)
    {
        try {
            $query = Banner::where('status', 1); // Chỉ lấy banner đang bật

            // Lọc theo vị trí nếu có tham số truyền vào (vd: ?position=slideshow)
            if ($request->has('position')) {
                $query->where('position', $request->position);
            }

            // Sắp xếp: Ưu tiên số nhỏ lên trước, nếu trùng thì lấy cái mới nhất
            $query->orderBy('sort_order', 'asc')
                  ->orderBy('id', 'desc');

            // Giới hạn số lượng (nếu cần)
            if ($request->has('limit')) {
                $query->limit($request->limit);
            }

            $banners = $query->get();

            return response()->json([
                'status' => true,
                'data' => $banners,
                'message' => 'Tải dữ liệu banner thành công'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API chuyên biệt để lấy danh sách Slider (Slideshow).
     * Endpoint gợi ý: /api/banner/list/slideshow
     */
    public function list_slideshow()
    {
        try {
            $list = Banner::where('status', 1)
                ->where('position', 'slideshow')
                ->orderBy('sort_order', 'asc')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $list,
                'message' => 'Tải danh sách slideshow thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * API chuyên biệt để lấy danh sách Quảng cáo (Ads).
     * Endpoint gợi ý: /api/banner/list/ads
     */
    public function list_ads()
    {
        try {
            $list = Banner::where('status', 1)
                ->where('position', 'ads')
                ->orderBy('sort_order', 'asc')
                ->limit(3) // Ví dụ: chỉ lấy 3 quảng cáo
                ->get();

            return response()->json([
                'status' => true,
                'data' => $list,
                'message' => 'Tải danh sách quảng cáo thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy chi tiết 1 banner (để click xem hoặc tracking).
     */
    public function show($id)
    {
        $banner = Banner::find($id);

        if (!$banner || $banner->status != 1) {
            return response()->json([
                'status' => false,
                'message' => 'Banner không tồn tại hoặc đã bị ẩn'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $banner,
            'message' => 'Thành công'
        ], 200);
    }
}
