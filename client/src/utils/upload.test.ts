import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./api', () => {
  return {
    default: {
      post: vi.fn(),
    },
  };
});

import api from './api';
import { uploadFile, uploadFiles } from './upload';

const mockPost = api.post as unknown as ReturnType<typeof vi.fn>;

function makeFile(name: string, sizeBytes = 10) {
  // jsdom Blob is constructable from arrays of bytes
  return new File([new Uint8Array(sizeBytes)], name, { type: 'image/png' });
}

describe('uploadFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockReset();
  });

  it('posts to /upload/file and returns the result', async () => {
    const file = makeFile('a.png');
    mockPost.mockResolvedValue({
      data: { key: 'k', publicUrl: '/u/a.png', thumbnailUrl: '/t/a.png', size: 10 },
    });

    const result = await uploadFile(file);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe('/upload/file');
    expect(result).toEqual({ key: 'k', publicUrl: '/u/a.png', thumbnailUrl: '/t/a.png', size: 10 });
  });

  it('forwards progress to the callback as percentage 0..100', async () => {
    const file = makeFile('a.png');
    mockPost.mockImplementation((_url, _data, config: any) => {
      // Simulate the axios onUploadProgress callback firing with 50% loaded
      config.onUploadProgress?.({ loaded: 50, total: 100 });
      return Promise.resolve({ data: { key: 'k', publicUrl: '/u', thumbnailUrl: '/t', size: 10 } });
    });

    const seen: number[] = [];
    await uploadFile(file, (p) => seen.push(p));

    expect(seen).toEqual([50]);
  });
});

describe('uploadFiles — per-file progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockReset();
  });

  it('issues one POST per file (parallel, real per-file progress)', async () => {
    const files = [makeFile('a.png'), makeFile('b.png'), makeFile('c.png')];
    let callIndex = 0;
    mockPost.mockImplementation((_url: string, _data: any, config: any) => {
      const myIndex = callIndex++;
      // Each file reports a different progress curve
      const finalPct = (myIndex + 1) * 30; // 30, 60, 90
      config.onUploadProgress?.({ loaded: finalPct, total: 100 });
      return Promise.resolve({
        data: { key: `k${myIndex}`, publicUrl: `/u/${myIndex}.png`, thumbnailUrl: `/t/${myIndex}.png`, size: 1 },
      });
    });

    const seen: Array<[number, number]> = [];
    const results = await uploadFiles(files, (i, p) => seen.push([i, p]));

    expect(mockPost).toHaveBeenCalledTimes(3);
    expect(mockPost.mock.calls.every(([url]) => url === '/upload/file')).toBe(true);
    expect(results.map((r) => r.key)).toEqual(['k0', 'k1', 'k2']);
    expect(results.map((r) => r.publicUrl)).toEqual(['/u/0.png', '/u/1.png', '/u/2.png']);

    // The (index, progress) pairs report each file's own percentage — not
    // a single shared "overall" percentage distributed to all files.
    const byIndex: Record<number, number> = {};
    for (const [i, p] of seen) byIndex[i] = p;
    expect(byIndex).toEqual({ 0: 30, 1: 60, 2: 90 });
  });

  it('returns results in the same order as the input files array', async () => {
    const files = [makeFile('a'), makeFile('b'), makeFile('c')];
    let callIndex = 0;
    mockPost.mockImplementation((_url: string, _data: any, config: any) => {
      // Resolve in reverse order to prove the .map() index pins results
      const myIndex = callIndex++;
      const delay = 50 - myIndex * 10; // c fastest, a slowest
      return new Promise((resolve) => {
        setTimeout(() => {
          config.onUploadProgress?.({ loaded: 100, total: 100 });
          resolve({ data: { key: `k${myIndex}`, publicUrl: `/u/${myIndex}`, thumbnailUrl: `/t/${myIndex}`, size: 1 } });
        }, delay);
      });
    });

    const results = await uploadFiles(files);

    expect(results.map((r) => r.key)).toEqual(['k0', 'k1', 'k2']);
  });

  it('rejects the whole promise when any single upload fails', async () => {
    const files = [makeFile('a'), makeFile('b')];
    let callIndex = 0;
    mockPost.mockImplementation((_url: string, _data: any, _config: any) => {
      const myIndex = callIndex++;
      if (myIndex === 0) {
        return Promise.resolve({ data: { key: 'k0', publicUrl: '/u/0', thumbnailUrl: '/t/0', size: 1 } });
      }
      return Promise.reject(new Error('Network error'));
    });

    await expect(uploadFiles(files)).rejects.toThrow('Network error');
  });

  it('passes a no-op progress when callback is omitted', async () => {
    const files = [makeFile('a')];
    mockPost.mockImplementation((_url: string, _data: any, config: any) => {
      config.onUploadProgress?.({ loaded: 100, total: 100 });
      return Promise.resolve({ data: { key: 'k', publicUrl: '/u', thumbnailUrl: '/t', size: 1 } });
    });

    const results = await uploadFiles(files);
    expect(results).toHaveLength(1);
  });
});
