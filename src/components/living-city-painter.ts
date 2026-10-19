import type { City } from '../domain/city';
import {
  places,
  ROAD,
  WALKS,
  routeLength,
  routePoint,
  worldPoint,
  type Point,
  type Camera,
  type Place,
} from '../domain/living-city';
import cast from '../data/actor-cast.json';
import { CITY_EVENT_BY_ID } from '../data/city-events';
import boundsData from '../data/city-sprites.json';
import walkCycle from '../data/city-walk-cycle.json';

type Bounds = { x: number; y: number; width: number; height: number };
type Actor = {
  baseHeight: number;
  poses: { src: string; width: number; height: number; anchor: Point }[];
};
const CAST = cast as Record<string, Actor>;
const BOUNDS = boundsData as Record<string, Bounds>;

export type Images = Record<string, CanvasImageSource>;
export type WorldState = {
  caseSign?: string;
  city: City | null;
  selected: string | null;
  hover: string | null;
  time: number;
  now?: number;
  reduced: boolean;
  prop?: string;
  construction?: { plot: number; at: number };
};
export type Hit = Bounds & { id: string; depth: number; src?: string };

const INK = '#111015';
const PAPER = '#f0e4c3';
const PINK = '#ff168e';
const YELLOW = '#deff00';

// Landmark buildings matching the top-left mockup quadrant when plots are not custom-built
const MOCKUP_LANDMARKS: Record<
  number,
  { src: string; title: string; subtitle?: string; x: number; y: number; width: number; alert?: 'pink' | 'yellow' }
> = {
  1: {
    src: '/assets/living-city/palace.webp',
    title: 'AIRFRYER PALACE',
    x: 340,
    y: 690,
    width: 470,
  },
  11: {
    src: '/assets/city/rocket-l2.webp',
    title: 'MARKET',
    subtitle: 'RUG ALLEY',
    x: 245,
    y: 985,
    width: 370,
    alert: 'pink',
  },
  2: {
    src: '/assets/city/pr-l3.webp',
    title: 'APOLOGY FACTORY',
    x: 1275,
    y: 495,
    width: 390,
  },
  0: {
    src: '/assets/city/civic-l2.webp',
    title: 'COLLECTION',
    subtitle: 'DOSSIER',
    x: 1415,
    y: 695,
    width: 375,
  },
  3: {
    src: '/assets/city/summit-l2.webp',
    title: 'JOBS',
    x: 1745,
    y: 720,
    width: 330,
  },
  4: {
    src: '/assets/city/feed-l2.webp',
    title: 'PROP STASH',
    x: 1605,
    y: 1045,
    width: 360,
    alert: 'pink',
  },
  7: {
    src: '/assets/city/afterparty-l2.webp',
    title: 'ROAST CLUB',
    x: 535,
    y: 395,
    width: 280,
  },
  9: {
    src: '/assets/city/civic-l1.webp',
    title: 'CITY ARCHIVE',
    x: 980,
    y: 360,
    width: 270,
  },
};

const locals = [
  { id: 'CC063', x: 960, y: 660, line: 'DOMAIN EXPANSION: ZERO ACCOUNTABILITY.' },
  { id: 'CC064', x: 1020, y: 672, line: 'CAME FOR THE COUPON. STAYED FOR THE DRAMA.' },
  { id: 'CC066', x: 1075, y: 664, line: 'STILL SECOND IN LINE.' },
  { id: 'CC135', x: 430, y: 715, line: 'DRACARYS. PREHEAT TO 200°C.' },
  { id: 'CC023', x: 315, y: 995, line: 'NO REFUNDS IN RUG ALLEY.' },
  { id: 'CC002', x: 1380, y: 730, line: 'YOUR APPEAL WAS BANNED.' },
  { id: 'CC001', x: 640, y: 985, line: '0/10 POWER SPIKE INCOMING.' },
];

