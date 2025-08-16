import './notifications';
import OFFSCREEN_DOCUMENT_PATH from 'url:~src/offscreen.html';

async function hasDocument() {
  // Check all windows controlled by the service worker if one of them is the offscreen document
  // @ts-expect-error clients
  const matchedClients = await clients.matchAll();
  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
      return true;
    }
  }
  return false;
}

async function createOffscreenDocument() {
  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.WEB_RTC],
      justification: 'P2P data transfer',
    });
  }
}

createOffscreenDocument();

chrome.runtime.onStartup.addListener(createOffscreenDocument);
self.onmessage = (_e) => {
  // Keep the offscreen document alive
};
