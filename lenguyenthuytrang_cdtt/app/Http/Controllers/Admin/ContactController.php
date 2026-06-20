<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    /**
     * Hiển thị danh sách liên hệ/phản hồi (có phân trang, tìm kiếm và JOIN User).
     */
    public function index(Request $request)
    {
        try {
            $query = Contact::query();

            $query->leftJoin('user', 'user.id', '=', 'contact.user_id');

            $total = $query->count();

            // Tìm kiếm
            if($request->has('search'))
            {
                $search = $request->search;
                $query->where('contact.name','like','%'.$search.'%')
                      ->orWhere('contact.email','like','%'.$search.'%')
                      ->orWhere('contact.phone','like','%'.$search.'%');
            }

            // Phân trang & Giới hạn
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            $offset = ($page - 1) * $limit;

            $query->offset($offset);
            $query->limit($limit);

            // Sắp xếp
            $query->orderBy('contact.created_at', 'desc');
            $query->select(
                'contact.id',
                'contact.name',
                'contact.email',
                'contact.phone',
                'contact.content',
                'contact.status',
                'contact.reply_id',
                'user.name as user_account_name',
                'contact.created_at'
            );

            $contacts = $query->get();

            $result = [
                'status' => true,
                'data' => $contacts,
                'total' => $total,
                'message' => 'Tải dữ liệu liên hệ thành công',
                'error' => null,
            ];
            return response()->json($result, 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi khi tải dữ liệu liên hệ: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hiển thị chi tiết một liên hệ (READ).
     */
    public function show($id)
    {
        $contact = Contact::with('user')->find($id);

        if (!$contact) {
            return response()->json(['status' => false, 'data' => null, 'message' => 'Không tìm thấy liên hệ'], 404);
        }

        if ($contact->status == 1) {
            $contact->update(['status' => 2]);
        }

        return response()->json(['status' => true, 'data' => $contact, 'message' => 'Tải chi tiết liên hệ thành công'], 200);
    }

    /**
     * Cập nhật trạng thái hoặc thêm nội dung phản hồi (UPDATE).
     * Thường chỉ admin mới dùng hàm này.
     */
    public function update(Request $request, $id)
    {
        $contact = Contact::find($id);

        if (!$contact) {
            return response()->json(['status' => false, 'data' => null, 'message' => 'Không tìm thấy liên hệ để cập nhật'], 404);
        }

        $request->validate([
            'status' => ['sometimes', 'unsignedTinyInteger', Rule::in([1, 2, 3])],
            'reply_content' => 'sometimes|nullable|mediumText',
        ]);

        try {
            $data = $request->only(['status', 'reply_content']);

            if ($request->has('reply_content')) {
                $data['reply_id'] = Auth::id() ?? $contact->reply_id;
                $data['status'] = 3;
            }

            $contact->update($data);

            return response()->json([
                'status' => true,
                'data' => $contact,
                'message' => 'Cập nhật liên hệ thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi khi cập nhật liên hệ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa một liên hệ (DELETE).
     */
    public function destroy($id)
    {
        $contact = Contact::find($id);

        if (!$contact) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Không tìm thấy liên hệ để xóa'
            ], 404);
        }

        try {
            $contact->delete();

            return response()->json([
                'status' => true,
                'data' => null,
                'message' => 'Xóa liên hệ thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => null,
                'message' => 'Lỗi khi xóa liên hệ',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