export function worldAssets(city: City | null, prop?: string) {
  return [
    ...new Set(
      [
        '/assets/living-city/ground.webp',
        '/assets/living-city/walker.webp',
        '/assets/living-city/van.webp',
        ...places(city).map((p) => p.src),
        ...Object.values(MOCKUP_LANDMARKS).map((l) => l.src),
        ...locals.flatMap((p) => [CAST[p.id]?.poses[0]?.src, CAST[p.id]?.poses[1]?.src]),
        ...(city?.plots || []).flatMap((b) =>
          b?.residentId ? [CAST[b.residentId]?.poses[0]?.src] : []
        ),
        prop,
        city?.activeEvent
          ? CAST[CITY_EVENT_BY_ID[city.activeEvent.eventId]?.host]?.poses[0]?.src
          : undefined,
      ].filter((s): s is string => !!s)
    ),
  ];
}

function line(c: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  c.beginPath();
  points.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
}

function box(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke = INK,
  lw = 2.5
) {
  c.fillStyle = fill;
  c.fillRect(x, y, w, h);
  if (lw) {
    c.strokeStyle = stroke;
    c.lineWidth = lw;
    c.strokeRect(x, y, w, h);
  }
}

function oval(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string
) {
  c.beginPath();
  c.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
}

function words(
  c: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  size = 20,
  color = PAPER
) {
  c.font = `900 ${size}px CityCondensed,Impact,sans-serif`;
  c.fillStyle = color;
  c.textAlign = 'center';
  c.fillText(s, x, y);
}

function sprite(
  c: CanvasRenderingContext2D,
  images: Images,
  src: string,
  x: number,
  y: number,
  w: number
): Bounds | null {
  const im = images[src];
  const b = BOUNDS[src];
  if (!im || !b) return null;
  const h = (w * b.height) / b.width;
  c.drawImage(im, b.x, b.y, b.width, b.height, x - w / 2, y - h, w, h);
  return { x: x - w / 2, y: y - h, width: w, height: h };
}

// South Park-style articulated paper-cutout bounce & tilt
function actor(
  c: CanvasRenderingContext2D,
  images: Images,
  id: string,
  x: number,
  y: number,
  h: number,
  pose = 0,
  t = 0
) {
  const a = CAST[id];
  const p = a?.poses[pose] || a?.poses[0];
  if (!p || !images[p.src]) return;
  const s = h / a.baseHeight;
  const waddleAngle = t ? Math.sin(t * 7 + x * 0.1) * 0.055 : 0;
  const hop = t ? Math.abs(Math.sin(t * 7 + x * 0.1)) * 3.5 : 0;
  oval(c, x, y + 1, h * 0.2, h * 0.04, '#0d0e1488');
  c.save();
  c.translate(x, y - hop);
  c.rotate(waddleAngle);
  c.drawImage(images[p.src], -p.anchor.x * s, -p.anchor.y * s, p.width * s, p.height * s);
  c.restore();
}

function alertDiamond(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  tone: 'pink' | 'yellow',
  t: number
) {
  const bob = Math.sin(t * 4 + x * 0.02) * 4;
  c.save();
  c.translate(x, y + bob);
  c.rotate(Math.PI / 4);
  box(c, -16, -16, 32, 32, tone === 'pink' ? PINK : YELLOW, INK, 3);
  c.rotate(-Math.PI / 4);
  words(c, '!', 0, 9, 26, INK);
  c.restore();
}

function lamp(c: CanvasRenderingContext2D, x: number, y: number, t: number) {
  line(
    c,
    [
      { x, y },
      { x: x + 2, y: y - 96 },
      { x: x + 22, y: y - 104 },
    ],
    INK,
    7
  );
  line(
    c,
    [
      { x: x + 2, y: y - 3 },
      { x: x + 3, y: y - 95 },
    ],
    '#88816a',
    2
  );
  box(c, x + 10, y - 107, 28, 11, INK);
  oval(c, x + 24, y - 95, 11, 3, '#ffeb9f');
  const g = c.createRadialGradient(x + 24, y - 94, 1, x + 24, y - 94, 48);
  g.addColorStop(0, `rgba(255,215,64,${0.3 + Math.sin(t * 0.4 + x) * 0.03})`);
  g.addColorStop(1, '#f7c83900');
  c.fillStyle = g;
  c.fillRect(x - 24, y - 142, 96, 96);
  oval(c, x + 24, y, 30, 7, '#efd46924');
}

