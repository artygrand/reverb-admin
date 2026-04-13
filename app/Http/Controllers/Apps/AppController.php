<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\ReverbApp;
use Inertia\Inertia;
use Inertia\Response;

class AppController extends Controller
{
    public function show(ReverbApp $app): Response
    {
        return Inertia::render('apps/show', [
            'app' => $app->only([
                'id', 'name', 'key', 'secret',
                'allowed_origins', 'ping_interval', 'activity_timeout',
                'max_message_size', 'max_connections',
                'accept_client_events_from',
            ]),
        ]);
    }
}
