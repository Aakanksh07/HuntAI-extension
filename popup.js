const HUNTAI_SITE = "https://huntai-frontend.onrender.com"; // set this to your deployed frontend

async function refreshView() {
  const { huntai_token, huntai_email } = await chrome.storage.local.get(["huntai_token", "huntai_email"]);
  document.getElementById("connected").style.display    = huntai_token ? "block" : "none";
  document.getElementById("disconnected").style.display = huntai_token ? "none"  : "block";
  if (huntai_email) document.getElementById("emailDisplay").textContent = huntai_email;

  const { huntai_overlay_visible } = await chrome.storage.local.get("huntai_overlay_visible");
  const visible = huntai_overlay_visible !== false; // default true
  const toggleBtn = document.getElementById("toggleOverlay");
  toggleBtn.textContent = visible ? "🎯 Hide widget on pages" : "🎯 Show widget on pages";
}

document.getElementById("openSite").onclick = () => chrome.tabs.create({ url: HUNTAI_SITE });

document.getElementById("toggleOverlay").onclick = async () => {
  const { huntai_overlay_visible } = await chrome.storage.local.get("huntai_overlay_visible");
  const next = huntai_overlay_visible === false; // was hidden -> show; was visible/unset -> hide
  await chrome.storage.local.set({ huntai_overlay_visible: next });

  // Apply immediately to whatever tab the popup was opened from, so the
  // user doesn't have to refresh to see the effect. Other already-open
  // tabs will just pick up the new preference next time they load.
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "HUNTAI_TOGGLE_VISIBILITY", visible: next }, () => {
      if (chrome.runtime.lastError) { /* no content script on this tab (e.g. chrome:// page) — ignore */ }
    });
  }
  refreshView();
};

refreshView();
