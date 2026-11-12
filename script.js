/* ---------- Image data ----------
   Ghana tourist-site photos are stored locally in /images.
   See README.md for source and licence credits.
*/
const IMAGES = [
  { title: "Cape Coast Castle", category: "Heritage", src: "images/cape-coast-castle.jpg", thumb: "images/cape-coast-castle.jpg" },
  { title: "Kakum Canopy Walk", category: "Nature", src: "images/kakum-canopy-walk.jpg", thumb: "images/kakum-canopy-walk.jpg" },
  { title: "Wli Waterfalls", category: "Nature", src: "images/wli-waterfalls.jpg", thumb: "images/wli-waterfalls.jpg" },
  { title: "Nzulezu Stilt Village", category: "Heritage", src: "images/nzulezu.jpg", thumb: "images/nzulezu.jpg" },
  { title: "Independence Arch", category: "Landmarks", src: "images/independence-arch.jpg", thumb: "images/independence-arch.jpg" },
  { title: "Mole National Park", category: "Nature", src: "images/mole-national-park.jpg", thumb: "images/mole-national-park.jpg" },
  { title: "Larabanga Mosque", category: "Heritage", src: "images/larabanga-mosque.jpg", thumb: "images/larabanga-mosque.jpg" },
  { title: "Boti Falls", category: "Nature", src: "images/boti-falls.jpg", thumb: "images/boti-falls.jpg" },
];

/* ---------- Elements ---------- */

const galleryEl = document.getElementById("gallery");
const filtersEl = document.getElementById("filters");
const searchEl = document.getElementById("search");
const countEl = document.getElementById("count");
const emptyEl = document.getElementById("empty");

const lightbox = document.getElementById("lightbox");
const lbStage = document.getElementById("lbStage");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
const lbCounter = document.getElementById("lbCounter");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");

/* ---------- State ---------- */

let activeCategory = "All";
let searchTerm = "";
let visible = [];       // images currently shown (after filter + search)
let currentIndex = 0;   // index inside `visible` for the lightbox
let lastFocused = null; // element to return focus to when lightbox closes
let loadToken = 0;      // guards against out-of-order image loads

/* ---------- Filters ---------- */

function buildFilters() {
  const categories = ["All", ...new Set(IMAGES.map((img) => img.category))];

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-btn";
    button.textContent = category;
    button.dataset.category = category;
    button.setAttribute("aria-pressed", category === "All");
    if (category === "All") button.classList.add("active");
    filtersEl.appendChild(button);
  });
}

filtersEl.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) return;

  activeCategory = button.dataset.category;
  filtersEl.querySelectorAll(".filter-btn").forEach((btn) => {
    const isActive = btn === button;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive);
  });
  render();
});

searchEl.addEventListener("input", () => {
  searchTerm = searchEl.value.trim().toLowerCase();
  render();
});

/* ---------- Rendering ---------- */

function matches(img) {
  const inCategory = activeCategory === "All" || img.category === activeCategory;
  const inSearch =
    !searchTerm ||
    img.title.toLowerCase().includes(searchTerm) ||
    img.category.toLowerCase().includes(searchTerm);
  return inCategory && inSearch;
}

function render() {
  visible = IMAGES.filter(matches);
  galleryEl.innerHTML = "";
  const fragment = document.createDocumentFragment();

  visible.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.animationDelay = `${Math.min(index * 40, 400)}ms`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "card";
    button.setAttribute("aria-label", `Open ${item.title}`);

    const img = document.createElement("img");
    img.alt = item.title;
    img.loading = "lazy";
    img.addEventListener("load", () => img.classList.add("loaded"));
    img.addEventListener("error", () => button.classList.add("broken"));
    img.src = item.thumb;

    const caption = document.createElement("div");
    caption.className = "card-caption";
    caption.innerHTML = "<strong></strong><span></span>";
    caption.querySelector("strong").textContent = item.title;
    caption.querySelector("span").textContent = item.category;

    button.append(img, caption);
    button.addEventListener("click", () => openLightbox(index));

    li.appendChild(button);
    fragment.appendChild(li);
  });

  galleryEl.appendChild(fragment);

  emptyEl.hidden = visible.length > 0;
  countEl.textContent = `Showing ${visible.length} of ${IMAGES.length} images`;
}

/* ---------- Lightbox ---------- */

function showImage() {
  const item = visible[currentIndex];
  if (!item) return;

  const hasMultipleImages = visible.length > 1;
  lbPrev.disabled = !hasMultipleImages;
  lbNext.disabled = !hasMultipleImages;

  const token = ++loadToken;
  lbImg.classList.add("fading");

  const loader = new Image();
  loader.onload = () => {
    if (token !== loadToken) return; // a newer image was requested
    lbImg.src = loader.src;
    lbImg.alt = item.title;
    lbImg.classList.remove("fading");
  };
  loader.onerror = () => {
    if (token !== loadToken) return;
    lbImg.removeAttribute("src");
    lbImg.alt = `${item.title} (failed to load)`;
    lbImg.classList.remove("fading");
  };
  loader.src = item.src;

  lbCaption.textContent = `${item.title} · ${item.category}`;
  lbCounter.textContent = `${currentIndex + 1} / ${visible.length}`;

  // Preload neighbours so next/prev feel instant
  [1, -1].forEach((step) => {
    const neighbour = visible[(currentIndex + step + visible.length) % visible.length];
    if (neighbour) new Image().src = neighbour.src;
  });
}

function openLightbox(index) {
  currentIndex = index;
  lastFocused = document.activeElement;
  lbImg.removeAttribute("src");

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  showImage();
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  loadToken++; // cancel any pending load
  if (lastFocused) lastFocused.focus();
}

function step(direction) {
  if (visible.length < 2) return;
  currentIndex = (currentIndex + direction + visible.length) % visible.length;
  showImage();
}

lbClose.addEventListener("click", closeLightbox);
lbPrev.addEventListener("click", () => step(-1));
lbNext.addEventListener("click", () => step(1));

// Click outside the image closes the viewer
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target === lbStage) closeLightbox();
});

// Keyboard: arrows, Esc, and a simple focus trap
document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    step(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    step(-1);
  } else if (event.key === "Tab") {
    const focusable = [lbClose, lbPrev, lbNext].filter((button) => !button.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

// Touch swipe support
let touchStartX = 0;
lightbox.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener("touchend", (event) => {
  const deltaX = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(deltaX) > 50) step(deltaX < 0 ? 1 : -1);
}, { passive: true });

/* ---------- Init ---------- */

buildFilters();
render();
