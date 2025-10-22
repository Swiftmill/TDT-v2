const POSTER_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%' stop-color='%23000000'/%3E%3Cstop offset='50%' stop-color='%23091019'/%3E%3Cstop offset='100%' stop-color='%23000000'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='1200' height='675'/%3E%3Ccircle cx='600' cy='338' r='220' fill='none' stroke='%235cc9ff' stroke-opacity='0.15' stroke-width='2'/%3E%3C/svg%3E";

const VIDEO_PATH_FILES = [
  "assets/video/video1.txt",
  "assets/video/video2.txt",
  "assets/video/video3.txt",
];

const logoElements = Array.from(document.querySelectorAll('[data-logo]'));
const videoPrimary = document.getElementById("video-primary");
const videoSecondary = document.getElementById("video-secondary");
const videoTriggers = [
  document.getElementById("logoTrigger"),
  document.getElementById("titleTrigger"),
];
const glyphContainer = document.getElementById("glyphContainer");

let videoSources = [];
let activeVideo = videoPrimary;
let bufferVideo = videoSecondary;
let currentVideoIndex = 0;
let glyphButtons = [];
let glyphIntervalId = null;

function applyPoster(videoEl) {
  videoEl.setAttribute("poster", POSTER_FALLBACK);
}

function setVideoSource(videoEl, source) {
  if (!source) {
    videoEl.removeAttribute("src");
    return;
  }

  if (videoEl.getAttribute("src") === source) {
    return;
  }

  videoEl.setAttribute("src", source);
  videoEl.load();
}

async function readTextFile(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Failed to fetch " + path);
    const text = await response.text();
    return text.trim();
  } catch (error) {
    console.warn(error.message);
    return "";
  }
}

async function loadLogo() {
  const logoPath = await readTextFile("assets/img/logo.txt");
  if (!logoPath) return;

  logoElements.forEach((el) => {
    el.dataset.loaded = "true";
    el.style.backgroundImage = `url('${logoPath}')`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
  });
}

async function loadVideoSources() {
  const paths = await Promise.all(VIDEO_PATH_FILES.map(readTextFile));
  videoSources = paths.filter(Boolean);

  if (videoSources.length === 0) {
    console.warn("No video sources defined. Background will remain static.");
    return;
  }

  applyPoster(activeVideo);
  applyPoster(bufferVideo);
  setVideoSource(activeVideo, videoSources[currentVideoIndex]);

  activeVideo.addEventListener("loadeddata", () => {
    activeVideo.play().catch(() => {});
  });
}

function swapVideos(nextIndex) {
  if (videoSources.length === 0) return;

  const incoming = bufferVideo;
  const outgoing = activeVideo;
  const nextSource = videoSources[nextIndex];

  applyPoster(incoming);
  setVideoSource(incoming, nextSource);

  const handleCanPlay = () => {
    incoming.removeEventListener("loadeddata", handleCanPlay);
    const playPromise = incoming.play();
    if (playPromise) {
      playPromise.catch(() => {});
    }

    requestAnimationFrame(() => {
      incoming.classList.add("active");
      incoming.classList.remove("inactive");
      outgoing.classList.remove("active");
      outgoing.classList.add("inactive");

      setTimeout(() => {
        outgoing.pause();
        outgoing.removeAttribute("src");
        outgoing.load();
      }, 1000);

      activeVideo = incoming;
      bufferVideo = outgoing;
      currentVideoIndex = nextIndex;
    });
  };

  incoming.addEventListener("loadeddata", handleCanPlay);
}

function cycleVideo() {
  if (videoSources.length === 0) return;
  const nextIndex = (currentVideoIndex + 1) % videoSources.length;
  swapVideos(nextIndex);
}

function bindVideoTriggers() {
  videoTriggers.forEach((trigger) => {
    if (!trigger) return;
    trigger.addEventListener("click", cycleVideo);
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        cycleVideo();
      }
    });
  });
}

function buildGlyphButton({ label, symbols }) {
  const button = document.createElement("button");
  button.className = "glyph-button";
  button.type = "button";
  button.setAttribute("aria-label", label);

  const symbolSpan = document.createElement("span");
  symbolSpan.className = "glyph-symbol";
  symbolSpan.textContent = label.slice(0, 3);

  const labelSpan = document.createElement("span");
  labelSpan.className = "glyph-label";
  labelSpan.textContent = label;

  button.append(symbolSpan, labelSpan);
  glyphContainer.appendChild(button);

  glyphButtons.push({ element: button, symbolSpan, label, symbols });
}

function updateGlyphDisplays(randomPool) {
  glyphButtons.forEach(({ symbolSpan, symbols }) => {
    const pool = symbols && symbols.length ? symbols : randomPool;
    if (!pool || pool.length === 0) return;
    const glyph = pool[Math.floor(Math.random() * pool.length)];
    const repeat = Math.floor(Math.random() * 2) + 2; // 2 or 3 characters
    symbolSpan.textContent = glyph.repeat(repeat);
  });
}

async function loadGlyphs() {
  try {
    const response = await fetch("assets/glyphs.json");
    if (!response.ok) throw new Error("Failed to load glyph configuration");
    const data = await response.json();

    const glyphData = data.glyphButtons || [];
    const randomPool = data.randomSymbols || [];

    if (glyphData.length === 0) {
      throw new Error("No glyph button data defined");
    }

    glyphData.forEach(buildGlyphButton);
    updateGlyphDisplays(randomPool);

    glyphIntervalId = setInterval(() => updateGlyphDisplays(randomPool), 1000);
  } catch (error) {
    console.error(error.message);
    glyphContainer.innerHTML = `<p class="glyphs-fallback">Unable to load glyphs.</p>`;
  }
}

function init() {
  applyPoster(videoPrimary);
  applyPoster(videoSecondary);
  bindVideoTriggers();
  loadLogo();
  loadVideoSources();
  loadGlyphs();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
