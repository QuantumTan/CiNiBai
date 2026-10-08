/**
 * Timecode-Synchronized Discussion Drawer (§6.2)
 * Heavy-glass slide-over (desktop: right drawer; mobile: bottom sheet)
 * Displays reactions tied to timestampMs, auto-scrolled to current playback time.
 */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, Heart } from 'lucide-react';
import type { DiscussionComment, Reel } from '../../lib/reels/types';
import { fetchReelDiscussions, addReelComment } from '../../lib/reels/api';
import { useSpatialMotion } from '../../lib/motion';

interface DiscussionDrawerProps {
  isOpen: boolean;
  reel: Reel;
  currentTimeMs: number;
  onClose: () => void;
  onSeekToMs: (timestampMs: number) => void;
}

function formatMs(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function DiscussionDrawer({
  isOpen,
  reel,
  currentTimeMs,
  onClose,
  onSeekToMs,
}: DiscussionDrawerProps) {
  const { spring } = useSpatialMotion();
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [inputText, setInputText] = useState('');
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  
  const commentsListRef = useRef<HTMLDivElement>(null);
  const activeCommentRef = useRef<HTMLDivElement>(null);

  // Fetch comments when opened or reel changes
  useEffect(() => {
    if (isOpen && reel) {
      fetchReelDiscussions(reel.id).then(setComments);
    }
  }, [isOpen, reel]);

  // Auto-scroll to closest comment to playback time (§6.2)
  useEffect(() => {
    if (!isOpen || comments.length === 0) return;
    
    // Find closest comment by timestampMs
    let closestIndex = 0;
    let minDiff = Infinity;
    comments.forEach((c, idx) => {
      const diff = Math.abs(c.timestampMs - currentTimeMs);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    const list = commentsListRef.current;
    if (list && list.children[closestIndex]) {
      const targetChild = list.children[closestIndex] as HTMLElement;
      targetChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentTimeMs, isOpen, comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment = await addReelComment(
      reel.id,
      'Audience Member',
      inputText.trim(),
      currentTimeMs,
      undefined
    );

    setComments((prev) => [...prev, newComment]);
    setInputText('');
  };

  const toggleCommentLike = (commentId: string) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
          />

          {/* Drawer Panel - Desktop: right rail (420px); Mobile: bottom sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={spring}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reel-comments-title"
            className="relative w-full max-w-[420px] h-full apple-glass-heavy border-l border-white/[0.08] flex flex-col pointer-events-auto z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
              <div>
                <h2 id="reel-comments-title" className="type-section-title text-white">Reactions & Notes</h2>
                <p className="type-meta text-white/48 mt-0.5">
                  Synchronized with film playback time
                </p>
              </div>

              <button
                onClick={onClose}
                className="min-h-11 min-w-11 rounded-full apple-glass-thin flex items-center justify-center text-white/72 hover:text-white transition-colors focus-optical cursor-pointer"
                aria-label="Close discussion"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Comments List */}
            <div
              ref={commentsListRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
            >
              {comments.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <Clock size={24} strokeWidth={1.5} className="mx-auto text-white/30" />
                  <p className="type-label text-white/60">No timestamps recorded yet</p>
                  <p className="type-meta text-white/40">
                    Be the first to attach a reaction to this scene.
                  </p>
                </div>
              ) : (
                comments.map((comment) => {
                  const isCurrent = Math.abs(comment.timestampMs - currentTimeMs) < 3000;
                  const isLiked = !!likedComments[comment.id];

                  return (
                    <div
                      key={comment.id}
                      ref={isCurrent ? activeCommentRef : undefined}
                      className={`p-3.5 rounded-2xl transition-all duration-300 ${
                        isCurrent
                          ? 'bg-white/[0.08] border border-white/[0.14] shadow-lg'
                          : 'bg-white/[0.02] border border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {comment.avatarUrl ? (
                            <img src={comment.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                          ) : (
                            <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full bg-white/14 text-[10px] font-bold text-white">
                              {comment.author.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <span className="type-label text-white/90">{comment.author}</span>
                          {comment.reaction && (
                            <span className="text-xs">{comment.reaction}</span>
                          )}
                        </div>

                        {/* Timestamp Seek Button (§6.2: tap to seek) */}
                        <button
                          onClick={() => onSeekToMs(comment.timestampMs)}
                          className="inline-flex min-h-11 items-center gap-1 px-2 py-0.5 rounded-md apple-glass-thin type-meta text-white/72 hover:text-white transition-colors cursor-pointer"
                          title="Seek to this moment"
                        >
                          <Clock size={11} strokeWidth={1.5} />
                          <span>{formatMs(comment.timestampMs)}</span>
                        </button>
                      </div>

                      <p className="type-body text-white/80 leading-relaxed text-[14px]">
                        {comment.text}
                      </p>

                      <div className="flex items-center justify-end mt-2 pt-1 border-t border-white/[0.04]">
                        <button
                          onClick={() => toggleCommentLike(comment.id)}
                          className="inline-flex min-h-11 items-center gap-1 px-2 type-meta text-white/48 hover:text-white transition-colors cursor-pointer"
                        >
                          <Heart
                            size={12}
                            strokeWidth={1.5}
                            className={isLiked ? 'text-white fill-white' : ''}
                          />
                          <span>{comment.likes + (isLiked ? 1 : 0)}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer (§6.2: text + reaction set + current timestamp) */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center text-xs text-white/60">
                <span className="type-meta text-white/60 flex items-center gap-1">
                  <Clock size={12} strokeWidth={1.5} />
                  <span>Pinning note at {formatMs(currentTimeMs)}</span>
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Record an observation at this frame..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full min-h-11 pl-4 pr-14 py-2.5 rounded-full apple-glass-thin type-body text-white placeholder-white/36 border border-white/[0.1] focus-optical transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-0 min-h-11 min-w-11 rounded-full apple-glass-regular flex items-center justify-center text-white disabled:opacity-30 transition-opacity cursor-pointer"
                >
                  <Send size={14} strokeWidth={1.5} />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
