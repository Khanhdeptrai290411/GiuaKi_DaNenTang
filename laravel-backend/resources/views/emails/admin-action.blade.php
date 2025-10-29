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
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>{{ $subject }}</h2>
        </div>
        <div class="content">
            <p>Hello <strong>{{ $admin->name }}</strong>,</p>

            @if($action === 'register')
                <p>Welcome to the Admin Panel! Your account has been successfully created.</p>
                <div class="info-box">
                    <p><strong>Account Details:</strong></p>
                    <ul>
                        <li><strong>Name:</strong> {{ $data['name'] }}</li>
                        <li><strong>Email:</strong> {{ $data['email'] }}</li>
                        <li><strong>Created At:</strong> {{ $data['created_at'] }}</li>
                    </ul>
                </div>
            @elseif($action === 'login')
                <p>A login was detected on your admin account.</p>
                <div class="info-box">
                    <p><strong>Login Details:</strong></p>
                    <ul>
                        <li><strong>Time:</strong> {{ $data['login_time'] }}</li>
                        <li><strong>IP Address:</strong> {{ $data['ip_address'] }}</li>
                        <li><strong>User Agent:</strong> {{ $data['user_agent'] }}</li>
                    </ul>
                </div>
                <p>If this wasn't you, please secure your account immediately.</p>
            @elseif($action === 'profile_update')
                <p>Your admin profile has been updated.</p>
                <div class="info-box">
                    <p><strong>Updated Fields:</strong></p>
                    <ul>
                        @foreach($data as $key => $value)
                            <li><strong>{{ ucfirst($key) }}:</strong> {{ $value }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <p>If you did not perform this action, please contact support immediately.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Admin Panel. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>

