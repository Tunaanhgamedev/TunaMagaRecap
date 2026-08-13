export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const getProxyImageUrl = (url: string, referer?: string): string => {
  const params = new URLSearchParams({ url });
  if (referer) params.set('referer', referer);
  return `${API_BASE_URL}/proxy-image?${params.toString()}`;
};
