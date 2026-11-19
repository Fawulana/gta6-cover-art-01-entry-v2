// Colour grades for the cover: each tone is a sunset/neon wash drawn over the photos
// plus the palette of the title band and its striped sun. Canvas gradients only.
export const TONES = {
  sunset: {
    label: 'Sunset',
    washTop: 'rgba(255, 122, 26, 0.10)',
    washBottom: 'rgba(214, 24, 120, 0.38)',
    band: '#170a24',
    bandEdge: '#ff5e62',
    titleTop: '#fff3c4',
    titleBottom: '#ff7a1a',
    sub: '#ffd166',
    sun: ['#ffd166', '#ff5e62', '#d61a78'],
  },
  neon: {
    label: 'Neon Night',
    washTop: 'rgba(0, 229, 255, 0.12)',
    washBottom: 'rgba(255, 46, 136, 0.42)',
    band: '#0a0618',
    bandEdge: '#00e5ff',
    titleTop: '#e8fbff',
    titleBottom: '#00e5ff',
    sub: '#ff5ec4',
    sun: ['#7df9ff', '#ff5ec4', '#7b2fff'],
  },
  teal: {
    label: 'Teal Heat',
    washTop: 'rgba(0, 200, 170, 0.12)',
    washBottom: 'rgba(255, 90, 0, 0.34)',
    band: '#06231f',
    bandEdge: '#2ee6a8',
    titleTop: '#eafff5',
    titleBottom: '#2ee6a8',
    sub: '#ffb347',
    sun: ['#a8ffce', '#2ee6a8', '#ff7a1a'],
  },
  gold: {
    label: 'Palm Gold',
    washTop: 'rgba(255, 200, 60, 0.14)',
    washBottom: 'rgba(120, 30, 160, 0.36)',
    band: '#1c0a2e',
    bandEdge: '#ffc23c',
    titleTop: '#fffbe6',
    titleBottom: '#ffc23c',
    sub: '#ff8fb1',
    sun: ['#fff3a0', '#ffb347', '#b537f2'],
  },
};

export const TONE_IDS = Object.keys(TONES);
