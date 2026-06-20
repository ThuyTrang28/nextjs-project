<?php
namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Hiển thị danh sách người dùng (có phân trang, tìm kiếm và giới hạn).
     */
    public function index(Request $request)
    {
        try {
            $query = User::query();

            // Tìm kiếm theo tên, email hoặc số điện thoại
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%')
                      ->orWhere('phone', 'like', '%' . $search . '%')
                      ->orWhere('username', 'like', '%' . $search . '%'); // Thêm tìm theo username
                });
            }

            // Lọc theo vai trò (roles)
            if ($request->filled('roles') && $request->roles !== 'All') {
                $query->where('roles', $request->roles);
            }

            // Lấy tổng số lượng (sau khi lọc)
            $total = $query->count();

            // Sắp xếp mặc định
            $query->orderBy('created_at', 'desc');

            // Phân trang & Giới hạn
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            $offset = ($page - 1) * $limit;

            $query->offset($offset);
            $query->limit($limit);

            // Chọn các trường dữ liệu cần thiết để trả về API (bảo mật hơn select *)
            $query->select('id', 'name', 'email', 'phone', 'username', 'roles', 'status', 'avatar', 'created_at');

            $users = $query->get();

            return response()->json([
                'status' => true,
                'data' => $users,
                'total' => $total,
                'page' => (int)$page,
                'limit' => (int)$limit,
                'message' => 'Tải dữ liệu người dùng thành công',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải dữ liệu người dùng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lưu trữ một người dùng mới (CREATE).
     */
    public function store(Request $request)
    {
        // 1. Validate dữ liệu
        // Lưu ý: Tên bảng trong Rule::unique là 'user' (khớp với model của bạn),
        // mặc định Laravel là 'users'.
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:user,email',
            'phone' => 'required|string|max:20',
            'username' => 'required|string|max:255|unique:user,username',
            'password' => 'required|string|min:6|max:255',
            'roles' => 'sometimes|in:admin,customer',
            // SỬA LỖI: unsignedTinyInteger không phải rule, dùng integer|in:0,1
            'status' => 'sometimes|integer|in:0,1',
            'avatar' => 'sometimes|nullable|string|max:255',
        ], [
            // Custom thông báo lỗi tiếng Việt (Optional)
            'email.unique' => 'Email này đã được sử dụng.',
            'username.unique' => 'Tên đăng nhập đã tồn tại.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->except(['_token']); // Loại bỏ token nếu có

            // Mã hóa mật khẩu
            $data['password'] = Hash::make($request->password);

            // Giá trị mặc định
            $data['roles'] = $request->input('roles', 'customer');
            $data['status'] = $request->input('status', 1); // Mặc định là 1 (Active)
            $data['created_by'] = Auth::id() ?? 1; // ID 1 là fallback nếu chưa login

            $user = User::create($data);

            return response()->json([
                'status' => true,
                'data' => $user,
                'message' => 'Thêm người dùng thành công'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi thêm người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hiển thị chi tiết một người dùng (READ).
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng'], 404);
        }
        return response()->json(['status' => true, 'data' => $user], 200);
    }

    /**
     * Cập nhật thông tin (UPDATE).
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng để cập nhật'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('user', 'email')->ignore($id)],
            'phone' => 'sometimes|string|max:20',
            'username' => ['sometimes', 'string', 'max:255', Rule::unique('user', 'username')->ignore($id)],
            'password' => 'sometimes|nullable|string|min:6|max:255',
            'status' => 'sometimes|integer|in:0,1',
            'avatar' => 'sometimes|nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu cập nhật không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Chỉ lấy các trường được phép update
            $data = $request->except(['_token', '_method', 'created_at', 'created_by']);

            // Logic xử lý Password
            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            } else {
                // Nếu không gửi password hoặc password rỗng, xóa khỏi mảng data để không update đè
                unset($data['password']);
            }

            $data['updated_by'] = Auth::id() ?? ($user->updated_by ?? 1);

            $user->update($data);

            return response()->json([
                'status' => true,
                'data' => $user,
                'message' => 'Cập nhật người dùng thành công'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa một người dùng (DELETE).
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng'], 404);
        }

        // Ngăn chặn tự xóa tài khoản đang đăng nhập
        if (Auth::check() && Auth::id() == $id) {
            return response()->json([
                'status' => false,
                'message' => 'Không thể xóa tài khoản đang đăng nhập.'
            ], 403);
        }

        try {
            $user->delete();
            return response()->json(['status' => true, 'message' => 'Xóa người dùng thành công'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
