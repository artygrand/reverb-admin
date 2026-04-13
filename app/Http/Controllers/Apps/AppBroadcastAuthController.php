<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\ReverbApp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppBroadcastAuthController extends Controller
{
    /**
     * Authenticate a private channel subscription for the given Reverb app.
     * Signs the auth token using the selected app's secret so Reverb can
     * validate it against the correct app context.
     */
    public function __invoke(Request $request, ReverbApp $app): JsonResponse
    {
        $socketId    = $request->input('socket_id');
        $channelName = $request->input('channel_name');


        // Generate the Pusher-compatible auth signature using this app's secret
        $signature = hash_hmac('sha256', $socketId . ':' . $channelName, $app->secret);

        return response()->json(['auth' => $app->key . ':' . $signature]);
    }
}
