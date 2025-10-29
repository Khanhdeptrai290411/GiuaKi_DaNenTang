<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
            margin: -30px -30px 20px -30px;
        }
        .content {
            padding: 20px 0;
        }
        .info-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #667eea;
            margin: 15px 0;
        }
        .alert {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        .user-image {
            max-width: 150px;
            border-radius: 50%;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>{{ $subject }}</h2>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $user['username'] ?? 'User' }}</strong>,</p>

            @if($action === 'created')
                <p>Your account has been successfully created by an administrator.</p>
                <div class="info-box">
                    <p><strong>Account Details:</strong></p>
                    <ul>
                        <li><strong>Username:</strong> {{ $user['username'] }}</li>
                        <li><strong>Email:</strong> {{ $user['email'] }}</li>
                        @if(isset($user['image']) && $user['image'])
                            <li><strong>Profile Image:</strong> <img src="{{ $user['image'] }}" alt="Profile" class="user-image"></li>
                        @endif
                    </ul>
                </div>
                <p>You can now use this account to access the system. Please contact the administrator if you need your password.</p>
            
            @elseif($action === 'updated')
                <p>Your account information has been updated by an administrator.</p>
                <div class="info-box">
                    <p><strong>Updated Information:</strong></p>
                    <ul>
                        @if(isset($data['username']))
                            <li><strong>New Username:</strong> {{ $data['username'] }}</li>
                        @endif
                        @if(isset($data['email']))
                            <li><strong>New Email:</strong> {{ $data['email'] }}</li>
                        @endif
                        @if(isset($data['password']))
                            <li><strong>Password:</strong> Updated</li>
                        @endif
                        @if(isset($data['image']))
                            <li><strong>Profile Image:</strong> Updated</li>
                        @endif
                    </ul>
                </div>
                @if(isset($data['password']))
                    <div class="alert">
                        <p><strong>⚠️ Important:</strong> Your password has been changed. Please contact the administrator to get your new password.</p>
                    </div>
                @endif
            
            @elseif($action === 'deleted')
                <div class="alert">
                    <p><strong>Account Deletion Notice</strong></p>
                    <p>Your account has been deleted by an administrator.</p>
                    <p>If you believe this is an error, please contact support immediately.</p>
                </div>
                <div class="info-box">
                    <p><strong>Deleted Account Details:</strong></p>
                    <ul>
                        <li><strong>Username:</strong> {{ $user['username'] }}</li>
                        <li><strong>Email:</strong> {{ $user['email'] }}</li>
                    </ul>
                </div>
            @endif

            <p>If you have any questions, please contact the administrator.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} User Management System. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>

