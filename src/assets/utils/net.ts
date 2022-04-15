import { isHTTPS } from './protocol';

function openWindow(href: string, target?: string) {
  const linkTag = document.createElement('a');
  linkTag.href = href;
  linkTag.target = target || 'blank';
  linkTag.rel= 'noopener noreferrer';
  document.body.append(linkTag);
  linkTag.click();
  document.body.removeChild(linkTag);
}

/**
 * Download the given resouce from network in allowd condition.
 * @param src - Resouce to be downloaded
 * @param name - File name
 * @returns Promise with download result message
 */
export function download(src: string, name?: string) {
  return new Promise((resolve, reject) => {
    function downloadInBlankWindow() {
      openWindow(src);
      resolve('ok');
    }
    if (
      !window.URL.createObjectURL ||
      (isHTTPS(location.href) && !isHTTPS(src))
    ) {
      downloadInBlankWindow();
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', src, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      const url = window.URL.createObjectURL(xhr.response as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name || 'download';
      a.click();
      URL.revokeObjectURL(url);
      resolve('ok');
    };
    xhr.onerror = xhr.ontimeout = downloadInBlankWindow;
    xhr.onabort = () => reject(new Error('aborted'));
    xhr.send();
  });
}
