const el = (id) => document.getElementById(id);

const state = {
  isUploading: false,
  results: null,
  videoUrl: "",
};

function setProgress(pct) {
  el("progressBar").style.width = `${pct}%`;
}

function setStatus(text) {
  el("statusMessage").textContent = text || "";
}

function renderResults(results) {
  const container = el("detectionResults");
  const json = el("resultsContent");
  if (!results) {
    container.style.display = "none";
    json.textContent = "";
    return;
  }
  container.style.display = "block";
  json.textContent = JSON.stringify(results, null, 2);

  // Summary chips
  const counts = Object.values(results).reduce((acc, k) => {
    acc[k] = (acc[k] || 0) + 1; return acc;
  }, {});
  const summary = el("summaryChips");
  summary.innerHTML = Object.entries(counts)
    .map(([k, v]) => `<span class="badge">${k}: ${v}</span>`)
    .join(" ");

  // Mini frame cards
  const grid = el("framesGrid");
  grid.innerHTML = Object.entries(results).slice(0, 6).map(([frame, label]) => `
    <div class="frame">
      <div class="thumb"><span class="badge">${frame}</span></div>
      <div class="meta">
        <span>${label}</span>
        <span class="dot" style="background:${label.toLowerCase().includes('deepfake') ? '#fb7185' : '#34d399'}"></span>
      </div>
    </div>
  `).join("");
}

async function handleUpload(evt) {
  evt.preventDefault();
  if (state.isUploading) return;

  const fileInput = el("fileInput");
  const file = fileInput.files[0];
  if (!file) { alert("Please select a video file!"); return; }

  state.isUploading = true;
  setProgress(0);
  setStatus("");
  renderResults(null);

  // Preview immediately
  const url = URL.createObjectURL(file);
  state.videoUrl = url;
  const video = el("videoPreview");
  video.src = url;
  video.style.display = "block";

  const formData = new FormData();
  formData.append("video", file);

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      try {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setStatus(response.message || "Upload complete");
          renderResults(response.detection_results || null);
          resolve();
        } else {
          setStatus("Upload failed!");
          reject(new Error("Upload failed"));
        }
      } catch (err) {
        setStatus("Invalid server response");
        reject(err);
      } finally {
        setProgress(0);
        state.isUploading = false;
      }
    };

    xhr.onerror = () => {
      setStatus("Network error");
      state.isUploading = false;
      reject(new Error("Network error"));
    };

    xhr.send(formData);
  });
}

function init() {
  document.getElementById("uploadForm").addEventListener("submit", handleUpload);
}

document.addEventListener("DOMContentLoaded", init);