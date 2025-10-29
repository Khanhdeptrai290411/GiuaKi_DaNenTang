<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Models\Admin;
use App\Mail\TwoFactorCode;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class AdminAuthController extends Controller
{
    /**
     * Đăng ký admin mới
     */
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'email' => 'required|email',
                'password' => 'required|string|min:6|confirmed',
            ]);

            // Kiểm tra email đã tồn tại chưa
            $existingAdmin = Admin::where('email', $validated['email'])->first();
            if ($existingAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email đã được sử dụng',
                ], 422);
            }

            // Tạo admin mới
            $admin = Admin::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'google2fa_enabled' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký thành công!',
                'data' => [
                    'id' => (string)$admin->_id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'created_at' => $admin->created_at,
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đăng ký thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đăng nhập admin
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
                'otp_code' => 'nullable|string|size:6',
            ]);

            // Tìm admin
            $admin = Admin::where('email', $validated['email'])->first();

            // Kiểm tra admin tồn tại và password đúng
            if (!$admin || !Hash::check($validated['password'], $admin->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email hoặc mật khẩu không đúng'
                ], 401);
            }

            // Kiểm tra 2FA
            if ($admin->google2fa_enabled) {
                // Nếu chưa có OTP code, sinh mã và gửi email
                if (!$request->has('otp_code')) {
                    // Tạo mã OTP 6 số ngẫu nhiên
                    $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                    
                    // Lưu OTP vào database (có thời gian hết hạn)
                    $admin->otp_code = $otpCode;
                    $admin->otp_expires_at = now()->addMinutes(5); // OTP hết hạn sau 5 phút
                    $admin->save();

                    // Gửi OTP qua email
                    try {
                        \Mail::raw("Xin chào {$admin->name},\n\nMã OTP đăng nhập của bạn là:\n\n{$otpCode}\n\nMã này có hiệu lực trong 5 phút.\n\nTrân trọng,\nAdmin Team", function($message) use ($admin) {
                            $message->to($admin->email)
                                    ->subject('🔐 Mã OTP đăng nhập');
                        });
                    } catch (\Exception $e) {
                        \Log::error('Failed to send OTP email: ' . $e->getMessage());
                    }

                    return response()->json([
                        'success' => false,
                        'message' => 'Mã OTP đã được gửi đến email của bạn',
                        'requires_2fa' => true,
                        'email' => $admin->email,
                    ], 200);
                }

                // Kiểm tra OTP
                if ($admin->otp_code !== $validated['otp_code']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Mã OTP không đúng'
                    ], 401);
                }

                // Kiểm tra OTP hết hạn chưa
                if ($admin->otp_expires_at && now()->gt($admin->otp_expires_at)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Mã OTP đã hết hạn'
                    ], 401);
                }

                // Xóa OTP sau khi dùng
                $admin->otp_code = null;
                $admin->otp_expires_at = null;
                $admin->save();
            }

            // Tạo token
            $token = base64_encode($admin->_id . '|' . time() . '|' . uniqid());
            $admin->api_token = $token;
            $admin->save();

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập thành công!',
                'data' => [
                    'token' => $token,
                    'admin' => [
                        'id' => (string)$admin->_id,
                        'name' => $admin->name,
                        'email' => $admin->email,
                        'google2fa_enabled' => $admin->google2fa_enabled ?? false,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đăng nhập thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enable 2FA - Bật xác thực OTP qua email
     */
   

    /**
     * Đăng xuất
     */
    public function logout(Request $request)
    {
        try {
            $token = $request->bearerToken();
            
            if ($token) {
                $admin = Admin::where('api_token', $token)->first();
                if ($admin) {
                    $admin->api_token = null;
                    $admin->save();
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Đăng xuất thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đăng xuất thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thông tin admin hiện tại
     */
    public function me(Request $request)
    {
        try {
            $token = $request->bearerToken();
            
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token không hợp lệ'
                ], 401);
            }

            $admin = Admin::where('api_token', $token)->first();
            
            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin không tìm thấy'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => (string)$admin->_id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'google2fa_enabled' => $admin->google2fa_enabled ?? false,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi lấy thông tin',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
