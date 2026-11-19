// Entry point: builds the editor on #cover and, when a ?shot= query is present,
// stages a fixed screenshot scene instead of the empty editor.
import { createEditor } from './editor.js';
import { runShot } from './scenes.js';

const canvas = document.getElementById('cover');
const editor = createEditor(canvas, {
  samples: document.getElementById('samples'),
  panelSelect: document.getElementById('panelSelect'),
  zoom: document.getElementById('zoom'),
  title: document.getElementById('title'),
  subtitle: document.getElementById('subtitle'),
  grain: document.getElementById('grain'),
  layouts: document.getElementById('layouts'),
  tones: document.getElementById('tones'),
  sizes: document.getElementById('sizes'),
  fillAll: document.getElementById('fillAll'),
  upload: document.getElementById('upload'),
  export: document.getElementById('export'),
  status: document.getElementById('status'),
});

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, editor).catch((err) => {
    document.getElementById('status').textContent = `Scene failed: ${err.message}`;
    window.__shotReady = true;
  });
} else {
  // First run: preload the boulevard sample into the hero so the page never
  // opens on an empty cover.
  editor.loadSample('boulevard').then((photo) => {
    editor.state.zones[0].photo = photo;
    editor.redraw();
  }).catch(() => editor.redraw());
  editor.redraw();
}
