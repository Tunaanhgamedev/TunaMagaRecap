export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const getProxyImageUrl = (url: string, referer?: string): string => {
  if (!url) return '';
  // Avoid double-proxying if URL is already a proxy URL
  if (url.includes('/api/proxy-image') || url.includes('/proxy-image?')) {
    if (url.startsWith('/api/proxy-image')) {
      const serverOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
      return `${serverOrigin}${url}`;
    }
    return url;
  }
  // Local blobs or base64 data URLs
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const params = new URLSearchParams({ url });
  if (referer) params.set('referer', referer);
  return `${API_BASE_URL}/proxy-image?${params.toString()}`;
};

