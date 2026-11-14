import { describe, it, expect, beforeEach } from 'vitest';
import { getTMDBToken, setTMDBToken, hasTMDBToken, getTMDBErrorMessage } from './tmdb';

describe('tmdb token management', () => {
  beforeEach(() => {
    delete (window as unknown as { __TMDB_TOKEN__?: string }).__TMDB_TOKEN__;
    localStorage.clear();
  });

  it('reports Missing TMDB token when no token is present', () => {
    const msg = getTMDBErrorMessage(new Error('Missing TMDB token'));
    expect(msg).toBe('Missing TMDB token');
  });

  it('sets and retrieves token from window and localStorage', () => {
    setTMDBToken('test_token_123');
    expect(hasTMDBToken()).toBe(true);
    expect(getTMDBToken()).toBe('test_token_123');
    expect(localStorage.getItem('tmdb_access_token')).toBe('test_token_123');

    // Clears stored override token
    setTMDBToken('');
    expect(localStorage.getItem('tmdb_access_token')).toBeNull();
  });

  it('formats various error formats cleanly', () => {
    expect(getTMDBErrorMessage(null)).toBe('TMDB request failed');
    expect(getTMDBErrorMessage('rate limited')).toBe('Rate limited');
    expect(getTMDBErrorMessage(new Error('Rate limit exceeded'))).toBe('Rate limited: Rate limit exceeded');
    expect(getTMDBErrorMessage(new Error('TMDB request failed: 404'))).toBe('TMDB request failed: 404');
    expect(getTMDBErrorMessage('Network error')).toBe('TMDB request failed: Network error');
  });
});
