/**
 * DramaBox Watch History & Saved Shelf Library View
 * 1-to-1 match with https://reels.7xmtools.com/history/
 */

import { useState } from 'react';
import { Clock, Bookmark, Play, Trash2, LogIn } from 'lucide-react';
import { useDramaBoxStore } from '../../stores/dramaboxStore';
import { DramaCard } from './DramaCard';

export function DramaHistoryView() {
  const {
    watchHistory,
    shelf,
    clearHistory,
    openPlayerModal,
    user,
    setAuthModalOpen,
  } = useDramaBoxStore();

  const [activeSubTab, setActiveSubTab] = useState<'history' | 'shelf'>('history');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="type-meta text-xs uppercase tracking-wider text-rose-400 font-semibold mb-1 block">
            Your Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Clock className="w-7 h-7 text-rose-500" strokeWidth={1.5} />
            Watch History & Saved Shelf
          </h1>
        </div>

        {/* Subtabs: History vs Shelf */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeSubTab === 'history'
                ? 'bg-white text-black shadow-md'
                : 'apple-glass-thin text-white/72 hover:text-white'
            }`}
          >
            History ({watchHistory.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('shelf')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeSubTab === 'shelf'
                ? 'bg-white text-black shadow-md'
                : 'apple-glass-thin text-white/72 hover:text-white'
            }`}
          >
            My Shelf ({shelf.length})
          </button>
        </div>
      </div>

      {/* History Subtab */}
      {activeSubTab === 'history' && (
        <div>
          {watchHistory.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center apple-glass-regular rounded-3xl border border-white/10 max-w-md mx-auto p-8">
              <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center mb-4 text-white/40">
                <Clock className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">No Watch History Yet</h2>
              <p className="type-meta text-white/60 mb-6 text-sm">
                Your watched episodes will appear here automatically with resume points.
              </p>
              {!user && (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Sync Across Devices
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="type-meta text-xs text-white/48 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {watchHistory.map((item) => {
                  const progressPct =
                    item.duration > 0
                      ? Math.min(100, Math.floor((item.progress_seconds / item.duration) * 100))
                      : 0;

                  return (
                    <div
                      key={`${item.series_id}-${item.episode_id}`}
                      className="group p-3 rounded-2xl apple-glass-regular border border-white/[0.08] hover:border-white/20 transition-all flex gap-3.5 items-center cursor-pointer select-none"
                      onClick={() =>
                        openPlayerModal(
                          {
                            id: item.series_id,
                            title: item.series_title || 'Drama Title',
                            cover_pic: item.cover_pic || '',
                            description: '',
                            chapter_count: 50,
                            read_count: 0,
                            collect_count: 0,
                            theme: [],
                          },
                          item.episode_index
                        )
                      }
                    >
                      {/* Thumbnail */}
                      <div className="relative w-18 h-24 rounded-xl overflow-hidden bg-black/50 flex-shrink-0 border border-white/10">
                        {item.cover_pic && (
                          <img
                            src={item.cover_pic}
                            alt={item.series_title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-6 h-6 fill-white text-white" />
                        </div>
                      </div>

                      {/* Info & Progress */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                            {item.series_title || 'Drama Episode'}
                          </h3>
                          <span className="type-meta text-xs text-white/60 block mt-0.5">
                            Episode {item.episode_index}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="type-meta text-[10px] text-white/40 mt-1 block">
                            {progressPct}% watched
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shelf Subtab */}
      {activeSubTab === 'shelf' && (
        <div>
          {shelf.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center apple-glass-regular rounded-3xl border border-white/10 max-w-md mx-auto p-8">
              <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center mb-4 text-white/40">
                <Bookmark className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Your Shelf is Empty</h2>
              <p className="type-meta text-white/60 text-sm">
                Add any drama by tapping "My Shelf" or the bookmark icon on any series card.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {shelf.map((series) => (
                <div key={series.id} className="flex justify-center">
                  <DramaCard series={series} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
