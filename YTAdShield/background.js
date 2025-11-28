// background.js (service worker for YTAdShield)

const DEFAULT_SETTINGS = {
  enabled: true,
  stats: {
    adsSkipped: 0,
    adsFastForwarded: 0,
    elementsHidden: 0
  },
  whitelistChannels: [] // list of YouTube channel IDs to ignore
};

// ---- STORAGE HELPERS ----

function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get("settings", data => {
      let settings = data.settings;

      if (!settings) {
        settings = { ...DEFAULT_SETTINGS };
        chrome.storage.sync.set({ settings }, () => resolve(settings));
      } else {
        // Make sure any new keys exist
        settings.enabled ??= true;
        settings.stats ??= {};
        settings.stats.adsSkipped ??= 0;
        settings.stats.adsFastForwarded ??= 0;
        settings.stats.elementsHidden ??= 0;
        settings.whitelistChannels ??= [];

        chrome.storage.sync.set({ settings }, () => resolve(settings));
      }
    });
  });
}

function saveSettings(settings) {
  return new Promise(resolve => {
    chrome.storage.sync.set({ settings }, () => resolve());
  });
}

// Initialize defaults on install/update
chrome.runtime.onInstalled.addListener(async () => {
  await getSettings(); // ensures defaults exist
});

// ---- MESSAGE HANDLER ----

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.type === "getSettings") {
      const settings = await getSettings();
      sendResponse(settings);
      return;
    }

    if (msg.type === "toggleEnabled") {
      const settings = await getSettings();
      settings.enabled = !!msg.enabled;
      await saveSettings(settings);
      sendResponse(settings);
      return;
    }

    if (msg.type === "incrementStat") {
      const settings = await getSettings();
      const key = msg.key;

      if (
        settings.stats &&
        Object.prototype.hasOwnProperty.call(settings.stats, key)
      ) {
        settings.stats[key] += 1;
      }

      await saveSettings(settings);
      sendResponse(settings);
      return;
    }

    if (msg.type === "updateWhitelist") {
      const settings = await getSettings();
      settings.whitelistChannels = Array.isArray(msg.whitelistChannels)
        ? msg.whitelistChannels
        : [];
      await saveSettings(settings);
      sendResponse(settings);
      return;
    }
  })();

  // Tell Chrome we're responding asynchronously
  return true;
});
