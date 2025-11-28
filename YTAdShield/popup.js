// popup.js

function updateUI(settings) {
  const statusPill = document.getElementById("statusPill");
  const toggleBtn = document.getElementById("toggleBtn");
  const adsSkipped = document.getElementById("adsSkipped");
  const adsFastForwarded = document.getElementById("adsFastForwarded");
  const elementsHidden = document.getElementById("elementsHidden");

  const enabled = !!settings.enabled;
  const stats = settings.stats || {
    adsSkipped: 0,
    adsFastForwarded: 0,
    elementsHidden: 0
  };

  statusPill.textContent = enabled ? "Enabled" : "Paused";
  statusPill.className = "pill " + (enabled ? "on" : "off");
  toggleBtn.textContent = enabled ? "Pause Blocking" : "Resume Blocking";

  adsSkipped.textContent = stats.adsSkipped || 0;
  adsFastForwarded.textContent = stats.adsFastForwarded || 0;
  elementsHidden.textContent = stats.elementsHidden || 0;
}

function getSettings(callback) {
  chrome.runtime.sendMessage({ type: "getSettings" }, settings => {
    if (!settings) {
      settings = {
        enabled: true,
        stats: {
          adsSkipped: 0,
          adsFastForwarded: 0,
          elementsHidden: 0
        }
      };
    }
    callback(settings);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleBtn");

  getSettings(settings => {
    updateUI(settings);

    toggleBtn.onclick = () => {
      toggleBtn.disabled = true;

      chrome.runtime.sendMessage(
        { type: "toggleEnabled", enabled: !settings.enabled },
        newSettings => {
          settings = newSettings || settings;
          updateUI(settings);
          toggleBtn.disabled = false;
        }
      );
    };
  });
});
