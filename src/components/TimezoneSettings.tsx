import { useEffect, useMemo, useState } from 'react';
import { Globe2, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllTimeZones, getBrowserTimeZone } from '../utils/timeUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TimezoneSettings({ isOpen, onClose }: Props) {
  const { profile, updateTimezone } = useAuth();
  const [manual, setManual] = useState<boolean>(!!profile?.timezone_manual);
  const [timezone, setTimezone] = useState<string>(profile?.timezone || getBrowserTimeZone());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setManual(!!profile?.timezone_manual);
    setTimezone(profile?.timezone || getBrowserTimeZone());
  }, [profile?.timezone, profile?.timezone_manual]);

  const zones = useMemo(() => getAllTimeZones(), []);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTimezone(timezone, manual);
      onClose();
    } catch {
      // error already logged in context
    } finally {
      setSaving(false);
    }
  };

  const resetToAuto = () => {
    setManual(false);
    setTimezone(getBrowserTimeZone());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="timezone-settings-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 id="timezone-settings-title" className="font-semibold text-gray-900 dark:text-white">Timezone Settings</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close timezone settings">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <input
              id="manual-tz"
              type="checkbox"
              checked={manual}
              onChange={(e) => setManual(e.target.checked)}
              className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="manual-tz" className="font-medium text-gray-900 dark:text-white">Manually override timezone</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">If unchecked, we'll use your device timezone automatically.</p>
            </div>
          </div>

          <div>
            <label htmlFor="timezone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
            <select
              id="timezone-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={!manual}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
            {!manual && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current device timezone: {getBrowserTimeZone()}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={resetToAuto} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Use Device</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
