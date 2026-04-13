export default function ToggleSwitch({
                          label,
                          checked,
                          onChange,
                      }: {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div
                    className={`h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
                />
                <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
            </div>
            {label}
        </label>
    );
}
