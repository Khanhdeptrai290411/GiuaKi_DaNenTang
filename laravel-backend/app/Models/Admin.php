<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Admin extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'admins';

    public $timestamps = false; // Tắt created_at và updated_at

    protected $fillable = [
        'name',
        'email',
        'password',
        'api_token',
        'google2fa_enabled', // 2FA qua OTP email
        'otp_code', // Mã OTP 6 số
        'otp_expires_at', // Thời gian hết hạn OTP
    ];

    protected $hidden = [
        'password',
        'api_token',
        'otp_code', // Ẩn mã OTP
    ];

    protected $casts = [
        'google2fa_enabled' => 'boolean',
        'otp_expires_at' => 'datetime',
    ];
}
