/**
 * Spotlight Clip Search Modal Component (§6.1)
 * Heavy-glass modal triggered by ⌘K or / with 150ms debounced search
 * across dialogue quotes, actors, directors, and scene tags.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CornerDownLeft } from 'lucide-react';
import type { ClipSearchResult, Reel } from '../../lib/reels/types';
import { searchClips } from '../../lib/reels/api';
import { NoResultsState } from './states/NoResultsState';
import { useSpatialMotion } from '../../lib/motion';

interface ClipSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReel: (reel: Reel) => void;
}

export function ClipSearchModal({ isOpen, onClose, onSelectReel }: ClipSearchModalProps) {
  const { spring } = useSpatialMotion();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClipSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    onClose();
  };

  // Debounced 150ms search execution (§6.1)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let isCurrent = true;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchClips(trimmed);
      if (isCurrent) {
        setResults(res);
        setSelectedIndex(0);
        setIsSearching(false);
      }
    }, 150);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Arrow key navigation & Enter jump (§6.1)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectReel(results[selectedIndex].reel);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  const handleSelectSuggestion = (term: string) => {
    setQuery(term);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={spring}
            className="relative w-full max-w-xl apple-glass-heavy rounded-3xl border border-white/[0.12] shadow-2xl overflow-hidden pointer-events-auto z-10 flex flex-col max-h-[75dvh]"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-white/[0.08]">
              <Search size={18} strokeWidth={1.5} className="text-white/48 ml-2" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search dialogue quotes, actors, directors, or scene tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-1 bg-transparent type-body text-white placeholder-white/40 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-white/48 hover:text-white p-1 transition-colors cursor-pointer mr-1"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 rounded apple-glass-thin type-meta text-white/48">
                ESC
              </kbd>
            </div>

            {/* Results / Empty / Suggested Content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {!query && (
                <div className="py-8 px-4 space-y-4">
                  <span className="type-meta-caps text-white/40 block">Suggested Searches</span>
                  <div className="flex flex-wrap gap-2">
                    {['Cillian Murphy', 'Tears in Rain', 'Hans Zimmer', 'Trinity Test', 'Caravan'].map(
                      (item) => (
                        <button
                          key={item}
                          onClick={() => handleSelectSuggestion(item)}
                          className="apple-glass-thin type-meta px-3 py-1.5 rounded-full text-white/72 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {query && !isSearching && results.length === 0 && (
                <NoResultsState query={query} onSelectSuggestion={handleSelectSuggestion} />
              )}

              {results.length > 0 && (
                <div className="space-y-1">
                  {results.map((res, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={`${res.reel.id}-${idx}`}
                        onClick={() => {
                          onSelectReel(res.reel);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/[0.12] border border-white/[0.16] shadow-md'
                            : 'hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        {/* Frame Thumbnail */}
                        <div className="relative w-14 aspect-[9/16] rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900">
                          <img
                            src={res.reel.posterUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Text and Snippet Match */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="type-label text-white truncate">
                              {res.reel.source.title}
                            </span>
                            <span className="type-meta text-white/40 capitalize">
                              · {res.matchedField}
                            </span>
                          </div>

                          <p className="type-body text-white/72 text-[13px] truncate mt-0.5">
                            {res.matchedSnippet}
                          </p>
                        </div>

                        {/* Jump Action Indicator */}
                        {isSelected && (
                          <div className="hidden sm:flex items-center gap-1 apple-glass-thin px-2 py-1 rounded text-white/72 text-xs">
                            <CornerDownLeft size={12} strokeWidth={1.5} />
                            <span className="type-meta">Jump</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="px-4 py-2.5 border-t border-white/[0.08] flex items-center justify-between type-meta text-white/40 bg-black/20">
              <span>↑↓ to navigate</span>
              <span>↵ to jump to reel</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
