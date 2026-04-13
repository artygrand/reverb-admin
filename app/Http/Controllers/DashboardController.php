<?php

namespace App\Http\Controllers;

use App\Models\ReverbApp;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'health' => [
                'redis'  => $this->checkRedis(),
                'reverb' => $this->checkProcess('reverb:start'),
                'queue'  => $this->checkProcess('queue:work'),
            ],
            'stats' => [
                'apps' => ReverbApp::count(),
            ],
        ]);
    }

    private function checkRedis(): bool
    {
        try {
            return Cache::driver('redis')->getStore()->getRedis()->ping()
                || Redis::ping();
        } catch (\Throwable) {
            return false;
        }
    }

    private function checkProcess(string $pattern): bool
    {
        try {
            $output = [];
            exec("pgrep -f \"{$pattern}\" 2>/dev/null", $output);

            return ! empty($output);
        } catch (\Throwable) {
            return false;
        }
    }
}
