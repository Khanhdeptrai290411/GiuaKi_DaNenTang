<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class MemberController extends Controller
{
    /**
     * Lấy danh sách tất cả members
     */
    public function index()
    {
        try {
            $members = Member::all();
            return response()->json($members);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi lấy danh sách',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo member mới
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string|max:255',
                'email' => 'required|email',
                'password' => 'required|string|min:6',
                'image' => 'nullable|string',
            ]);

            // Kiểm tra email đã tồn tại
            $existingMember = Member::where('email', $request->email)->first();
            if ($existingMember) {
                return response()->json([
                    'message' => 'Email đã được sử dụng'
                ], 422);
            }

            // Tạo member
            $member = new Member();
            $member->username = $request->username;
            $member->email = $request->email;
            $member->password = Hash::make($request->password);
            $member->image = $request->image;
            $member->save();

            // Gửi email thông báo cho user
            try {
                Mail::raw("Xin chào {$member->username},\n\nTài khoản của bạn đã được tạo thành công!\n\nThông tin:\n- Username: {$member->username}\n- Email: {$member->email}\n\nVui lòng liên hệ admin để lấy mật khẩu.\n\nTrân trọng,\nAdmin Team", function($message) use ($member) {
                    $message->to($member->email)
                            ->subject('Tài khoản được tạo thành công');
                });
            } catch (\Exception $e) {
                \Log::error('Failed to send email: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Tạo user thành công! Email thông báo đã được gửi.',
                'member' => $member
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Tạo user thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết member
     */
    public function show($id)
    {
        try {
            \Log::info('Fetching member with ID: ' . $id);
            
            $member = Member::find($id);
            
            if (!$member) {
                \Log::warning('Member not found with ID: ' . $id);
                return response()->json([
                    'message' => 'Không tìm thấy user'
                ], 404);
            }

            \Log::info('Member found: ' . $member->username);
            return response()->json($member);

        } catch (\Exception $e) {
            \Log::error('Error fetching member: ' . $e->getMessage());
            return response()->json([
                'message' => 'Lỗi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật member
     */
    public function update(Request $request, $id)
    {
        try {
            $member = Member::find($id);
            
            if (!$member) {
                return response()->json([
                    'message' => 'Không tìm thấy user'
                ], 404);
            }

            $request->validate([
                'username' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email',
                'password' => 'nullable|string|min:6',
                'image' => 'nullable|string',
            ]);

            // Kiểm tra email trùng
            if ($request->email && $request->email !== $member->email) {
                $existingMember = Member::where('email', $request->email)->first();
                if ($existingMember) {
                    return response()->json([
                        'message' => 'Email đã được sử dụng'
                    ], 422);
                }
            }

            // Cập nhật
            if ($request->has('username')) {
                $member->username = $request->username;
            }
            if ($request->has('email')) {
                $member->email = $request->email;
            }
            if ($request->has('password')) {
                $member->password = Hash::make($request->password);
            }
            if ($request->has('image')) {
                $member->image = $request->image;
            }

            $member->save();

            // Gửi email thông báo cập nhật
            try {
                $changes = [];
                if ($request->has('username')) $changes[] = "Username: {$request->username}";
                if ($request->has('email')) $changes[] = "Email: {$request->email}";
                if ($request->has('password')) $changes[] = "Password: Đã được thay đổi";
                
                $changesText = implode("\n- ", $changes);
                
                Mail::raw("Xin chào {$member->username},\n\nThông tin tài khoản của bạn đã được cập nhật!\n\nCác thay đổi:\n- {$changesText}\n\nTrân trọng,\nAdmin Team", function($message) use ($member) {
                    $message->to($member->email)
                            ->subject('Tài khoản được cập nhật');
                });
            } catch (\Exception $e) {
                \Log::error('Failed to send email: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thành công! Email thông báo đã được gửi.',
                'member' => $member
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Cập nhật thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa member
     */
    public function destroy($id)
    {
        try {
            $member = Member::find($id);
            
            if (!$member) {
                return response()->json([
                    'message' => 'Không tìm thấy user'
                ], 404);
            }

            // Lưu thông tin trước khi xóa
            $memberEmail = $member->email;
            $memberUsername = $member->username;

            // Gửi email thông báo xóa
            try {
                Mail::raw("Xin chào {$memberUsername},\n\nTài khoản của bạn đã bị xóa khỏi hệ thống.\n\nNếu đây là nhầm lẫn, vui lòng liên hệ admin ngay.\n\nTrân trọng,\nAdmin Team", function($message) use ($memberEmail) {
                    $message->to($memberEmail)
                            ->subject('Tài khoản đã bị xóa');
                });
            } catch (\Exception $e) {
                \Log::error('Failed to send email: ' . $e->getMessage());
            }

            $member->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa user thành công! Email thông báo đã được gửi.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Xóa user thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export members to CSV
     */
    public function exportCSV()
    {
        try {
            $members = Member::all();
            
            $fileName = 'members_export_' . date('Y-m-d_H-i-s') . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            ];

            $callback = function() use ($members) {
                $file = fopen('php://output', 'w');
                
                // Header CSV
                fputcsv($file, ['ID', 'Username', 'Email', 'Image']);
                
                // Data
                foreach ($members as $member) {
                    fputcsv($file, [
                        (string)$member->_id,
                        $member->username,
                        $member->email,
                        $member->image ?? '',
                    ]);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export CSV thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
