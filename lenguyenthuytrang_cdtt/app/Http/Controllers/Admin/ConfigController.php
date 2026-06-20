<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Config;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    public function show()
    {
        try {
            $config = Config::first(); 
            
            if (!$config) {
                 return response()->json(['status' => false, 'data' => null, 'message' => 'Chưa có cấu hình nào được thiết lập'], 404);
            }
            
            return response()->json(['status' => true, 'data' => $config, 'message' => 'Tải cấu hình thành công'], 200);

        } catch (\Exception $e) {
             return response()->json(['status' => false, 'message' => 'Lỗi khi tải cấu hình', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request)
    {
        $request->validate([
            'site_name' => 'required|string|max:255',
            'hotline' => 'required|string|max:20',
        ]);
        
        try {
            $config = Config::updateOrCreate(
                ['id' => 1], 
                $request->all()
            );

            return response()->json(['status' => true, 'data' => $config, 'message' => 'Cập nhật cấu hình thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'data' => null, 'message' => 'Lỗi khi cập nhật cấu hình', 'error' => $e->getMessage()], 500);
        }
    }
}