// contentScript.js

let settings = null;
let adObserver = null;
let domObserver = null;

// === SETTINGS ===

function fetchSettings() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: "getSettings" }, res => {
      if (!res) {
        res = {
          enabled: true,
          stats: {
            adsSkipped: 0,
            adsFastForwarded: 0,
            elementsHidden: 0
          },
          whitelistChannels: []
        };
      }
      settings = res;
      resolve(res);
    });
  });
}

function periodicallyRefreshSettings() {
  // Refresh settings every 10 seconds so toggling works without reload
  setInterval(() => {
    fetchSettings().catch(() => {});
  }, 10000);
}

// === UTILITIES ===

function isWhitelistedChannel() {
  try {
    if (!settings || !Array.isArray(settings.whitelistChannels)) return false;

    const meta = document.querySelector('meta[itemprop="channelId"]');
    const channelId = meta ? meta.getAttribute("content") : null;
    if (!channelId) return false;

    return settings.whitelistChannels.includes(channelId);
  } catch {
    return false;
  }
}

function getPlayer() {
  return document.querySelector("video.html5-main-video");
}

function isAdPlaying() {
  // YouTube tends to add ad-specific classes/overlays when ads show
  const adContainer = document.querySelector(".ad-showing, .ytp-ad-player-overlay");
  const adText = document.querySelector(".ytp-ad-text, .ytp-ad-preview-text, .ytp-ad-simple-ad-badge");
  const adIndicator = document.querySelector(".ytp-ad-module");
  return !!(adContainer || adText || adIndicator);
}

function clickSkipButton() {
  const skipBtn = document.querySelector(".ytp-ad-skip-button, .ytp-ad-skip-button-modern");
  if (skipBtn && skipBtn.offsetParent !== null) {
    skipBtn.click();
    chrome.runtime.sendMessage({ type: "incrementStat", key: "adsSkipped" }, () => {});
  }
}

// === AD HANDLING ===

function handleAdState() {
  if (!settings || !settings.enabled) return;
  if (isWhitelistedChannel()) return;

  const video = getPlayer();
  if (!video) return;

  if (isAdPlaying()) {
    // Try to click skip asap
    clickSkipButton();

    const hasSkip = !!document.querySelector(".ytp-ad-skip-button, .ytp-ad-skip-button-modern");

    // If unskippable, fast-forward + mute
    if (!hasSkip) {
      if (!video.dataset._ytadshieldAdHandling) {
        video.dataset._ytadshieldAdHandling = "true";
        video.dataset._ytadshieldPrevRate = String(video.playbackRate || 1);
        video.dataset._ytadshieldPrevMuted = String(video.muted);

        // Aggressive fast-forward
        try {
          video.playbackRate = 16;
        } catch {
          video.playbackRate = 2;
        }
        video.muted = true;

        chrome.runtime.sendMessage(
          { type: "incrementStat", key: "adsFastForwarded" },
          () => {}
        );
      }
    }
  } else {
    // Restore player state if we modified it
    if (video && video.dataset._ytadshieldAdHandling) {
      const prevRate = parseFloat(video.dataset._ytadshieldPrevRate || "1");
      const prevMuted = video.dataset._ytadshieldPrevMuted === "true";

      video.playbackRate = isNaN(prevRate) ? 1 : prevRate;
      video.muted = prevMuted;

      delete video.dataset._ytadshieldAdHandling;
      delete video.dataset._ytadshieldPrevRate;
      delete video.dataset._ytadshieldPrevMuted;
    }
  }
}

// === DOM CLEANUP ===

function removeAdElements() {
  if (!settings || !settings.enabled) return;
  if (isWhitelistedChannel()) return;

  const selectors = [
    "#player-ads",
    ".ytp-ad-module",
    ".ytp-ad-image-overlay",
    ".ytp-ad-overlay-container",
    ".ytp-ad-overlay-slot",
    "ytd-companion-slot-renderer",
    "ytd-promoted-sparkles-text-search-renderer",
    "ytd-promoted-sparkles-web-renderer",
    "ytd-display-ad-renderer",
    "ytd-video-masthead-ad-v3-renderer",
    "ytd-in-feed-ad-layout-renderer",
    "ytd-rich-item-renderer[is-ad]",
    "ytd-ad-slot-renderer",
    "ytm-promoted-video",
    "ytm-companion-slot",
    "ytm-merch-shelf-renderer"
  ];

  let removed = 0;

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.dataset._ytadshieldHidden) {
        el.style.display = "none";
        el.setAttribute("hidden", "true");
        el.dataset._ytadshieldHidden = "true";
        removed++;
      }
    });
  });

  if (removed > 0) {
    chrome.runtime.sendMessage(
      { type: "incrementStat", key: "elementsHidden" },
      () => {}
    );
  }
}

// === MUTATION OBSERVERS ===

function setupMutationObservers() {
  if (adObserver) adObserver.disconnect();
  if (domObserver) domObserver.disconnect();

  const target = document.body;
  if (!target) return;

  adObserver = new MutationObserver(() => {
    handleAdState();
  });

  domObserver = new MutationObserver(() => {
    removeAdElements();
  });

  adObserver.observe(target, { childList: true, subtree: true });
  domObserver.observe(target, { childList: true, subtree: true });
}

// Handle youtube SPA navigation (no full page reload)
function hookYouTubeNavigation() {
  window.addEventListener("yt-navigate-finish", () => {
    // Delay a bit so new DOM is ready
    setTimeout(() => {
      handleAdState();
      removeAdElements();
    }, 500);
  });
}

// === INIT ===

async function init() {
  await fetchSettings();
  periodicallyRefreshSettings();
  setupMutationObservers();
  hookYouTubeNavigation();

  // Poll as a backup to observers
  setInterval(() => {
    handleAdState();
    removeAdElements();
  }, 1000);
}

init();
