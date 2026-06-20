<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Xử lý yêu cầu đăng ký tài khoản mới.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:user',
            'phone' => 'required|string|max:20',
            'username' => 'required|string|max:255|unique:user',
            'password' => 'required|string|min:6|confirmed',
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'roles' => 'customer', 
                'created_by' => 0, 
            ]);

            // Tự động đăng nhập sau khi đăng ký thành công
            Auth::login($user);

            return response()->json([
                'status' => true,
                'message' => 'Đăng ký thành công',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Đăng ký thất bại.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Xử lý yêu cầu đăng nhập.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            return response()->json([
                'status' => true,
                'message' => 'Đăng nhập thành công',
                'user' => $user
            ], 200);
        }

        return response()->json([
            'status' => false,
            'message' => 'Tên đăng nhập hoặc mật khẩu không chính xác'
        ], 401);
    }
    
    /**
     * Xử lý yêu cầu đăng xuất.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => true,
            'message' => 'Đăng xuất thành công'
        ], 200);
    }
}