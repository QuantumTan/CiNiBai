import { describe, it, expect } from 'vitest';
import swCode from '../../public/sw.js?raw';

function loadServiceWorkerHarness() {
  const listeners = new Map<string, (event: any) => void>();
  const cacheStore = new Map<string, Response>();

  const mockCache = {
    match: async (key: string) => cacheStore.get(key),
    put: async (key: string, res: Response) => {
      cacheStore.set(key, res);
    },
  };

  const cachesApi = {
    open: async () => mockCache,
    keys: async () => ['cinebai-tmdb-metadata-v1', 'stale-cache'],
    delete: async () => true,
  };

  let fetchImpl: (req: Request) => Promise<Response> = async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  const selfMock = {
    addEventListener: (type: string, cb: (event: any) => void) => {
      listeners.set(type, cb);
    },
    skipWaiting: async () => undefined,
    clients: { claim: async () => undefined },
  };

  const runner = new Function(
    'self',
    'caches',
    'fetch',
    'URL',
    'Response',
    'Request',
    'Headers',
    `${swCode}\nreturn { isCacheableTmdbMetadataRequest };`,
  );

  const exports = runner(
    selfMock,
    cachesApi,
    (req: Request) => fetchImpl(req),
    URL,
    Response,
    Request,
    Headers,
  ) as { isCacheableTmdbMetadataRequest: (req: Request) => boolean };

  const dispatchFetch = async (request: Request) => {
    const handler = listeners.get('fetch');
    if (!handler) throw new Error('fetch listener not registered');
    let respondedWith: Promise<Response> | null = null;
    const waitUntils: Promise<unknown>[] = [];
    handler({
      request,
      respondWith: (p: Promise<Response>) => {
        respondedWith = p;
      },
      waitUntil: (p: Promise<unknown>) => {
        waitUntils.push(p);
      },
    });
    const res = respondedWith ? await respondedWith : null;
    await Promise.all(waitUntils);
    return res;
  };

  return {
    isCacheable: exports.isCacheableTmdbMetadataRequest,
    cacheStore,
    dispatchFetch,
    setFetchImpl: (fn: (req: Request) => Promise<Response>) => {
      fetchImpl = fn;
    },
  };
}

describe('public/sw.js metadata-only caching', () => {
  it('accepts TMDB metadata GET requests and rejects media or non-GET requests', () => {
    const { isCacheable } = loadServiceWorkerHarness();

    expect(isCacheable(new Request('https://api.themoviedb.org/3/movie/550'))).toBe(true);
    expect(isCacheable(new Request('https://api.themoviedb.org/3/movie/550', { method: 'POST' }))).toBe(false);
    expect(isCacheable(new Request('https://image.tmdb.org/t/p/w500/poster.jpg'))).toBe(false);
    expect(isCacheable(new Request('https://api.themoviedb.org/assets/clip.mp4'))).toBe(false);
    expect(isCacheable(new Request('https://cdn.example.com/stream.m3u8'))).toBe(false);
  });

  it('caches TMDB JSON metadata on visit 1 and serves cached copy when offline on visit 2', async () => {
    const { cacheStore, dispatchFetch, setFetchImpl } = loadServiceWorkerHarness();
    const url = 'https://api.themoviedb.org/3/movie/550';

    setFetchImpl(async () =>
      new Response(JSON.stringify({ id: 550, title: 'Fight Club' }), {
        status: 200,
        headers: { 'Content-Type': 'Application/JSON; charset=utf-8' },
      }),
    );

    const firstRes = await dispatchFetch(new Request(url));
    expect(firstRes).not.toBeNull();
    expect(await firstRes!.json()).toEqual({ id: 550, title: 'Fight Club' });
    expect(cacheStore.has(url)).toBe(true);

    setFetchImpl(async () => {
      throw new Error('Offline');
    });

    const secondRes = await dispatchFetch(new Request(url));
    expect(secondRes).not.toBeNull();
    expect(await secondRes!.json()).toEqual({ id: 550, title: 'Fight Club' });
  });

  it('never caches non-JSON or error responses from TMDB origin', async () => {
    const { cacheStore, dispatchFetch, setFetchImpl } = loadServiceWorkerHarness();
    const url = 'https://api.themoviedb.org/3/movie/999';

    setFetchImpl(async () =>
      new Response('<html>oops</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }),
    );
    await dispatchFetch(new Request(url));
    expect(cacheStore.has(url)).toBe(false);

    setFetchImpl(async () =>
      new Response(JSON.stringify({ status_message: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await dispatchFetch(new Request(url));
    expect(cacheStore.has(url)).toBe(false);
  });
});
