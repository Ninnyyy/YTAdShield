// options.js

function getSettings() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: "getSettings" }, settings => {
      if (!settings) {
        settings = {
          enabled: true,
          stats: {
            adsSkipped: 0,
            adsFastForwarded: 0,
            elementsHidden: 0
          },
          whitelistChannels: []
        };
      }
      resolve(settings);
    });
  });
}

function updateWhitelist(whitelistChannels) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      { type: "updateWhitelist", whitelistChannels },
      updated => {
        resolve(updated);
      }
    );
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const textarea = document.getElementById("whitelist");
  const saveBtn = document.getElementById("saveBtn");
  const statusEl = document.getElementById("status");

  // Load current settings
  const settings = await getSettings();
  if (Array.isArray(settings.whitelistChannels)) {
    textarea.value = settings.whitelistChannels.join("\n");
  }

  // Save handler
  saveBtn.addEventListener("click", async () => {
    const lines = textarea.value
      .split("\n")
      .map(x => x.trim())
      .filter(x => x.length > 0);

    await updateWhitelist(lines);

    statusEl.textContent = "Saved!";
    setTimeout(() => {
      statusEl.textContent = "";
    }, 1500);
  });
});
