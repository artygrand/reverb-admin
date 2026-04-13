<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReverbDebugEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $appId,
        public readonly string $eventType,
        public readonly array  $payload,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel[]
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('reverb-admin-debug.' . $this->appId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'debug.event';
    }

    public function broadcastWith(): array
    {
        return [
            'type'      => $this->eventType,
            'app_id'   => $this->appId,
            'payload'   => $this->payload,
            'timestamp' => now()->toISOString(),
        ];
    }
}
