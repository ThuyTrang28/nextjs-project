<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // Thêm Log để debug nếu cần

class ContactController extends Controller
{
    /**
     * Lưu trữ thông tin liên hệ mới.
     */
    public function store(Request $request)
    {
        // 1. SỬA LỖI VALIDATION
        $validate = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'required|string|max:20',
            'title'   => 'nullable|string|max:255',
            'content' => 'required|string', // SỬA: Đổi 'mediumText' thành 'string'
        ]);

        try {
            $data = $request->all();

            // 2. GÁN GIÁ TRỊ MẶC ĐỊNH (Tránh lỗi: Field doesn't have a default value)
            $data['status'] = 1;      // 1: Chưa xử lý (Mặc định)
            $data['reply_id'] = 0;    // 0: Chưa có phản hồi

            // 3. XỬ LÝ NGƯỜI DÙNG
            if (Auth::check()) {
                $data['user_id'] = Auth::id();
                $data['created_by'] = Auth::id();
            } else {
                // Khách vãng lai
                $data['user_id'] = 0;     // BẮT BUỘC PHẢI CÓ dòng này
                $data['created_by'] = 0;
            }

            // Tạo bản ghi
            $contact = Contact::create($data);

            return response()->json([
                'status'  => true,
                'data'    => $contact,
                'message' => 'Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất.'
            ], 201);

        } catch (\Exception $e) {
            // Ghi log để biết lỗi gì (xem trong storage/logs/laravel.log)
            Log::error("Lỗi gửi liên hệ: " . $e->getMessage());

            return response()->json([
                'status'  => false,
                'data'    => null,
                'message' => 'Gửi liên hệ thất bại.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
