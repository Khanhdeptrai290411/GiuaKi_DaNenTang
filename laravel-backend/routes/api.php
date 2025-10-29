<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\Auth\AdminAuthController;


Route::prefix('admin')->group(function () {
    // Public routes (không cần token)
    Route::post('/register', [AdminAuthController::class, 'register']);
    Route::post('/login', [AdminAuthController::class, 'login']);
    
    // Protected routes (cần token)
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);
    
    // 2FA Routes (cần token)
    Route::post('/2fa/enable', [AdminAuthController::class, 'enable2FA']);
    Route::post('/2fa/disable', [AdminAuthController::class, 'disable2FA']);
    Route::get('/2fa/status', [AdminAuthController::class, 'check2FAStatus']);
});


Route::prefix('members')->group(function () {
    Route::get('/', [MemberController::class, 'index']);           // Lấy danh sách
    Route::get('/export/csv', [MemberController::class, 'exportCSV']); // Export CSV
    Route::post('/', [MemberController::class, 'store']);          // Tạo mới
    Route::get('/{id}', [MemberController::class, 'show']);        // Xem chi tiết
    Route::put('/{id}', [MemberController::class, 'update']);      // Cập nhật
    Route::delete('/{id}', [MemberController::class, 'destroy']);  // Xóa
});
