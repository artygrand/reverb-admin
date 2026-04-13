<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\ReverbApp;
use App\Models\ReverbLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppLogsController extends Controller
{
    public function index(Request $request, ReverbApp $app): Response
    {
        $type = $request->query('type'); // info | error | message | null (all)

        $query = ReverbLog::where('app_id', $app->id)
            ->orderByDesc('id')
            ->when($type, fn ($q) => $q->where('type', $type));

        return Inertia::render('apps/logs', [
            'app'    => $app->only(['id', 'name', 'key', 'log_info', 'log_errors', 'log_messages']),
            'logs'   => $query->paginate(100)->withQueryString(),
            'filter' => $type,
        ]);
    }

    public function destroy(Request $request, ReverbApp $app): RedirectResponse
    {
        $type = $request->input('type'); // optional: delete only a specific type

        ReverbLog::where('app_id', $app->id)
            ->when($type, fn ($q) => $q->where('type', $type))
            ->delete();

        return back();
    }

    public function updateSettings(Request $request, ReverbApp $app): RedirectResponse
    {
        $validated = $request->validate([
            'log_info'     => 'required|boolean',
            'log_errors'   => 'required|boolean',
            'log_messages' => 'required|boolean',
        ]);

        $app->update($validated);

        return back();
    }
}
