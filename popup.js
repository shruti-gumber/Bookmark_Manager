document.addEventListener("DOMContentLoaded", loadBookmarks);

const addBtn = document.getElementById("add-bookmark-btn");
const searchInput = document.getElementById("search-input");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const deleteSelectedBtn = document.getElementById("delete-selected-btn");

addBtn.addEventListener("click", addBookmark);
searchInput.addEventListener("input", searchBookmarks);
exportBtn.addEventListener("click", exportBookmarks);
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", importBookmarks);
deleteSelectedBtn.addEventListener("click", deleteSelectedBookmarks);

async function loadBookmarks() {
  const { bookmarks } = await chrome.storage.local.get("bookmarks");
  displayBookmarks(bookmarks || []);
}

async function addBookmark() {
  const title = document.getElementById("bookmark-title").value.trim();
  const url = document.getElementById("bookmark-url").value.trim();
  const tags = document.getElementById("bookmark-tags").value.trim();

  if (!title || !url) {
    alert("Please fill in both title and URL.");
    return;
  }

  const { bookmarks } = await chrome.storage.local.get("bookmarks");
  const newBookmark = { id: Date.now(), title, url, tags };
  const updatedBookmarks = bookmarks ? [...bookmarks, newBookmark] : [newBookmark];

  await chrome.storage.local.set({ bookmarks: updatedBookmarks });
  displayBookmarks(updatedBookmarks);

  document.getElementById("bookmark-title").value = "";
  document.getElementById("bookmark-url").value = "";
  document.getElementById("bookmark-tags").value = "";
}

function displayBookmarks(bookmarks) {
  const list = document.getElementById("bookmark-list");
  list.innerHTML = "";

  bookmarks.forEach((bookmark) => {
    const card = document.createElement("div");
    card.className = "bookmark-card";

    const qIndex = bookmark.url.indexOf("?");
    const displayUrl = qIndex !== -1 ? bookmark.url.substring(0, qIndex) : bookmark.url;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <input type="checkbox" class="select-bookmark" data-id="${bookmark.id}">
        <div class="bookmark-info">
          <a href="${bookmark.url}" target="_blank" class="bookmark-title">${bookmark.title}</a>
          <div class="bookmark-tags">${bookmark.tags ? "Tags: " + bookmark.tags : ""}</div>
          <div class="bookmark-url">${displayUrl}</div>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn edit-btn" data-id="${bookmark.id}">Edit</button>
        <button class="btn delete-btn" data-id="${bookmark.id}">Delete</button>
      </div>
    `;

    card.querySelector(".delete-btn").addEventListener("click", () => deleteBookmark(bookmark.id));
    card.querySelector(".edit-btn").addEventListener("click", () => editBookmark(bookmark.id));

    list.appendChild(card);
  });
}

async function deleteBookmark(id) {
  if (!confirm("Delete this bookmark?")) return;

  const { bookmarks } = await chrome.storage.local.get("bookmarks");
  const updatedBookmarks = bookmarks.filter((b) => b.id !== id);

  await chrome.storage.local.set({ bookmarks: updatedBookmarks });
  displayBookmarks(updatedBookmarks);
}

async function deleteSelectedBookmarks() {
  const selected = document.querySelectorAll(".select-bookmark:checked");
  if (selected.length === 0) {
    alert("No bookmarks selected.");
    return;
  }

  if (!confirm(`Delete ${selected.length} selected bookmark(s)?`)) return;

  const idsToDelete = Array.from(selected).map((item) => parseInt(item.dataset.id));
  const { bookmarks } = await chrome.storage.local.get("bookmarks");
  const updatedBookmarks = bookmarks.filter((b) => !idsToDelete.includes(b.id));

  await chrome.storage.local.set({ bookmarks: updatedBookmarks });
  displayBookmarks(updatedBookmarks);
}

async function editBookmark(id) {
  const { bookmarks } = await chrome.storage.local.get("bookmarks");
  const bookmark = bookmarks.find((b) => b.id === id);

  const newTitle = prompt("Edit title:", bookmark.title);
  const newUrl = prompt("Edit URL:", bookmark.url);
  const newTags = prompt("Edit tags:", bookmark.tags);

  if (newTitle && newUrl) {
    bookmark.title = newTitle;
    bookmark.url = newUrl;
    bookmark.tags = newTags;

    await chrome.storage.local.set({ bookmarks });
    displayBookmarks(bookmarks);
  }
}

async function searchBookmarks() {
  const term = this.value.toLowerCase();
  const { bookmarks } = await chrome.storage.local.get("bookmarks");

  const filtered = (bookmarks || []).filter(
    (b) =>
      b.title.toLowerCase().includes(term) ||
      b.url.toLowerCase().includes(term) ||
      (b.tags && b.tags.toLowerCase().includes(term))
  );

  displayBookmarks(filtered);
}

async function exportBookmarks() {
  const { bookmarks } = await chrome.storage.local.get("bookmarks");
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks));
  const downloadLink = document.createElement("a");
  downloadLink.href = dataStr;
  downloadLink.download = "bookmarks.json";
  downloadLink.click();
}

async function importBookmarks(event) {
  const file = event.target.files[0];
  if (!file) return;

  const text = await file.text();
  const importedBookmarks = JSON.parse(text);

  await chrome.storage.local.set({ bookmarks: importedBookmarks });
  displayBookmarks(importedBookmarks);
}
