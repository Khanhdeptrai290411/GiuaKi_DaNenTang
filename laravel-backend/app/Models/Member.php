<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Member extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'members';

    public $timestamps = false; // Tắt created_at và updated_at

    protected $fillable = [
        'username',
        'email',
        'password',
        'image',
    ];

    protected $hidden = [
        'password',
    ];
}
