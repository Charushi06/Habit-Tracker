import { useEffect, useMemo, useState } from 'react';
import { Globe2, Check, X, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setManual(!!profile?.timezone_manual);
    setTimezone(profile?.timezone || getBrowserTimeZone());
  }, [profile?.timezone, profile?.timezone_manual]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const zones = useMemo(() => getAllTimeZones(), []);

  const filteredZones = useMemo(() => {
    if (!searchQuery.trim()) return zones;
    const query = searchQuery.toLowerCase();
    return zones.filter(z => z.toLowerCase().includes(query));
  }, [zones, searchQuery]);

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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 id="timezone-settings-title" className="font-semibold text-gray-900 dark:text-white">Timezone Settings</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            aria-label="Close timezone settings"
          >
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
              className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="manual-tz" className="font-medium text-gray-900 dark:text-white cursor-pointer select-none">
                Manually override timezone
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">If unchecked, we'll use your device timezone automatically.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="timezone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Timezone
            </label>
            
            {manual && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search timezone (e.g. London, Tokyo)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <select
              id="timezone-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={!manual}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filteredZones.length === 0 ? (
                <option value="" disabled>No timezones match search</option>
              ) : (
                filteredZones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))
              )}
            </select>
            {!manual && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current device timezone: {getBrowserTimeZone()}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button 
            onClick={resetToAuto} 
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Use Device
          </button>
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

