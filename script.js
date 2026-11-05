/* ---------- Image data ----------
   Placeholder photos from picsum.photos so the project works out of the box.
   To use your own images, put them in an "images" folder and replace the
   entries below, e.g.:
   { title: "Labadi Beach", category: "Beach", src: "images/labadi.jpg", thumb: "images/labadi.jpg" }
*/
function photo(id, title, category) {
  return {
    title,
    category,
    src: `https://picsum.photos/id/${id}/1600/1000`,
    thumb: `https://picsum.photos/id/${id}/600/450`,
  };
}

const IMAGES = [
  photo(10, "Quiet Forest", "Nature"),
  photo(11, "Open Landscape", "Nature"),
  photo(15, "Cascade", "Nature"),
  photo(17, "Forest Road", "Nature"),
  photo(18, "Green Fields", "Nature"),
  photo(19, "Golden Meadow", "Nature"),
  photo(28, "Deep Woods", "Nature"),
  photo(12, "Shoreline", "Water"),
  photo(13, "Rocky Coast", "Water"),
  photo(14, "Calm Sea", "Water"),
  photo(16, "Ocean View", "Water"),
  photo(25, "Mountain Pass", "Mountains"),
  photo(27, "High Peaks", "Mountains"),
  photo(29, "Snowy Ridge", "Mountains"),
  photo(20, "Work Desk", "Objects"),
  photo(24, "Open Book", "Objects"),
  photo(26, "Everyday Carry", "Objects"),
  photo(23, "Table Setting", "Objects"),
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
    galleryEl.appendChild(li);
  });

  emptyEl.hidden = visible.length > 0;
  countEl.textContent = `Showing ${visible.length} of ${IMAGES.length} images`;
}

/* ---------- Lightbox ---------- */

function showImage() {
  const item = visible[currentIndex];
  if (!item) return;

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
  if (!visible.length) return;
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
    closeLightbox();
  } else if (event.key === "ArrowRight") {
    step(1);
  } else if (event.key === "ArrowLeft") {
    step(-1);
  } else if (event.key === "Tab") {
    const focusable = [lbClose, lbPrev, lbNext];
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
