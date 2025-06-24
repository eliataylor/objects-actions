// Mock next/server module
export const cookies = () => {
  return {
    get: () => null,
    set: () => null,
    delete: () => null,
  };
};

export const headers = () => {
  return {
    get: () => null,
    set: () => null,
    delete: () => null,
  };
};

export const NextResponse = {
  json: (body: unknown) => ({ body }),
  redirect: (url: string) => ({ url }),
};

export default {
  cookies,
  headers,
  NextResponse,
}; 