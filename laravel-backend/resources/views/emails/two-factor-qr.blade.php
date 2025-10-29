<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Two-Factor Authentication Setup</title>
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
        .qr-code {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 10px;
            margin: 20px 0;
        }
        .qr-code img {
            max-width: 300px;
            border: 2px solid #667eea;
            padding: 10px;
            background-color: white;
            border-radius: 10px;
        }
        .instructions {
            background-color: #e7f3ff;
            padding: 15px;
            border-left: 4px solid #2196F3;
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
        ol {
            padding-left: 20px;
        }
        ol li {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔒 Kích hoạt xác thực 2 yếu tố (2FA)</h2>
        </div>
        <div class="content">
            <p>Xin chào <strong>{{ $admin->name }}</strong>,</p>

            <p>Bạn đã yêu cầu kích hoạt xác thực 2 yếu tố cho tài khoản admin. Vui lòng quét mã QR bên dưới bằng ứng dụng Google Authenticator.</p>

            <div class="qr-code">
                <img src="{{ $qrCodeUrl }}" alt="2FA QR Code" style="max-width: 300px; border: 2px solid #667eea; padding: 10px; background-color: white; border-radius: 10px;">
                
                <p style="margin-top: 15px; color: #666; font-size: 14px;">
                    Nếu QR code không hiển thị, <a href="{{ $qrCodeUrl }}" target="_blank" style="color: #667eea; text-decoration: underline;">click vào đây để xem</a>
                </p>
                
                @if(isset($secret))
                <p style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; font-family: monospace; font-size: 16px; font-weight: bold; text-align: center;">
                    Hoặc nhập mã này vào Google Authenticator:<br>
                    <span style="color: #d32f2f; letter-spacing: 3px; font-size: 20px;">{{ $secret }}</span>
                </p>
                @endif
            </div>

            <div class="instructions">
                <p><strong>📱 Hướng dẫn cài đặt:</strong></p>
                <ol>
                    <li>Tải ứng dụng Google Authenticator:
                        <ul>
                            <li><a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">Android Play Store</a></li>
                            <li><a href="https://apps.apple.com/app/google-authenticator/id388497605">Apple App Store</a></li>
                        </ul>
                    </li>
                    <li>Mở ứng dụng Google Authenticator</li>
                    <li>Nhấn nút "+" để thêm tài khoản mới</li>
                    <li>Chọn "Quét mã QR"</li>
                    <li>Hướng camera vào mã QR phía trên</li>
                    <li>Nhập mã 6 số từ ứng dụng khi đăng nhập</li>
                </ol>
            </div>

            <div class="alert">
                <p><strong>⚠️ Lưu ý bảo mật quan trọng:</strong></p>
                <ul>
                    <li>Giữ thiết bị có Google Authenticator an toàn</li>
                    <li>Không chia sẻ mã QR hoặc mã 6 số cho bất kỳ ai</li>
                    <li>Lưu mã dự phòng nếu hệ thống cung cấp</li>
                    <li>Email này chứa thông tin nhạy cảm - xóa sau khi cài đặt xong</li>
                </ul>
            </div>

            <p>Sau khi quét mã QR, bạn sẽ cần nhập mã 6 số từ Google Authenticator mỗi lần đăng nhập vào tài khoản admin.</p>

            <p>Nếu cần hỗ trợ, vui lòng liên hệ admin.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Admin Panel. All rights reserved.</p>
            <p>This is an automated security message.</p>
        </div>
    </div>
</body>
</html>

