<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // ✅ Dùng thư viện Storage chuẩn
use Illuminate\Support\Facades\Log;

class BannerController extends Controller
{
    // Thư mục lưu trong Storage
    // Thực tế sẽ nằm tại: storage/app/public/images/banner
    // URL truy cập: domain.com/storage/images/banner
    protected $storageFolder = 'images/banner';

    public function index(Request $request)
    {
        $query = Banner::query();
        if ($request->filled('search')) $query->where('name', 'like', '%' . $request->search . '%');
        $query->orderBy('sort_order', 'asc')->orderBy('id', 'desc');
        $banners = $query->paginate($request->input('limit', 10));

        return response()->json(['status' => true, 'data' => $banners->items(), 'meta' => [
            'total' => $banners->total(),
            'per_page' => $banners->perPage(),
            'current_page' => $banners->currentPage(),
            'last_page' => $banners->lastPage(),
        ]], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'position' => 'required',
        ]);

        try {
            $data = $request->all();

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();

                // ✅ LƯU VÀO DISK PUBLIC (Tương đương storage/app/public/images/banner)
                // Lệnh này ngắn gọn và chuẩn Laravel nhất
                $file->storeAs($this->storageFolder, $filename, 'public');

                $data['image'] = $filename;
            }

            $data['created_by'] = Auth::id() ?? 1;
            $data['status'] = $request->input('status', 1);

            $banner = Banner::create($data);
            return response()->json(['status' => true, 'message' => 'Thêm thành công', 'data' => $banner], 201);

        } catch (\Exception $e) {
            Log::error("Store Banner Error: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, int $id)
    {
        $banner = Banner::findOrFail($id);
        if (!$banner) return response()->json(['status' => false, 'message' => 'Không tìm thấy'], 404);

        try {
            $data = $request->all();

            if ($request->hasFile('image')) {
                // Xóa ảnh cũ trong Storage
                if ($banner->image && Storage::disk('public')->exists($this->storageFolder . '/' . $banner->image)) {
                    Storage::disk('public')->delete($this->storageFolder . '/' . $banner->image);
                }

                // Lưu ảnh mới
                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->storeAs($this->storageFolder, $filename, 'public');

                $data['image'] = $filename;
            }

            $data['updated_by'] = Auth::id() ?? 1;
            $banner->update($data);

            return response()->json(['status' => true, 'message' => 'Cập nhật thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id)
    {
        $banner = Banner::findOrFail($id);
        if (!$banner) return response()->json(['status' => false, 'message' => 'Không tìm thấy'], 404);

        try {
            // Xóa ảnh trong Storage
            if ($banner->image && Storage::disk('public')->exists($this->storageFolder . '/' . $banner->image)) {
                Storage::disk('public')->delete($this->storageFolder . '/' . $banner->image);
            }

            $banner->delete();
            return response()->json(['status' => true, 'message' => 'Xóa thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
