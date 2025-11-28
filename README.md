# YTAdShield 🛡️

**YTAdShield** is an advanced YouTube ad-blocking extension built on **Chrome Manifest V3** that gives you more control over your viewing experience—block, skip, fast-forward, and hide ads while still supporting creators you love.

> ⚠️ For personal use only. You are responsible for complying with YouTube’s Terms of Service and local laws. This project is not affiliated with or endorsed by Google or YouTube.

---

## ✨ Features

- 🚫 **Network-level ad blocking** using `declarativeNetRequest`
- ⏭️ **Auto-skip skippable ads** the moment they appear
- ⏩ **Fast-forwards & mutes unskippable ads** automatically
- 🧹 **Removes ad elements**, including:
  - Overlay banners  
  - In-player promotions  
  - “Sponsored” feed items  
- 📊 **Real-time stats in popup**:
  - Ads skipped  
  - Ads fast-forwarded  
  - Ad elements hidden  
- 🧑‍🤝‍🧑 **Per-channel whitelisting** – support creators you care about
- 🌑 **Clean, dark UI** with quick toggle and status indicators

---

## 🧩 How It Works

YTAdShield combines multiple techniques for comprehensive ad protection:

- `declarativeNetRequest` rules block known ad/tracking endpoints at the **network level**
- A **content script** monitors player state to detect and handle ads in real time
- A **background service worker** manages settings, stats, and cross-component messaging

---

## 🛠 Installation (Developer Mode)

1. **Clone the repo:**

   ```bash
   git clone https://github.com/Ninnyyy/YTAdShield.git
   cd YTAdShield
   ```

2. **Open your browser's extensions page:**

   - Chrome / Brave: `chrome://extensions`  
   - Edge: `edge://extensions`  

3. **Enable Developer mode** (top-right toggle).

4. Click **“Load unpacked”** and select the **`YTAdShield`** folder.

5. Pin the extension for easy access (via the puzzle icon).

---

## 🎮 Usage

- Browse YouTube as usual.  
- **Skippable ads** → auto-skipped instantly.  
- **Unskippable ads** → sped up & muted until they end.  
- **Promoted content** → hidden from feed/player where possible.  

Click the **YTAdShield** icon to:

- Toggle **on/off**
- View **real-time stats**
- Check current **status**

---

## 🤝 Whitelist Your Favorite Creators

Support channels you want to see thrive:

1. Right-click the **YTAdShield** icon → **Options**
2. Add YouTube **channel IDs** (one per line)
3. Click **Save**

On whitelisted channels:

- Ads play normally  
- No auto-skip or fast-forward  
- Your support goes directly to creators  

---

## 📂 Project Structure

```text
YTAdShield/
 ├─ manifest.json              # MV3 configuration
 ├─ background.js              # Service worker (storage, messaging)
 ├─ contentScript.js           # Ad detection & DOM manipulation
 ├─ rules_yt_ads.json          # Network blocking rules
 ├─ popup.html / popup.js      # Toolbar popup UI & logic
 ├─ options.html / options.js  # Whitelist settings page
 └─ README.md                  # This file
```

---

## 🧪 Development Notes

- Built for **Manifest V3** compliance  
- Settings & stats sync via `chrome.storage.sync`  
- After code changes, reload the extension via `chrome://extensions` (click **Reload** on YTAdShield)

---

## 📌 Roadmap

- 📈 Enhanced stats (skippable vs. unskippable breakdown)
- 🔄 Dynamic rule updates
- 💾 Export/import settings & whitelist
- 🐞 Debug panel in popup
- 🦊 Firefox/WebExtension support
- 🌿 “Soft mode” – hide ads without altering playback

PRs, issues, and suggestions welcome!

---

## ⚖️ License

MIT License – see [`LICENSE`](LICENSE) for details.

---

## 🙌 Credits

Created by [**@Ninnyyy**](https://github.com/Ninnyyy).  
For those who value their time and want control over their YouTube experience.
