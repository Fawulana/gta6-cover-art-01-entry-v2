// Wires the editor: panel selection, drag-to-pan, wheel zoom, sample photos and
// uploads, layout / tone / size choices, and PNG export at the chosen post size.
import { drawPoster, renderPoster, zoneRects, LAYOUT_IDS, LAYOUTS, SIZE_IDS, SIZES } from './poster.js';
import { TONE_IDS, TONES } from './tones.js';

export const SAMPLES = [
  { id: 'boulevard', label: 'Boulevard' },
  { id: 'rooftop', label: 'Rooftop' },
  { id: 'neon', label: 'Neon street' },
  { id: 'pier', label: 'Pier' },
];

/** Loads an image from a URL, resolving once it can be drawn on canvas. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function blankZones(count) {
  return Array.from({ length: count }, () => ({ photo: null, zoom: 1.15, dx: 0, dy: 0 }));
}

/** Builds the default cover state: hero + snapshots, sunset grade, four photos. */
export function defaultState() {
  return {
    layout: 'grid',
    tone: 'sunset',
    title: 'VICE COAST',
    subtitle: 'sunset heist · vice city',
    grain: true,
    size: 'square',
    zones: blankZones(4),
  };
}

/** Counts the panels a layout actually shows (snapshots layout reuses zones 1-2 as prints). */
export function panelCount(state) {
  return state.layout === 'snapshots' ? 3 : state.layout === 'nine' ? 9 : 4;
}

export function createEditor(canvas, els) {
  const state = defaultState();
  let selected = 0;
  let dragging = null;

  function ensureZones() {
    const n = panelCount(state);
    while (state.zones.length < n) state.zones.push({ photo: null, zoom: 1.15, dx: 0, dy: 0 });
    state.zones.length = n;
    if (selected >= n) selected = 0;
  }

  function redraw() {
    ensureZones();
    drawPoster(canvas, state);
    syncPanelSelect();
    updateChoices();
    els.zoom.value = String(state.zones[selected].zoom || 1.15);
  }

  function syncPanelSelect() {
    const n = panelCount(state);
    els.panelSelect.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `Panel ${i + 1}${state.layout === 'snapshots' && i === 0 ? ' (hero)' : ''}${state.layout === 'snapshots' && i > 0 ? ' (snapshot)' : ''}`;
      els.panelSelect.appendChild(opt);
    }
    els.panelSelect.value = String(selected);
  }

  function choiceButtons(container, ids, labels, current, onPick) {
    container.innerHTML = '';
    ids.forEach((id) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = labels(id);
      b.dataset.choice = id;
      b.setAttribute('aria-pressed', String(id === current));
      b.addEventListener('click', () => { onPick(id); redraw(); syncChoices(); });
      container.appendChild(b);
    });
  }

  // Keeps the pressed state of the layout / tone / size buttons honest after a
  // scene or a drag redraws the cover without rebuilding the buttons.
  function updateChoices() {
    const mark = (container, current) => {
      container.querySelectorAll('button').forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.choice === current));
      });
    };
    mark(els.layouts, state.layout);
    mark(els.tones, state.tone);
    mark(els.sizes, state.size);
  }

  function syncChoices() {
    choiceButtons(els.layouts, LAYOUT_IDS, (id) => LAYOUTS[id].label, state.layout, (id) => { state.layout = id; ensureZones(); });
    choiceButtons(els.tones, TONE_IDS, (id) => TONES[id].label, state.tone, (id) => { state.tone = id; });
    choiceButtons(els.sizes, SIZE_IDS, (id) => SIZES[id].label, state.size, (id) => {
      state.size = id;
      canvas.width = SIZES[id].w;
      canvas.height = SIZES[id].h;
    });
  }

  function sampleButtons() {
    els.samples.innerHTML = '';
    SAMPLES.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.title = s.label;
      b.setAttribute('aria-pressed', 'false');
      const img = document.createElement('img');
      img.src = `samples/${s.id}.jpg`;
      img.alt = s.label;
      b.appendChild(img);
      b.addEventListener('click', async () => {
        const photo = await loadImage(`samples/${s.id}.jpg`);
        state.zones[selected].photo = photo;
        state.zones[selected].zoom = 1.15;
        state.zones[selected].dx = 0;
        state.zones[selected].dy = 0;
        els.samples.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        redraw();
      });
      els.samples.appendChild(b);
    });
  }

  function panelAt(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    const fx = (clientX - r.left) / r.width;
    const fy = (clientY - r.top) / r.height;
    const rects = zoneRects(state.layout, canvas.width, canvas.height);
    for (let i = 0; i < rects.length; i++) {
      const z = rects[i];
      if (fx >= z.x && fx <= z.x + z.w && fy >= z.y && fy <= z.y + z.h) return i;
    }
    return 0;
  }

  canvas.addEventListener('pointerdown', (e) => {
    selected = panelAt(e.clientX, e.clientY);
    dragging = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    const zone = state.zones[selected];
    const rects = zoneRects(state.layout, canvas.width, canvas.height);
    const rect = rects[selected];
    zone.dx += ((e.clientX - dragging.x) / r.width) / rect.w;
    zone.dy += ((e.clientY - dragging.y) / r.height) / rect.h;
    zone.dx = Math.max(-0.6, Math.min(0.6, zone.dx));
    zone.dy = Math.max(-0.6, Math.min(0.6, zone.dy));
    dragging = { x: e.clientX, y: e.clientY };
    redraw();
  });
  canvas.addEventListener('pointerup', () => { dragging = null; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zone = state.zones[selected];
    zone.zoom = Math.max(1, Math.min(3, (zone.zoom || 1.15) * (e.deltaY < 0 ? 1.08 : 0.93)));
    redraw();
  }, { passive: false });

  els.panelSelect.addEventListener('change', () => { selected = Number(els.panelSelect.value); redraw(); });
  els.zoom.addEventListener('input', () => { state.zones[selected].zoom = Number(els.zoom.value); redraw(); });
  els.title.addEventListener('input', () => { state.title = els.title.value; redraw(); });
  els.subtitle.addEventListener('input', () => { state.subtitle = els.subtitle.value; redraw(); });
  els.grain.addEventListener('change', () => { state.grain = els.grain.checked; redraw(); });
  els.fillAll.addEventListener('click', () => {
    const photo = state.zones[selected].photo;
    if (!photo) { els.status.textContent = 'Give the selected panel a photo first.'; return; }
    state.zones.forEach((z) => { z.photo = photo; });
    els.status.textContent = 'Every panel now uses that photo.';
    redraw();
  });
  els.upload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const photo = await loadImage(URL.createObjectURL(file));
    state.zones[selected].photo = photo;
    state.zones[selected].zoom = 1.15;
    state.zones[selected].dx = 0;
    state.zones[selected].dy = 0;
    els.status.textContent = `Loaded ${file.name} into panel ${selected + 1}.`;
    redraw();
  });
  els.export.addEventListener('click', () => {
    const size = SIZES[state.size];
    const out = renderPoster(state, state.size);
    out.toBlob((blob) => {
      if (!blob) { els.status.textContent = 'Export failed — try again.'; return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-coast-${size.w}x${size.h}.png`;
      a.click();
      els.status.textContent = `Saved vice-coast-${size.w}x${size.h}.png`;
    }, 'image/png');
  });

  sampleButtons();
  syncChoices();
  return { state, redraw, loadSample: (id) => loadImage(`samples/${id}.jpg`) };
}
