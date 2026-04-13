<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\ReverbApp;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Pusher\Pusher;
use Pusher\PusherException;

class AppDebugController extends Controller
{
    /**
     * Send a test event to a Reverb application channel.
     * @throws PusherException|GuzzleException
     */
    public function store(Request $request, ReverbApp $app): RedirectResponse
    {
        $validated = $request->validate([
            'channel' => 'required|string|max:200',
            'event'   => 'required|string|max:200',
            'data'    => 'nullable|string',
        ]);

        // Parse data — support JSON object or plain string
        $data = $validated['data'] ?? '{}';
        $decoded = json_decode($data, true);
        $payload = $decoded !== null ? $decoded : $data;

        $pusher = new Pusher(
            $app->key,
            $app->secret,
            (string) $app->id,  // app_id for Pusher = auto-increment id
            config('broadcasting.connections.reverb.options'),
        );

        $pusher->trigger($validated['channel'], $validated['event'], $payload);

        return back();
    }
}
