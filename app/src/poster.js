// The cover renderer: draws a multi-panel GTA-style poster onto any canvas.
// A cover state is { layout, tone, title, subtitle, grain, zones }, where each zone
// is { photo, zoom, dx, dy } — photo is an HTMLImageElement (or null), zoom >= 1,
// dx/dy pan the photo inside its panel as fractions of the panel size.
// Layouts: 'grid' (hero + three panels), 'snapshots' (full-bleed hero + two tilted
// snapshot prints), 'nine' (3 x 3 panel grid). All lettering is canvas text in the
// system sans-serif stack at weight 900 — no font files are used anywhere.
import { TONES } from './tones.js';

export const LAYOUTS = {
  grid: { label: 'Poster Grid' },
  snapshots: { label: 'Hero + Snapshots' },
  nine: { label: 'Nine Panel' },
};
export const LAYOUT_IDS = Object.keys(LAYOUTS);

export const SIZES = {
  square: { label: '1080 × 1080', w: 1080, h: 1080 },
  portrait: { label: '1080 × 1350', w: 1080, h: 1350 },
  wide: { label: '1920 × 1080', w: 1920, h: 1080 },
};
export const SIZE_IDS = Object.keys(SIZES);

/** Panel rectangles for a layout, as fractions of the cover (x, y, w, h). */
export function zoneRects(layout, w, h) {
  const g = 0.008; // white gutter between panels, as a fraction of width
  if (layout === 'snapshots') {
    return [{ x: 0, y: 0, w: 1, h: 1 }];
  }
  if (layout === 'nine') {
    // rows split the height evenly, columns the width, with a gutter between
    const rects = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        rects.push({ x: (c / 3) + (c ? g / 2 : 0), y: r / 3, w: 1 / 3 - g, h: 1 / 3 - g });
      }
    }
    return rects;
  }
  // grid: hero across the top, three panels along the bottom
  const heroH = 0.62;
  const pw = 1 / 3 - g;
  return [
    { x: 0, y: 0, w: 1, h: heroH },
    { x: 0, y: heroH + g, w: pw, h: 1 - heroH - g },
    { x: 1 / 3 + g / 2, y: heroH + g, w: pw, h: 1 - heroH - g },
    { x: 2 / 3 + g, y: heroH + g, w: pw, h: 1 - heroH - g },
  ];
}

/** Cover-fits a photo into a panel rect, applying zoom and pan, then clips to it. */
export function drawZonePhoto(ctx, photo, rect, zone, w, h) {
  const px = rect.x * w, py = rect.y * h, pw = rect.w * w, ph = rect.h * h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  if (!photo) {
    const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
    grad.addColorStop(0, '#3d2457');
    grad.addColorStop(1, '#170a24');
    ctx.fillStyle = grad;
    ctx.fillRect(px, py, pw, ph);
  } else {
    const zoom = Math.max(1, zone.zoom || 1);
    const scale = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight) * zoom;
    const dw = photo.naturalWidth * scale;
    const dh = photo.naturalHeight * scale;
    const dx = px + (pw - dw) / 2 + (zone.dx || 0) * pw;
    const dy = py + (ph - dh) / 2 + (zone.dy || 0) * ph;
    ctx.drawImage(photo, dx, dy, dw, dh);
  }
  ctx.restore();
}

/** A retro striped sun: a circle with the lower stripes cut out of it. */
export function drawStripedSun(ctx, cx, cy, r, colors) {
  ctx.save();
  const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.55, colors[1]);
  grad.addColorStop(1, colors[2]);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // cut horizontal stripes out of the lower half
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + r * 0.05;
  let thick = r * 0.045;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, thick);
    y += thick * 2.6;
    thick *= 1.35;
  }
  ctx.restore();
}

/** The slanted title band across the cover, with sun and lettering. bandTop is the
 *  band's top edge as a fraction of the cover height. */
export function drawTitleBand(ctx, state, w, h, tone, bandTop) {
  const bandY = h * bandTop;
  const bandH = h * 0.20;
  const slant = w * 0.03;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, bandY + slant);
  ctx.lineTo(w, bandY - slant);
  ctx.lineTo(w, bandY + bandH - slant);
  ctx.lineTo(0, bandY + bandH + slant);
  ctx.closePath();
  ctx.fillStyle = tone.band;
  ctx.fill();
  ctx.lineWidth = Math.max(3, h * 0.004);
  ctx.strokeStyle = tone.bandEdge;
  ctx.stroke();
  ctx.clip();
  drawStripedSun(ctx, w * 0.87, bandY + bandH * 0.42, Math.min(bandH * 0.62, w * 0.10), tone.sun);
  const title = (state.title || '').trim().toUpperCase() || 'VICE COAST';
  let size = bandH * 0.52;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const fontFor = (s) => `900 ${s}px system-ui, "Segoe UI", Arial, sans-serif`;
  ctx.font = fontFor(size);
  while (ctx.measureText(title).width > w * 0.62 && size > 16) {
    size -= 2;
    ctx.font = fontFor(size);
  }
  const ty = bandY + bandH * 0.44;
  const tx = w * 0.045;
  const grad = ctx.createLinearGradient(0, ty - size / 2, 0, ty + size / 2);
  grad.addColorStop(0, tone.titleTop);
  grad.addColorStop(1, tone.titleBottom);
  ctx.lineWidth = Math.max(3, size * 0.09);
  ctx.strokeStyle = 'rgba(10, 4, 20, 0.9)';
  ctx.strokeText(title, tx, ty);
  ctx.fillStyle = grad;
  ctx.fillText(title, tx, ty);
  const sub = (state.subtitle || '').trim();
  if (sub) {
    let subSize = bandH * 0.17;
    ctx.font = `italic 700 ${subSize}px system-ui, "Segoe UI", Arial, sans-serif`;
    while (ctx.measureText(sub).width > w * 0.6 && subSize > 10) {
      subSize -= 1;
      ctx.font = `italic 700 ${subSize}px system-ui, "Segoe UI", Arial, sans-serif`;
    }
    ctx.fillStyle = tone.sub;
    ctx.fillText(sub, tx, bandY + bandH * 0.82);
  }
  ctx.restore();
}

