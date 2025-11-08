chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToBookmarks",
    title: "Add this page to Bookmark Manager",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "addToBookmarks" || !tab) return;

  const stored = await chrome.storage.local.get("bookmarks");
  const bookmarks = stored.bookmarks || [];

  const newBookmark = {
    id: Date.now(),
    title: tab.title,
    url: tab.url,
    tags: "from context menu"
  };

  await chrome.storage.local.set({ bookmarks: [...bookmarks, newBookmark] });
});
