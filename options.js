const exportBtn = document.getElementById('export-json');
const importInput = document.getElementById('import-json');

exportBtn.addEventListener('click', () => {
  chrome.storage.local.get(['bmData'], (res) => {
    const data = res.bmData || { folders: [] };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.json';
    a.click();

    URL.revokeObjectURL(url);
  });
});

importInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      if (obj && obj.folders) {
        chrome.storage.local.set({ bmData: obj }, () => {
          alert('Imported JSON data successfully.');
        });
      } else {
        alert('JSON does not contain the expected format.');
      }
    } catch (err) {
      alert('Invalid JSON file.');
    }
  };

  reader.readAsText(file);
});