/** A tilted white-bordered snapshot print with a handwritten-style caption. */
export function drawPrint(ctx, photo, zone, cx, cy, pw, ph, angle, caption, tone) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = '#fdf8ef';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = ph * 0.06;
  ctx.shadowOffsetY = ph * 0.02;
  ctx.fillRect(-pw / 2, -ph / 2, pw, ph * 1.16);
  ctx.shadowColor = 'transparent';
  ctx.save();
  ctx.beginPath();
  ctx.rect(-pw / 2 + pw * 0.04, -ph / 2 + ph * 0.04, pw * 0.92, ph * 0.92);
  ctx.clip();
  if (photo) {
    const zoom = Math.max(1, zone.zoom || 1);
    const scale = Math.max((pw * 0.92) / photo.naturalWidth, (ph * 0.92) / photo.naturalHeight) * zoom;
    const dw = photo.naturalWidth * scale;
    const dh = photo.naturalHeight * scale;
    ctx.drawImage(photo, -dw / 2 + (zone.dx || 0) * pw, -dh / 2 + (zone.dy || 0) * ph, dw, dh);
  } else {
    ctx.fillStyle = '#3d2457';
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
  }
  ctx.restore();
  ctx.fillStyle = '#22202a';
  ctx.font = `italic 700 ${Math.max(12, ph * 0.055)}px system-ui, "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(caption, 0, ph * 0.58);
  ctx.restore();
}

/** Deterministic film grain: same seed gives the same specks every render. */
export function drawGrain(ctx, w, h) {
  let seed = 20261119;
  const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  ctx.save();
  ctx.globalAlpha = 0.07;
  const n = Math.floor((w * h) / 9000);
  for (let i = 0; i < n; i++) {
    const v = rand() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(rand() * w, rand() * h, 2, 2);
  }
  ctx.restore();
}

/** Vignette: darkened corners so the poster reads as one printed image. */
export function drawVignette(ctx, w, h) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.72);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(10, 2, 20, 0.42)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/** Renders the whole cover onto `canvas` at its own pixel size. */
export function drawPoster(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const tone = TONES[state.tone] || TONES.sunset;
  const layout = state.layout || 'grid';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  const rects = zoneRects(layout, w, h);
  rects.forEach((rect, i) => {
    drawZonePhoto(ctx, state.zones[i] ? state.zones[i].photo : null, rect, state.zones[i] || {}, w, h);
  });
  // the sunset/neon wash over every photo, unifying the grade
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, tone.washTop);
  wash.addColorStop(1, tone.washBottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  if (layout === 'snapshots') {
    const z1 = state.zones[1] || {}, z2 = state.zones[2] || {};
    drawPrint(ctx, z1.photo, z1, w * 0.78, h * 0.24, w * 0.26, h * 0.26, 0.07, 'night drive', tone);
    drawPrint(ctx, z2.photo, z2, w * 0.20, h * 0.30, w * 0.22, h * 0.22, -0.09, 'the pier', tone);
  }
  if (layout === 'nine') {
    // title block across the middle row, over the centre panel
    ctx.save();
    ctx.fillStyle = tone.band;
    ctx.fillRect(0, h * 0.44, w, h * 0.12);
    ctx.fillStyle = tone.bandEdge;
    ctx.fillRect(0, h * 0.44, w, Math.max(3, h * 0.004));
    ctx.fillRect(0, h * 0.56 - Math.max(3, h * 0.004), w, Math.max(3, h * 0.004));
    const title = (state.title || '').trim().toUpperCase() || 'VICE COAST';
    let size = h * 0.07;
    ctx.font = `900 ${size}px system-ui, "Segoe UI", Arial, sans-serif`;
    while (ctx.measureText(title).width > w * 0.9 && size > 16) {
      size -= 2;
      ctx.font = `900 ${size}px system-ui, "Segoe UI", Arial, sans-serif`;
    }
    const grad = ctx.createLinearGradient(0, h * 0.45, 0, h * 0.55);
    grad.addColorStop(0, tone.titleTop);
    grad.addColorStop(1, tone.titleBottom);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeStyle = 'rgba(10, 4, 20, 0.9)';
    ctx.strokeText(title, w / 2, h * 0.50);
    ctx.fillStyle = grad;
    ctx.fillText(title, w / 2, h * 0.50);
    ctx.restore();
  } else {
    // grid: the band rides the hero's foot so the three bottom panels stay visible;
    // snapshots: it sits lower, under the full-bleed hero and its prints.
    drawTitleBand(ctx, state, w, h, tone, layout === 'grid' ? 0.50 : 0.66);
  }
  if (state.grain !== false) {
    drawGrain(ctx, w, h);
    drawVignette(ctx, w, h);
  }
}

/** Renders a cover at export size on a fresh canvas and returns it. */
export function renderPoster(state, sizeId) {
  const size = SIZES[sizeId] || SIZES.square;
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawPoster(canvas, state);
  return canvas;
}
