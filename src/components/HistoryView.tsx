import { useState, useMemo } from 'react';
import { useHabits } from '../hooks/useHabits';
import { Search, Plus, Edit, Trash2, History, Filter } from 'lucide-react';

export function HistoryView() {
  const { history } = useHabits();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | 'created' | 'updated' | 'deleted'>('all');

  // Filter and search history
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.habit_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterAction === 'all' || item.action === filterAction;
      return matchesSearch && matchesFilter;
    });
  }, [history, searchTerm, filterAction]);

  // Group history by date
  const groupedHistory = useMemo(() => {
    const groups: Record<string, typeof history> = {};
    
    filteredHistory.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    
    return groups;
  }, [filteredHistory]);

  function getActionIcon(action: string) {
    switch (action) {
      case 'created':
        return <Plus className="w-4 h-4" />;
      case 'updated':
        return <Edit className="w-4 h-4" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  }

  function getActionColor(action: string) {
    switch (action) {
      case 'created':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'updated':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'deleted':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  }

  function formatTime(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderChanges(changes: Record<string, any>) {
    const entries = Object.entries(changes);
    if (entries.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {entries.map(([key, value]) => {
          // Handle different types of changes
          if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
            // Special handling for color changes - show color swatches
            if (key === 'color') {
              return (
                <div key={key} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: String(value.old) }}
                      title={String(value.old)}
                    />
                    <span>→</span>
                    <div 
                      className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: String(value.new) }}
                      title={String(value.new)}
                    />
                  </div>
                </div>
              );
            }
            // Special handling for icon changes - show emoji/icons
            if (key === 'icon') {
              return (
                <div key={key} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl">{String(value.old)}</span>
                    <span>→</span>
                    <span className="text-2xl">{String(value.new)}</span>
                  </div>
                </div>
              );
            }
            // Default handling for other changes
            return (
              <div key={key} className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                <span className="line-through text-gray-400">{String(value.old)}</span>{' '}
                → <span className="text-gray-900 dark:text-white">{String(value.new)}</span>
              </div>
            );
          } else {
            return (
              <div key={key} className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                <span className="text-gray-900 dark:text-white">{String(value)}</span>
              </div>
            );
          }
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as any)}
            className="pl-10 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none cursor-pointer"
            aria-label="Filter habit history by action type"
          >
            <option value="all">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl p-12 text-center border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-xl transform scale-125 animate-pulse"></div>
            <div className="relative bg-white dark:bg-gray-700 p-4 rounded-full shadow-md border border-gray-100 dark:border-gray-600">
              <History className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {searchTerm || filterAction !== 'all' ? 'No matching history records' : 'Your history is clear'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mb-6">
            {searchTerm || filterAction !== 'all' 
              ? 'We couldn\'t find any history entries matching your current search criteria or category filter.'
              : 'Once you create, update, or complete your habits, a timeline log of all activities will appear here.'}
          </p>
          {(searchTerm || filterAction !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterAction('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 z-10">
                {date}
              </h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getActionColor(item.action)}`}>
                        {getActionIcon(item.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {item.habit_name}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatTime(item.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          Habit {item.action}
                        </p>
                        
                        {item.action === 'updated' && renderChanges(item.changes)}
                        {item.action === 'created' && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Initial settings configured
                          </div>
                        )}
                        {item.action === 'deleted' && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Habit removed from your list
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
