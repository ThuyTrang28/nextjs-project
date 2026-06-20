<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;
use Illuminate\Validation\Rule;
use Illuminate\Auth\Events\Registered;

class UserController extends Controller
{
    public function __construct()
    {
        // ✅ QUAN TRỌNG: Đã thêm 'verifyEmail' vào ngoại lệ
        $this->middleware('auth:sanctum')->except(['login', 'register', 'verifyEmail']);
    }

    /**
     * Đăng ký tài khoản mới.
     */
    public function register(Request $request)
    {
        try {
            // 1. Validate Input
            $request->validate([
                'name' => 'required|string|max:255',
                'username' => [
                    'required',
                    'string',
                    'max:50',
                    'alpha_dash', // alpha_dash allows letters, numbers, dashes, underscores
                    Rule::unique(User::class),
                ],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique(User::class),
                ],
                'password' => 'required|string|min:6|confirmed', // 'confirmed' looks for password_confirmation field
                'phone' => 'nullable|string|max:20', // Changed validation to nullable
            ], [
                'username.unique' => 'Tên đăng nhập này đã được sử dụng.',
                'username.alpha_dash' => 'Tên đăng nhập không được chứa ký tự đặc biệt.',
                'email.unique' => 'Email này đã được sử dụng, vui lòng chọn email khác.',
                'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
                'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
            ]);

            // 2. Create User
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username, // Use the input username
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone ?? '',
                'roles' => 'customer',
                'status' => 1,
            ]);

            event(new Registered($user));

            return response()->json([
                'status' => true,
                'message' => 'Đăng ký thành công. Vui lòng đăng nhập.',
                'data' => $user
            ], 201);
        } catch (ValidationException $e) {
            // Return the first validation error message
            return response()->json([
                'status' => false,
                'message' => $e->errors()[array_key_first($e->errors())][0]
            ], 422);
        } catch (QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return response()->json([
                    'status' => false,
                    'message' => 'Email hoặc Tên đăng nhập đã tồn tại.'
                ], 409);
            }
            return response()->json([
                'status' => false,
                'message' => 'Lỗi cơ sở dữ liệu: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đăng nhập.
     */
    public function login(Request $request)
    {
        try {
            // 1. Validate Username & Password
            $request->validate([
                'username' => 'required|string', // Sửa từ email thành username
                'password' => 'required|string',
            ], [
                'username.required' => 'Vui lòng nhập tên đăng nhập.',
                'password.required' => 'Vui lòng nhập mật khẩu.',
            ]);

            // 2. Thử đăng nhập bằng Username
            // Auth::attempt cần mảng ['tên_cột_db' => giá_trị, 'password' => giá_trị]
            if (!Auth::attempt(['username' => $request->username, 'password' => $request->password])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Tên đăng nhập hoặc mật khẩu không chính xác.',
                ], 401);
            }

            // 3. Lấy thông tin User
            $user = User::where('username', $request->username)->firstOrFail();

            // 4. Kiểm tra xem tài khoản đã bị khóa (status = 0) chưa (Optional - nên có)
            if ($user->status == 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Tài khoản của bạn đã bị khóa.',
                ], 403);
            }

            // 5. Kiểm tra email verified (Nếu dự án bắt buộc)
            // Nếu bạn cho phép đăng nhập bằng username mà không cần verify email ngay thì có thể bỏ đoạn này
            // if (!$user->hasVerifiedEmail()) {
            //     return response()->json([
            //         'status' => false,
            //         'message' => 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email của bạn.',
            //     ], 403);
            // }

            // 6. Tạo Token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'Đăng nhập thành công',
                'data' => $user,
                'token' => $token,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    public function verifyEmail(Request $request)
    {
        $user = User::findOrFail($request->route('id'));

        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json(['status' => false, 'message' => 'Link không hợp lệ.'], 403);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new \Illuminate\Auth\Events\Verified($user));
        }

        return response()->json([
            'status' => true,
            'message' => 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.'
        ]);
    }

    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['status' => false, 'message' => 'Email đã xác thực rồi.'], 400);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['status' => true, 'message' => 'Link xác thực đã được gửi lại.']);
    }

    public function profile()
    {
        return response()->json(['status' => true, 'data' => Auth::user()], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $request->validate(['name' => 'required|string|max:255', 'phone' => 'required|string|max:20', 'password' => 'nullable|string|min:6|confirmed']);
        $data = $request->only('name', 'phone');
        if ($request->filled('password')) $data['password'] = Hash::make($request->password);
        $user->update($data);
        return response()->json(['status' => true, 'message' => 'Cập nhật thành công', 'data' => $user], 200);
    }

    // 👇 1. HÀM MỚI: UPLOAD AVATAR
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Chỉ cho phép ảnh, tối đa 2MB
        ]);

        $user = Auth::user();

        if ($request->hasFile('avatar')) {
            // Lưu vào thư mục public/avatars
            $path = $request->file('avatar')->store('avatars', 'public');

            // Cập nhật đường dẫn vào database
            $user->update(['avatar' => $path]);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật ảnh đại diện thành công',
                'data' => $user
            ]);
        }

        return response()->json(['status' => false, 'message' => 'Vui lòng chọn ảnh'], 400);
    }

    public function orders()
    {
        return response()->json(['status' => true, 'data' => Auth::user()->orders()->with('details')->orderBy('created_at', 'desc')->paginate(10)], 200);
    }

    // 👇 2. HÀM MỚI: HỦY ĐƠN HÀNG
    public function cancelOrder($id)
    {
        $user = Auth::user();

        // Tìm đơn hàng của user đó (để tránh user này hủy đơn của user khác)
        $order = $user->orders()->where('id', $id)->first();

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
        }

        // Kiểm tra trạng thái: Chỉ cho hủy nếu status = 1 (Ví dụ: 1 là "Chờ xác thực")
        // Bạn hãy đổi số 1 này thành số tương ứng trong hệ thống của bạn
        if ($order->status != 1) {
            return response()->json(['status' => false, 'message' => 'Đơn hàng đã được xử lý hoặc đang giao, không thể hủy.'], 400);
        }

        // Cập nhật trạng thái thành 5 (Ví dụ: 5 là "Đã hủy")
        $order->update(['status' => 5]);

        return response()->json([
            'status' => true,
            'message' => 'Đã hủy đơn hàng thành công',
            'data' => $order
        ]);
    }

    // 👇 3. HÀM MỚI: ĐỔI MẬT KHẨU
    public function changePassword(Request $request)
    {
        // 1. Validate dữ liệu đầu vào
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:6|confirmed|different:current_password',
        ], [
            'current_password.required' => 'Vui lòng nhập mật khẩu hiện tại.',
            'new_password.required' => 'Vui lòng nhập mật khẩu mới.',
            'new_password.min' => 'Mật khẩu mới phải có ít nhất 6 ký tự.',
            'new_password.confirmed' => 'Xác nhận mật khẩu mới không khớp.',
            'new_password.different' => 'Mật khẩu mới không được trùng với mật khẩu cũ.',
        ]);

        $user = Auth::user();

        // 2. Kiểm tra mật khẩu cũ có đúng với trong Database không
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Mật khẩu hiện tại không chính xác.'
            ], 400);
        }

        // 3. Cập nhật mật khẩu mới (đã được Hash)
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Đổi mật khẩu thành công.'
        ], 200);
    }
}
