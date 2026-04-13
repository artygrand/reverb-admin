<?php

namespace App\Reverb;

use App\Models\ReverbLog;
use Laravel\Reverb\Contracts\Logger;

class DatabaseLogger implements Logger
{
    /**
     * Log an informational message.
     */
    public function info(string $title, ?string $message = null): void
    {
        ReverbLog::create([
            'app_id' => null,
            'type'    => ReverbLog::TYPE_INFO,
            'content' => $message ? "$title: $message" : $title,
        ]);
    }

    /**
     * Log an error message.
     */
    public function error(string $message): void
    {
        ReverbLog::create([
            'app_id' => null,
            'type'    => ReverbLog::TYPE_ERROR,
            'content' => $message,
        ]);
    }

    /**
     * Log a raw message (WebSocket frame).
     */
    public function message(string $message): void
    {
        $decoded = json_decode($message, true);

        if (isset($decoded['data']['channel_data'])) {
            $decoded['data']['channel_data'] = json_decode($decoded['data']['channel_data'], true);
        }

        ReverbLog::create([
            'app_id' => null,
            'type'    => ReverbLog::TYPE_MESSAGE,
            'content' => $decoded ? json_encode($decoded, JSON_PRETTY_PRINT) : $message,
        ]);
    }

    /**
     * No-op — DB-based logger doesn't need line separators.
     */
    public function line(int $lines = 1): void {}
}
