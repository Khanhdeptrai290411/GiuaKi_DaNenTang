<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TwoFactorCode extends Mailable
{
    use Queueable, SerializesModels;

    public $admin;
    public $secret;
    public $qrCodeUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(string $qrCodeUrl, $admin, ?string $secret = null)
    {
        $this->admin = $admin;
        $this->secret = $secret;
        $this->qrCodeUrl = $qrCodeUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🔐 Mã QR kích hoạt 2FA',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.two-factor-qr',
        );
    }

    /**
     * Attachments (none)
     */
    public function attachments(): array
    {
        return [];
    }
}

