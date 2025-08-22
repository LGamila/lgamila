import "./notifications";
import OFFSCREEN_DOCUMENT_PATH from "url:~src/offscreen.html";

async function hasDocument() {
  // Only run if clients API is available (MV3 service worker)
  if (typeof clients === "undefined") {
    // In Firefox MV2, always return false or handle differently
    console.warn("Clients API not available, assuming no offscreen document.");
    return false;
  }
  // @ts-expect-error clients
  const matchedClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
      return true;
    }
  }
  return false;
}

async function createOffscreenDocument() {
  if (
    typeof chrome !== "undefined" &&
    chrome.offscreen &&
    typeof chrome.offscreen.createDocument === "function"
  ) {
    if (!(await hasDocument())) {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.WEB_RTC],
        justification: "P2P data transfer",
      });
    }
  } else {
    // Offscreen documents not supported (Firefox, MV2)
    console.warn("Offscreen documents not supported in this browser.");
  }
}

createOffscreenDocument();

chrome.runtime.onStartup.addListener(createOffscreenDocument);
self.onmessage = (_e) => {
  // Keep the offscreen document alive
};