function buildHereLot(c: CanvasRenderingContext2D, x: number, y: number, w: number, selected: boolean) {
  const hw = w * 0.48;
  c.beginPath();
  c.moveTo(x - hw, y - 48);
  c.lineTo(x + 15, y - 115);
  c.lineTo(x + hw + 25, y - 40);
  c.lineTo(x - 10, y + 32);
  c.closePath();
  c.fillStyle = '#262320bb';
  c.fill();
  c.strokeStyle = INK;
  c.lineWidth = 4;
  c.stroke();

  // Wire fence posts
  const corners = [
    { x: x - hw, y: y - 48 },
    { x: x + 15, y: y - 115 },
    { x: x + hw + 25, y: y - 40 },
    { x: x - 10, y: y + 32 },
  ];
  for (const pt of corners) {
    line(
      c,
      [
        { x: pt.x, y: pt.y },
        { x: pt.x, y: pt.y - 48 },
      ],
      INK,
      5
    );
  }
  c.setLineDash([8, 6]);
  line(
    c,
    [
      { x: corners[0].x, y: corners[0].y - 26 },
      { x: corners[3].x, y: corners[3].y - 26 },
      { x: corners[2].x, y: corners[2].y - 26 },
    ],
    '#c8bc9e',
    2.5
  );
  c.setLineDash([]);

  // Tall BUILD HERE wooden sign with lock icon matching mockup
  box(c, x - 52, y - 128, 104, 86, selected ? YELLOW : PAPER, INK, 3.5);
  // Padlock icon
  c.beginPath();
  c.arc(x, y - 104, 9, Math.PI, 0);
  c.strokeStyle = INK;
  c.lineWidth = 3.5;
  c.stroke();
  box(c, x - 12, y - 104, 24, 18, INK, INK, 1);
  words(c, 'BUILD', x, y - 64, 22, INK);
  words(c, 'HERE', x, y - 45, 22, INK);
}

function drawBillboard(c: CanvasRenderingContext2D, t: number) {
  const x = 1665;
  const y = 265;
  // Steel legs
  line(
    c,
    [
      { x: x - 55, y: y + 50 },
      { x: x - 55, y: y + 95 },
    ],
    INK,
    6
  );
  line(
    c,
    [
      { x: x + 55, y: y + 50 },
      { x: x + 55, y: y + 95 },
    ],
    INK,
    6
  );
  box(c, x - 95, y - 42, 190, 96, PINK, INK, 4);
  words(c, 'OBEY', x - 34, y - 12, 24, INK);
  words(c, 'SCROLL', x - 34, y + 14, 24, INK);
  words(c, 'CONSUME', x - 34, y + 40, 22, INK);
  // Smirking silhouette on right of billboard
  oval(c, x + 52, y + 4, 26, 30, INK);
  oval(c, x + 44, y - 2, 4, 4, YELLOW);
  oval(c, x + 60, y - 2, 4, 4, YELLOW);
  if (Math.sin(t * 6) > 0.7) {
    c.strokeStyle = YELLOW;
    c.lineWidth = 2;
    c.strokeRect(x - 98, y - 45, 196, 102);
  }
}

