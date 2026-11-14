import { describe, it, expect } from 'vitest';
import {
  PROVIDER_IDS,
  getProviders,
  getDefaultProvider,
  getProviderById,
} from './providers';

describe('Streaming Providers Registry', () => {
  it('should export unique mirror IDs for all active providers', () => {
    const providers = getProviders();
    const ids = providers.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    expect(uniqueIds.size).toBe(16);
  });

  it('should return a non-empty list of providers', () => {
    const providers = getProviders();
    expect(providers.length).toBeGreaterThanOrEqual(16);
  });

  it('should generate valid movie and TV URLs for every provider', () => {
    const providers = getProviders();
    for (const provider of providers) {
      const movieUrl = provider.getMovieUrl(550, 'tt0137523');
      const tvUrl = provider.getTVUrl(1399, 1, 1, 'tt0944947');

      expect(movieUrl).toMatch(/^https:\/\//);
      expect(movieUrl).toContain('550');

      expect(tvUrl).toMatch(/^https:\/\//);
      expect(tvUrl).toContain('1399');
      expect(provider.host).toBeTruthy();
      expect(provider.name).toBeTruthy();
    }
  });

  it('should return default provider correctly', () => {
    const defaultProvider = getDefaultProvider();
    expect(defaultProvider).toBeDefined();
    expect(defaultProvider.id).toBe(PROVIDER_IDS.VIDEASY);
  });

  it('should look up providers by ID', () => {
    const p1 = getProviderById(PROVIDER_IDS.VIDLINK);
    expect(p1).toBeDefined();
    expect(p1?.name).toContain('VidLink');

    const p10 = getProviderById(PROVIDER_IDS.VIDEASY);
    expect(p10).toBeDefined();
    expect(p10?.name).toContain('Videasy');

    const invalid = getProviderById('non-existent-id');
    expect(invalid).toBeUndefined();
  });
});
