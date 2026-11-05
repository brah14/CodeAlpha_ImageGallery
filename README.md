# CodeAlpha_ImageGallery

A responsive image gallery built with plain HTML, CSS and JavaScript as part of the CodeAlpha Frontend Development internship (Task 1).

## Features

- Responsive CSS Grid layout (`auto-fill` + `minmax`) that adapts from phones to desktops
- Lightbox viewer with next/previous buttons, image counter and captions
- Keyboard navigation: `←` `→` to browse, `Esc` to close
- Click outside the image to close, swipe left/right on touch devices
- Hover zoom, caption slide-up and fade-in transitions
- **Bonus:** category filters and live search
- Lazy loading, preloading of neighbouring images, and graceful handling of broken images
- Accessibility: alt text, ARIA labels, focus states, focus trap inside the lightbox
- Respects `prefers-reduced-motion`

## Tech Stack

HTML5, CSS3 (Grid, custom properties, transitions), vanilla JavaScript. No frameworks or libraries.

## Run Locally

Open `index.html` in your browser. No build step needed.

## Using Your Own Images

Put your photos in an `images/` folder and edit the `IMAGES` array at the top of `script.js`:

```js
{ title: "Labadi Beach", category: "Beach", src: "images/labadi.jpg", thumb: "images/labadi.jpg" }
```

Categories and filter buttons are generated automatically from the data.

## Live Demo

Add your GitHub Pages or Netlify link here.

## Screenshots

Add screenshots here.

## Author

Wisdom Huno Tetteh — [GitHub](https://github.com/brah14)