export function paintWorld(
  c: CanvasRenderingContext2D,
  images: Images,
  s: WorldState,
  w: number,
  h: number,
  camera: Camera
): Hit[] {
  c.save();
  c.fillStyle = INK;
  c.fillRect(0, 0, w, h);
  c.translate(w / 2, h / 2);
  c.scale(camera.zoom, camera.zoom);
  c.translate(-camera.x, -camera.y);
  c.imageSmoothingEnabled = true;

  if (images['/assets/living-city/ground.webp']) {
    c.drawImage(images['/assets/living-city/ground.webp'], 0, 0, 1920, 1120);
  }

  const active = s.city?.activeEvent;
  const event =
    active && Date.parse(active.endsAt) > (s.now ?? Date.now())
      ? CITY_EVENT_BY_ID[active.eventId]
      : null;
  const t = s.reduced ? 0 : s.time;
  const items: { depth: number; draw: () => void }[] = [];
  const hits: Hit[] = [];

  // OBEY / SCROLL / CONSUME rooftop billboard in back-right
  items.push({
    depth: 290,
    draw: () => drawBillboard(c, t),
  });

  for (const original of places(s.city)) {
    const landmark = original.plot !== undefined ? MOCKUP_LANDMARKS[original.plot] : undefined;
    const effectiveSrc = original.src || landmark?.src || '';
    const effectiveX =
      original.id === 'court'
        ? 855
        : original.id === 'packs'
          ? 700
          : landmark && !s.city?.plots[original.plot!]
            ? landmark.x
            : original.x;
    const effectiveY =
      original.id === 'court'
        ? 635
        : original.id === 'packs'
          ? 1035
          : landmark && !s.city?.plots[original.plot!]
            ? landmark.y
            : original.y;
    const rawWidth =
      landmark && !s.city?.plots[original.plot!] ? landmark.width : original.width;

    const bd = BOUNDS[effectiveSrc];
    const p: Place = {
      ...original,
      src: effectiveSrc,
      x: effectiveX,
      y: effectiveY,
      width: bd
        ? Math.min(rawWidth, (Math.max(180, effectiveY - 95) * bd.width) / bd.height)
        : rawWidth,
    };

    items.push({
      depth: p.y,
      draw: () => {
        if (!p.src) {
          // Only render the prominent foreground BUILD HERE lot on plot 5 so the city stays dense like the mockup
          if (p.plot === 5) {
            buildHereLot(c, 1135, 945, 320, s.selected === p.id);
            hits.push({
              id: p.id,
              x: 1135 - 140,
              y: 945 - 135,
              width: 280,
              height: 165,
              depth: 945,
            });
          } else {
            hits.push({
              id: p.id,
              x: p.x - p.width * 0.3,
              y: p.y - 75,
              width: p.width * 0.6,
              height: 90,
              depth: p.y,
            });
          }
          return;
        }

        const b = p.plot === undefined ? null : s.city?.plots[p.plot];
        const focus = s.selected === p.id || s.hover === p.id;
        oval(c, p.x + 4, p.y - 14, p.width * 0.34, p.width * 0.04, '#0c0e1455');
        if (focus) {
          c.shadowColor = YELLOW;
          c.shadowBlur = 14;
        }
        const rect = sprite(c, images, p.src, p.x, p.y, p.width);
        c.shadowBlur = 0;
        if (rect) hits.push({ id: p.id, ...rect, depth: p.y, src: p.src });

        if(p.plot===1&&s.caseSign){box(c,p.x-150,p.y-35,300,32,PAPER,INK,3);words(c,s.caseSign,p.x,p.y-12,21,INK);}
        // Landmark signs matching the top-left mockup quadrant
        if (landmark && !b) {
          const signY = p.y - (rect ? rect.height * 0.46 : 120);
          if (landmark.subtitle) {
            box(c, p.x - 92, signY - 24, 184, 52, PAPER, INK, 3);
            words(c, landmark.title, p.x, signY - 1, 21, INK);
            words(c, landmark.subtitle, p.x, signY + 21, 20, INK);
          } else if (p.plot !== 1) {
            box(c, p.x - 95, signY - 16, 190, 34, PAPER, INK, 3);
            words(c, landmark.title, p.x, signY + 8, 22, INK);
          }
          if (landmark.alert) {
            alertDiamond(
              c,
              p.x,
              p.y - (rect ? rect.height * 0.76 : 185),
              landmark.alert,
              t
            );
          }
        }

        // Screenshot Court caution tape & yellow ! diamond
        if (p.id === 'court') {
          alertDiamond(c, p.x, p.y - (rect ? rect.height * 0.56 : 210), 'yellow', t);
          line(
            c,
            [
              { x: p.x - 160, y: p.y - 8 },
              { x: p.x + 150, y: p.y + 18 },
            ],
            YELLOW,
            5
          );
          c.setLineDash([10, 8]);
          line(
            c,
            [
              { x: p.x - 160, y: p.y - 8 },
              { x: p.x + 150, y: p.y + 18 },
            ],
            INK,
            5
          );
          c.setLineDash([]);
        }

        // Open Packs pink ! diamond
        if (p.id === 'packs') {
          alertDiamond(c, p.x - 45, p.y - (rect ? rect.height * 0.78 : 200), 'pink', t);
        }

        if (b) {
          box(
            c,
            p.x - 66,
            p.y + 4,
            132,
            25,
            focus ? YELLOW : INK,
            focus ? INK : '#b7aa8b',
            2
          );
          words(
            c,
            `LVL ${b.level} · ${b.residentId ? 'ON SHIFT' : 'VACANT'}`,
            p.x,
            p.y + 22,
            16,
            focus ? INK : PAPER
          );
          if (b.residentId) actor(c, images, b.residentId, p.x + p.width * 0.28, p.y + 25, 68, 0, t);
          const sign = s.city?.signs[String(p.plot)];
          if (sign) {
            box(c, p.x - 94, p.y - 55, 188, 24, PAPER);
            words(c, sign, p.x, p.y - 37, 17, INK);
          }
        }

        // Pink factory smoke & palace steam
        if (p.plot === 1 || p.plot === 2 || b?.kind === 'afterparty') {
          const isFactory = p.plot === 2;
          for (let k = 0; k < 6; k++) {
            const q = (t * 0.24 + k / 6) % 1;
            c.globalAlpha = (1 - q) * (isFactory ? 0.28 : 0.2);
            oval(
              c,
              p.x + (isFactory ? -20 : p.width * 0.32) + Math.sin(q * 6) * 14,
              p.y - p.width * 0.68 - q * 95,
              10 + q * 16,
              14 + q * 18,
              isFactory ? PINK : '#edd8b0'
            );
          }
          c.globalAlpha = 1;
        }

        if (s.construction && s.construction.plot === p.plot) {
          const q = (s.time - s.construction.at) / 1.3;
          if (q >= 0 && q < 1) {
            c.globalAlpha = 1 - q;
            for (let k = 0; k < 18; k++) {
              c.fillStyle = k % 2 ? PINK : YELLOW;
              c.fillRect(
                p.x + Math.cos(k * 2.4) * q * 100,
                p.y - 40 + Math.sin(k * 2.4) * q * 80,
                4,
                9
              );
            }
            c.globalAlpha = 1;
          }
        }
      },
    });
  }

  // Delivery van along road
  const cycle = t % 51;
  const d = (cycle < 17 ? cycle : cycle < 22 ? 17 : cycle - 5) * 52 - 110;
  const van = routePoint(ROAD, d);
  items.push({
    depth: van.y + 12,
    draw: () => {
      c.save();
      c.translate(van.x, van.y + 12);
      c.rotate(van.angle * 0.3);
      oval(c, 0, -2, 64, 10, '#14151a55');
      sprite(c, images, '/assets/living-city/van.webp', 0, 0, 148);
      c.restore();
    },
  });

  // Walking pedestrians
  for (let i = 0; i < 24; i++) {
    const r = WALKS[i % 4];
    const len = routeLength(r);
    const walk = (t * (13 + (i % 4) * 2.2) + i * 173) % (2 * len);
    const reverse = walk > len;
    const p = routePoint(r, reverse ? 2 * len - walk : walk);
    items.push({
      depth: p.y,
      draw: () => {
        const image = images['/assets/living-city/walker.webp'];
        if (!image) return;
        const f = walkCycle[Math.floor(t * 8 + i * 1.7) % 8];
        const scale = (39 + p.y / 110) / f.height;
        c.save();
        c.translate(p.x, p.y);
        c.scale((reverse ? -1 : 1) * (event?.kind === 'reverse' ? -1 : 1), 1);
        oval(c, 0, 1, 9, 3, '#11151a66');
        c.drawImage(
          image,
          f.x,
          f.y,
          f.width,
          f.height,
          -f.anchorX * scale,
          -f.anchorY * scale,
          f.width * scale,
          f.height * scale
        );
        c.restore();
      },
    });
  }

  // South Park-style waddling residents with comic speech bubbles
  locals
    .filter((p) => !s.city?.plots.some((b) => b?.residentId === p.id))
    .forEach((p, idx) => {
      items.push({
        depth: p.y,
        draw: () => {
          const pose = Math.floor(t * 1.5 + idx) % 4 === 0 ? 1 : 0;
          actor(c, images, p.id, p.x, p.y, 72, pose, t);
          hits.push({
            id: p.id,
            x: p.x - 26,
            y: p.y - 72,
            width: 52,
            height: 76,
            depth: p.y,
          });
          // Rotating comic speech bubble
          if (!s.reduced && Math.floor((t + idx * 3.5) % 18) < 3) {
            const bw = Math.max(165, p.line.length * 7.2);
            box(c, p.x - bw / 2, p.y - 108, bw, 28, PAPER, INK, 2.5);
            words(c, p.line, p.x, p.y - 88, 15, INK);
          }
        },
      });
    });

  for (const [x, y] of [
    [560, 620],
    [1188, 670],
    [305, 665],
    [1660, 720],
    [505, 1000],
    [1300, 1060],
    [1080, 810],
  ]) {
    items.push({ depth: y, draw: () => lamp(c, x, y, t) });
  }

  if (s.prop) {
    items.push({
      depth: 1060,
      draw: () => {
        box(c, 1435, 1014, 72, 36, '#514d56', INK, 3);
        sprite(c, images, s.prop!, 1471, 1018, 68);
      },
    });
  }

  items.sort((a, b) => a.depth - b.depth).forEach((o) => o.draw());

  if (event?.kind === 'sleep') {
    c.fillStyle = '#15152c40';
    c.fillRect(0, 0, 1920, 1120);
  }
  if (event?.kind === 'disco') {
    for (let i = 0; i < 6; i++) {
      const x = 340 + i * 240;
      const y = 720 + Math.sin(t + i) * 40;
      const g = c.createRadialGradient(x, y, 0, x, y, 100);
      g.addColorStop(0, i % 2 ? '#ff168c30' : '#64e7e530');
      g.addColorStop(1, '#ff168c00');
      c.fillStyle = g;
      c.fillRect(x - 100, y - 100, 200, 200);
    }
  }

  c.restore();
  return hits.sort((a, b) => b.depth - a.depth);
}

export function pickWorld(
  hits: Hit[],
  p: Point,
  camera: Camera,
  w: number,
  h: number,
  masks?: Record<string, (x: number, y: number) => boolean>
) {
  const pt = worldPoint(p, camera, w, h);
  return hits.find(
    (o) =>
      pt.x >= o.x &&
      pt.x <= o.x + o.width &&
      pt.y >= o.y &&
      pt.y <= o.y + o.height &&
      (!o.src || !masks?.[o.src] || masks[o.src]((pt.x - o.x) / o.width, (pt.y - o.y) / o.height))
  );
}
