// Fixed scenes for screenshots: ?shot=editor shows the page with sample photos
// loaded; ?shot=cover shows the cover alone at the requested post size.
// window.__shotReady is set once the scene has painted twice.
import { SIZES } from './poster.js';

const SCENE_PHOTOS = {
  grid: ['boulevard', 'rooftop', 'neon', 'pier'],
  snapshots: ['boulevard', 'neon', 'pier'],
  nine: ['boulevard', 'rooftop', 'neon', 'pier', 'boulevard', 'rooftop', 'neon', 'pier', 'rooftop'],
};

export async function runShot(shot, query, editor) {
  const layout = query.get('layout') || 'grid';
  const tone = query.get('tone') || 'sunset';
  const sizeId = query.get('size') || 'wide';
  const title = query.get('caption') || 'VICE COAST';
  const state = editor.state;
  state.layout = layout;
  state.tone = tone;
  state.title = title;
  state.subtitle = query.get('subtitle') || 'sunset heist · vice city';
  state.grain = true;
  const photos = SCENE_PHOTOS[layout] || SCENE_PHOTOS.grid;
  for (let i = 0; i < photos.length; i++) {
    state.zones[i] = state.zones[i] || { photo: null, zoom: 1.15, dx: 0, dy: 0 };
    state.zones[i].photo = await editor.loadSample(photos[i]);
    state.zones[i].zoom = 1.15;
    state.zones[i].dx = 0;
    state.zones[i].dy = 0;
  }
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const size = SIZES[sizeId] || SIZES.wide;
    const canvas = document.getElementById('cover');
    canvas.width = size.w;
    canvas.height = size.h;
    state.size = sizeId;
  }
  const titleInput = document.getElementById('title');
  if (titleInput) titleInput.value = title;
  editor.redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
