<?php

namespace App\Listeners;

use App\Models\ReverbApp;
use App\Models\ReverbLog;
use Laravel\Reverb\Events\ChannelCreated;
use Laravel\Reverb\Events\ChannelRemoved;
use Laravel\Reverb\Events\ConnectionPruned;
use Laravel\Reverb\Events\MessageReceived;
use Laravel\Reverb\Events\MessageSent;
use Pusher\Pusher;

class ReverbEventLogger
{
    public function handleChannelCreated(ChannelCreated $event): void
    {
        $channelName = $event->channel->name();
        // Try to get app key from first connection in the channel
        $connections = $event->channel->connections();
        $appId = null;
        if (! empty($connections)) {
            $first = array_values($connections)[0];
            $appId = $first->connection()->app()->id();
        }

        $this->log($appId, ReverbLog::TYPE_INFO, "Channel created: $channelName");
        $this->broadcast($appId, 'channel.created', [
            'channel' => $channelName,
        ]);
    }

    public function handleChannelRemoved(ChannelRemoved $event): void
    {
        $channelName = $event->channel->name();
        // No connections left — we can't determine appId here
        $this->log(null, ReverbLog::TYPE_INFO, "Channel removed: $channelName");
        $this->broadcast(null, 'channel.removed', [
            'channel' => $channelName,
        ], broadcastAll: true);
    }

    public function handleConnectionPruned(ConnectionPruned $event): void
    {
        $appId = $event->connection->app()->id();
        $socketId = $event->connection->id();

        $this->log($appId, ReverbLog::TYPE_INFO, "Connection pruned: $socketId");
        $this->broadcast($appId, 'connection.pruned', [
            'socket_id' => $socketId,
        ]);
    }

    public function handleMessageReceived(MessageReceived $event): void
    {
        $appId    = $event->connection->app()->id();
        $socketId = $event->connection->id();

        // Check if this app has message logging enabled
        $app = ReverbApp::find((int) $appId);
        if ($app && ! $app->log_messages) {
            return;
        }

        $decoded = json_decode($event->message, true) ?? ['raw' => $event->message];
        $content = json_encode($decoded, JSON_PRETTY_PRINT);

        $this->log($appId, ReverbLog::TYPE_MESSAGE, "↓ RECV [$socketId]: $content");
        $this->broadcast($appId, 'message.received', [
            'socket_id' => $socketId,
            'message'   => $decoded,
        ]);
    }

    public function handleMessageSent(MessageSent $event): void
    {
        $appId    = $event->connection->app()->id();
        $socketId = $event->connection->id();

        // Check if this app has message logging enabled
        $app = ReverbApp::find((int) $appId);
        if ($app && ! $app->log_messages) {
            return;
        }

        $decoded = json_decode($event->message, true) ?? ['raw' => $event->message];
        $content = json_encode($decoded, JSON_PRETTY_PRINT);

        $this->log($appId, ReverbLog::TYPE_MESSAGE, "↑ SENT [$socketId]: $content");
        $this->broadcast($appId, 'message.sent', [
            'socket_id' => $socketId,
            'message'   => $decoded,
        ]);
    }

    // -----------------------------------------------------------------------

    private function log(?string $appId, string $type, string $content): void
    {
        try {
            $app = $appId ? ReverbApp::find($appId) : null;

            // Respect per-type log flags
            if ($app) {
                if ($type === ReverbLog::TYPE_INFO && ! $app->log_info) {
                    return;
                }
                if ($type === ReverbLog::TYPE_ERROR && ! $app->log_errors) {
                    return;
                }
                if ($type === ReverbLog::TYPE_MESSAGE && ! $app->log_messages) {
                    return;
                }
            }

            ReverbLog::create([
                'app_id' => $appId,
                'type'    => $type,
                'content' => $content,
            ]);
        } catch (\Throwable) {
            // Never let logging errors break the WebSocket server
        }
    }

    private function broadcast(?string $appId, string $eventType, array $payload, bool $broadcastAll = false): void
    {
        try {
            if ($appId) {
                $app = ReverbApp::find((int) $appId);
                if ($app) {
                    $this->broadcastToApp($app, $eventType, $payload);
                }
            } elseif ($broadcastAll) {
                ReverbApp::all()->each(fn (ReverbApp $app) => $this->broadcastToApp($app, $eventType, $payload));
            }
        } catch (\Throwable) {
            // Never let broadcasting errors break the WebSocket server
        }
    }

    private function broadcastToApp(ReverbApp $app, string $eventType, array $payload): void
    {
        $pusher = new Pusher(
            $app->key,
            $app->secret,
            (string) $app->id,
            config('broadcasting.connections.reverb.options'),
        );

        $pusher->trigger(
            'private-reverb-admin-debug.' . $app->id,
            'debug.event',
            [
                'type'      => $eventType,
                'app_id'    => (string) $app->id,
                'payload'   => $payload,
                'timestamp' => now()->toISOString(),
            ],
        );
    }
}
