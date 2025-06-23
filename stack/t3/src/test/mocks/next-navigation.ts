import { vi } from 'vitest';

// Mock next/navigation module
export const useRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
});

export const useSearchParams = () => ({
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  toString: () => '',
});

export const usePathname = () => '/';

export const useParams = () => ({});

export const redirect = vi.fn();

export default {
  useRouter,
  useSearchParams,
  usePathname,
  useParams,
  redirect,
}; 