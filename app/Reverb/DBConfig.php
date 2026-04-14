<?php

namespace App\Reverb;

use App\Models\ReverbApp;

class DBConfig
{
    public function merge(array $original): array
    {
        return array_merge(
            $original,
            ReverbApp::all()->map(fn (ReverbApp $app) => $this->convert($app))->toArray()
        );
    }

    private function convert(ReverbApp $app): array
    {
        return [
            'key' => $app->key,
            'secret' => $app->secret,
            'app_id' => $app->id,
            'options' => [
                'host' => env('REVERB_HOST'),
                'port' => env('REVERB_PORT', 443),
                'scheme' => env('REVERB_SCHEME', 'https'),
                'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
            ],
            'allowed_origins' => $app->allowed_origins ?? ['*'],
            'ping_interval' => $app->ping_interval,
            'activity_timeout' => $app->activity_timeout,
            'max_connections' => $app->max_connections,
            'max_message_size' => $app->max_message_size,
            'accept_client_events_from' => $app->accept_client_events_from,
            'rate_limiting' => [
                'enabled' => $app->rate_limiting_enabled,
                'max_attempts' => $app->rate_limit_max_attempts,
                'decay_seconds' => $app->rate_limit_decay_seconds,
                'terminate_on_limit' => $app->rate_limit_terminate,
            ],
        ];
    }
}
