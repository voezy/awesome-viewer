/**
 * Check HTTPS URL
 * @param url - URL string
 * @returns result
 */
export function isHTTPS(url = '') {
  return url?.startsWith('https');
}
