#!/usr/bin/env python3
"""A deterministic, code-authored Cancel City short. No browser or screen capture."""
from __future__ import annotations
import argparse
import json
import math
import subprocess
import wave
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/assets/cinema'
WORK = ROOT / 'work/cinema'
DURATION, FPS = 14.8, 30
PINK, ACID, PAPER, INK = '#ff269e', '#deff00', '#f2e8cb', '#101115'
WIDTH, HEIGHT, S = 1920, 1080, 1.5
RESAMPLE = Image.Resampling.LANCZOS


def clamp(x, low=0, high=1):
    return max(low, min(high, x))


def ease(x):
    return 1 - (1 - clamp(x)) ** 3


def smooth(x):
    p = clamp(x)
    return p * p * (3 - 2 * p)


def back(x):
    p = clamp(x) - 1
    return 1 + 2.70158 * p ** 3 + 1.70158 * p ** 2


def size(x):
    return max(1, round(x * S))


def point(xy):
    return tuple(round(v * S) for v in xy)


def layer():
    return Image.new('RGBA', (WIDTH, HEIGHT))


def poly(im, points, fill, stroke=None, width=2):
    d = ImageDraw.Draw(im)
    pts = [point(p) for p in points]
    d.polygon(pts, fill=fill)
    if stroke:
        d.line(pts + [pts[0]], fill=stroke, width=size(width), joint='curve')


def line(im, points, fill, width=2):
    ImageDraw.Draw(im).line([point(p) for p in points], fill=fill, width=size(width), joint='curve')


def rect(im, box, fill, outline=None, width=2, radius=0):
    fn = ImageDraw.Draw(im).rounded_rectangle if radius else ImageDraw.Draw(im).rectangle
    args = dict(fill=fill, outline=outline, width=size(width))
    if radius:
        args['radius'] = size(radius)
    fn(tuple(round(v * S) for v in box), **args)


def oval(im, box, fill, outline=None, width=2):
    ImageDraw.Draw(im).ellipse(tuple(round(v * S) for v in box), fill=fill, outline=outline, width=size(width))


@lru_cache(maxsize=64)
def font(px, mono=False):
    return ImageFont.truetype(str(ROOT / 'scripts/cinema/fonts' / ('Mono.ttf' if mono else 'Display.ttf')), size(px))


@lru_cache(maxsize=256)
def lettering(text, px, color=PAPER, stroke=INK, sw=2, mono=False, squeeze=1):
    f = font(px, mono)
    bbox = f.getbbox(text, stroke_width=size(sw))
    im = Image.new('RGBA', (bbox[2] - bbox[0] + size(12), bbox[3] - bbox[1] + size(12)))
    ImageDraw.Draw(im).text((size(6) - bbox[0], size(6) - bbox[1]), text, font=f, fill=color, stroke_width=size(sw), stroke_fill=stroke)
    if squeeze != 1:
        im = im.resize((max(1, round(im.width * squeeze)), im.height), RESAMPLE)
    return im


def paste(im, asset, x, y, w=None, h=None, angle=0, alpha=1, anchor='center'):
    if w is not None:
        hh = h if h is not None else w * asset.height / asset.width
        asset = asset.resize((size(w), size(hh)), RESAMPLE)
    if angle:
        asset = asset.rotate(angle, Image.Resampling.BICUBIC, expand=True)
    if alpha < 1:
        asset = asset.copy()
        asset.putalpha(asset.getchannel('A').point(lambda a: round(a * clamp(alpha))))
    xx, yy = point((x, y))
    if anchor == 'center':
        xx -= asset.width // 2
        yy -= asset.height // 2
    elif anchor == 'bottom':
        xx -= asset.width // 2
        yy -= asset.height
    im.alpha_composite(asset, (xx, yy))


def text(im, value, x, y, px=36, color=PAPER, angle=0, alpha=1, mono=False, squeeze=.82, sw=2):
    paste(im, lettering(value, px, color, INK, sw, mono, squeeze), x, y, angle=angle, alpha=alpha)


def label(im, value, x, y, color=ACID, angle=-3, px=22):
    words = lettering(value, px, INK, INK, 0, True, .92)
    tag = Image.new('RGBA', (words.width + size(28), words.height + size(14)))
    d = ImageDraw.Draw(tag)
    d.rectangle((0, 0, tag.width - 1, tag.height - 1), fill=color, outline=INK, width=size(3))
    tag.alpha_composite(words, (size(14), size(7)))
    paste(im, tag, x, y, angle=angle)


CITY = None
LOGO = None
POSES = []
POSE_META = []
PACK = None
CARD = None
RECEIPT = None
NOISE = []


def load_assets():
    global CITY, LOGO, POSES, POSE_META, PACK, CARD, RECEIPT, NOISE
    CITY = Image.open(ROOT / 'public/assets/reference/city-backdrop.webp').convert('RGBA')
    LOGO = Image.open(ROOT / 'public/assets/reference/title-logo.webp').convert('RGBA')
    POSE_META = json.loads((ROOT / 'docs/art/cinema/poses.json').read_text())['poses']
    for i in range(6):
        path = OUT / f'karen-pose-{i}.webp'
        if not path.exists():
            path = OUT / f'karen-pose-{i}.png'
        if not path.exists():
            raise FileNotFoundError(f'Pose asset is not ready: {path}')
        POSES.append(Image.open(path).convert('RGBA'))
    PACK = make_pack()
    CARD = make_target_card()
    RECEIPT = make_receipt()
    rng = np.random.default_rng(26026)
    for _ in range(6):
        a = np.zeros((HEIGHT, WIDTH, 4), dtype=np.uint8)
        a[:, :, :3] = 7
        a[:, :, 3] = rng.integers(0, 17, (HEIGHT, WIDTH), dtype=np.uint8)
        NOISE.append(Image.fromarray(a))


def make_pack():
    im = Image.new('RGBA', (size(330), size(490)), '#28232d')
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((size(5), size(5), size(325), size(485)), radius=size(8), fill='#312539', outline=PAPER, width=size(3))
    d.polygon([point(p) for p in [(10, 130), (320, 72), (320, 255), (10, 310)]], fill=PINK)
    d.polygon([point(p) for p in [(10, 364), (320, 322), (320, 392), (10, 432)]], fill=ACID)
    for yy in [14, 22, 30, 454, 462, 470]:
        d.line([point((12, yy)), point((318, yy))], fill='#968899', width=size(2))
    for x in range(17, 320, 8):
        d.line([point((x, 10)), point((x, 39))], fill=INK, width=size(2))
        d.line([point((x, 450)), point((x, 480))], fill=INK, width=size(2))
    paste(im, LOGO, 165, 200, w=305, angle=-3)
    text(im, 'TRADING CARDS', 165, 306, 23, PAPER, angle=-4)
    text(im, 'CONTAINS: PROBLEMS', 165, 377, 22, INK, angle=-7, sw=0)
    text(im, '5 RESIDENTS / ZERO PEACE', 165, 423, 12, PAPER, mono=True, squeeze=1, sw=0)
    rng = np.random.default_rng(8)
    for _ in range(110):
        x, y = rng.uniform(14, 316), rng.uniform(42, 445)
        d.line([point((x, y)), point((x + rng.uniform(1, 5), y + rng.uniform(-4, 4)))], fill=(12, 12, 15, 125), width=size(1))
    return im


def make_target_card():
    im = Image.new('RGBA', (size(290), size(410)), INK)
    d = ImageDraw.Draw(im)
    d.rectangle((size(6), size(6), size(284), size(404)), fill=PAPER, outline=PINK, width=size(7))
    portrait = Image.open(ROOT / 'public/assets/residents/CC003.webp').convert('RGBA').resize((size(260), size(270)), RESAMPLE)
    im.alpha_composite(portrait, point((15, 15)))
    text(im, 'THE REPLY GUY', 145, 320, 31, INK, sw=0, squeeze=.73)
    text(im, 'ACTUALLY...', 145, 368, 24, PINK, squeeze=.9)
    return im


def make_receipt():
    im = Image.new('RGBA', (size(190), size(880)), PAPER)
    d = ImageDraw.Draw(im)
    d.rectangle((size(5), size(5), size(185), size(875)), outline=INK, width=size(2))
    text(im, 'KAREN & CO.', 95, 40, 25, INK, squeeze=.78, sw=0)
    text(im, 'OFFICIAL RECEIPT', 95, 73, 12, INK, mono=True, sw=0)
    rows = ['AUDACITY          99', 'BAD TAKES         42', 'MANAGERS           0', 'REGRETS            0', '', 'TOTAL: YOUR DIGNITY']
    for j in range(9):
        yy = 104 + j * 82
        d.line([point((15, yy)), point((175, yy))], fill=INK, width=size(1))
        text(im, rows[j % len(rows)], 95, yy + 27, 10, INK, mono=True, sw=0, squeeze=.84)
        for k in range(17):
            d.rectangle((size(21 + k * 9), size(yy + 45), size(24 + k * 9), size(yy + 61)), fill=INK)
    return im


def city_shot(t, zoom=1.06, cx=.5, cy=.5, darkness=.1):
    cover = max(WIDTH / CITY.width, HEIGHT / CITY.height) * zoom
    scaled = CITY.resize((round(CITY.width * cover), round(CITY.height * cover)), RESAMPLE)
    left = round((scaled.width - WIDTH) * clamp(cx))
    top = round((scaled.height - HEIGHT) * clamp(cy))
    im = scaled.crop((left, top, left + WIDTH, top + HEIGHT))
    im.alpha_composite(Image.new('RGBA', im.size, (10, 10, 18, round(255 * darkness))))
    # Independent foreground street objects establish depth across the camera move.
    fg = layer()
    shift = (cx - .5) * -240
    poly(fg, [(-50 + shift, 720), (68 + shift, 720), (47 + shift, 0), (21 + shift, 0)], INK)
    line(fg, [(-50, 96), (390 + shift, 35), (1280, 80)], INK, 7)
    for x, y in [(260 + shift, 56), (720 + shift, 63), (1030 + shift, 76)]:
        line(fg, [(x, y), (x, y + 26)], INK, 4)
        oval(fg, (x - 9, y + 23, x + 9, y + 36), '#edc750', INK, 3)
    # Drifting paper, authored trajectories rather than a screen-space confetti burst.
    for i in range(7):
        x = ((i * 219 + t * (19 + i * 3)) % 1500) - 110
        y = 450 + 155 * math.sin(t * .55 + i * 1.8)
        poly(fg, [(x, y), (x + 16, y - 6), (x + 25, y + 17), (x + 6, y + 22)], (232, 216, 186, 180), INK, 1)
    im.alpha_composite(fg)
    return im


def halftone(im, t, bg=INK, color=PINK, focus=(730, 340)):
    rect(im, (0, 0, 1280, 720), bg)
    fx, fy = focus
    for i in range(22):
        a = i * math.tau / 22 + .08 * math.sin(t * .35)
        near, far = 150, 1600
        width = .022 + (i % 3) * .012
        poly(im, [(fx + math.cos(a - width) * near, fy + math.sin(a - width) * near),
                  (fx + math.cos(a - width) * far, fy + math.sin(a - width) * far),
                  (fx + math.cos(a + width) * far, fy + math.sin(a + width) * far),
                  (fx + math.cos(a + width) * near, fy + math.sin(a + width) * near)], color)
    dots = layer()
    for y in range(12, 720, 26):
        for x in range(12, 1280, 26):
            r = 2 + 2 * ((x + y) % 78) / 78
            oval(dots, (x - r, y - r, x + r, y + r), (0, 0, 0, 80))
    im.alpha_composite(dots)


def actor(im, pose, x, floor=676, height=570, angle=0, alpha=1, squash=1):
    art = POSES[pose]
    anchor = POSE_META[pose]['suggestedAnchor']
    k = height / 430
    w, h = art.width * k * squash, art.height * k
    cx = x + (art.width / 2 - anchor['x']) * k * squash
    cy = floor + (art.height / 2 - anchor['y']) * k
    paste(im, art, cx, cy, w=w, h=h, angle=angle, alpha=alpha)


def speech(im, lines, x, y, width=320, height=145, pointer=(0, 90), angle=-3):
    panel = Image.new('RGBA', (size(width + 20), size(height + 48)))
    d = ImageDraw.Draw(panel)
    pts = [(8, 8), (width + 8, 4), (width, height), (width * .6, height - 4), (width * .4 + pointer[0], height + 35), (width * .42, height - 2), (9, height + 3)]
    d.polygon([point(p) for p in pts], fill=PAPER, outline=INK)
    d.line([point(p) for p in pts + [pts[0]]], fill=INK, width=size(6), joint='curve')
    for i, phrase in enumerate(lines):
        text(panel, phrase, width / 2 + 7, 34 + i * 41, 34, INK, squeeze=.85, sw=0)
    paste(im, panel, x, y, angle=angle)


def deform_pack(progress, t):
    # Horizontal paper strips move with a travelling crease and seam tension.
    pad = size(50)
    im = Image.new('RGBA', (PACK.width + pad * 2, PACK.height + size(25)))
    strips = 35
    for i in range(strips):
        top = round(i * PACK.height / strips)
        bottom = round((i + 1) * PACK.height / strips)
        offset = size(progress * 14 * math.sin(i * .31 + t * 24) * (1 - i / strips))
        im.alpha_composite(PACK.crop((0, top, PACK.width, bottom)), (pad + offset, top))
    return im


def pack_shot(t):
    im = city_shot(t, 1.48, .48, .83, .68)
    local = t - 2.25
    enter = back(local / .55)
    wobble = math.sin(local * 29) * clamp((local - .55) / .5)
    width = 420 * enter
    if local < 1.32:
        crinkle = clamp((local - .5) / .7)
        art = deform_pack(crinkle, local)
        paste(im, art, 640 + wobble * 3, 385, w=max(1, width), angle=-5 + wobble)
        # Long printing scratches catch the moving wrapper highlight.
        if local > .5:
            label(im, 'SEALED FOR YOUR OWN GOOD', 990, 237, PAPER, 5, 16)
            text(im, 'WHAT COULD', 996, 320, 46, PAPER, angle=-2)
            text(im, 'GO WRONG?', 992, 375, 55, ACID, angle=-2)
            text(im, 'PULL AT YOUR OWN RISK.', 640, 646, 16, PAPER, mono=True)
    else:
        rip = ease((local - 1.32) / .55)
        # Tear propagates as a jagged seam; cap and wrapper depart independently.
        jag = [point((x, 75 + (7 if i % 2 else -7))) for i, x in enumerate(range(0, 331, 15))]
        topmask = Image.new('L', PACK.size)
        ImageDraw.Draw(topmask).polygon([(0, 0), (PACK.width, 0)] + list(reversed(jag)), fill=255)
        cap = PACK.copy()
        cap.putalpha(topmask)
        body = PACK.copy()
        body.putalpha(Image.eval(topmask, lambda v: 255 - v))
        paste(im, cap, 640 + rip * 350, 372 - rip * 330, w=330, angle=-5 - rip * 46, alpha=1 - rip * .8)
        paste(im, body, 640 - rip * 180, 385 + rip * 350, w=330 * (1 - rip * .2), angle=-5 + rip * 18, alpha=1 - rip)
        burst = layer()
        for i in range(14):
            a = i * math.tau / 14
            r = 95 + rip * (270 + i % 4 * 70)
            x, y = 640 + math.cos(a) * r, 300 + math.sin(a) * r
            poly(burst, [(x, y), (x + 25, y - 10), (x + 38, y + 13), (x + 10, y + 24)], ACID if i % 3 == 0 else PAPER, INK, 2)
        im.alpha_composite(burst)
        actor(im, 0, 640, floor=695 + (1 - rip) * 500, height=510 * (.5 + rip * .5), angle=(1 - rip) * 13, alpha=rip)
        if local > 1.75:
            label(im, 'PUBLIC MENACE DETECTED', 640, 98, ACID, -3, 24)
    return im


def printer(im, x, y, scale=1, jitter=0):
    # Deliberately overbuilt, shop-grade receipt printer drawn as layered ink shapes.
    xx, yy, z = x + jitter, y, scale
    def p(a, b): return (xx + a * z, yy + b * z)
    poly(im, [p(-150, -80), p(120, -80), p(180, -30), p(-110, -30)], '#8b8393', INK, 6)
    poly(im, [p(-110, -30), p(180, -30), p(150, 145), p(-135, 145)], '#443949', INK, 6)
    poly(im, [p(120, -80), p(180, -30), p(150, 145), p(105, 103)], '#231c27', INK, 5)
    poly(im, [p(-74, -20), p(133, -20), p(122, 12), p(-77, 12)], INK, PAPER, 3)
    oval(im, (*p(102, 46), *p(122, 66)), ACID, INK, 2)
    line(im, [p(-103, 108), p(118, 108)], INK, 5)
    for k in range(6):
        line(im, [p(-85 + k * 22, 55), p(-82 + k * 22, 87)], '#201c23', 4)
    for k in range(12):
        line(im, [p(127 + k * 2.7, 5), p(116 + k * 2.7, 83)], '#796d80', 1)
    for a, b in [(-94, 21), (147, 22), (-109, 124), (129, 125)]:
        oval(im, (*p(a - 3, b - 3), *p(a + 3, b + 3)), PAPER, INK, 1)
    line(im, [p(-136, 143), p(-132, 162), p(-99, 162)], INK, 9)
    line(im, [p(116, 145), p(113, 162), p(142, 162)], INK, 9)
    line(im, [p(164, 108), p(218, 129), p(225, 161), p(208, 188), p(251, 205)], INK, 5)
    text(im, 'OUT OF PATIENCE', xx + 4 * z, yy + 35 * z, 11 * z, PAPER, angle=3, mono=True, sw=0)


def print_shot(t):
    u = t - 6.25
    im = layer()
    halftone(im, t, '#b82077', '#2c182e', (820, 420))
    actor(im, 2, 900, floor=784, height=770, angle=-3)
    length = 30 + ease(u / 1.22) * 670
    receipt = RECEIPT.crop((0, 0, RECEIPT.width, min(RECEIPT.height, size(length))))
    paste(im, receipt, 472, 427 - length / 2, w=190, angle=-5)
    printer(im, 510, 440, 1.75, math.sin(t * 100) * clamp(u) * 3)
    label(im, 'CUSTOMER SERVICE: FINAL FORM', 640, 63, ACID, -2, 21)
    if u > .45:
        text(im, 'PRINTING YOUR', 366, 583, 48, PAPER, angle=-3)
        text(im, 'DOWNFALL.', 374, 641, 66, ACID, angle=-3)
    return im


def receipt_curve(t, p):
    # A long ribbon curls through scene space; the head pursues the reply card.
    x = 120 + 1060 * p
    y = 255 + p * 155 - math.sin(p * math.pi) * 220 + math.sin(p * 7.9 + t * 1.3) * p * 85
    return x, y


def ribbon(im, t, progress):
    if progress <= 0:
        return
    pts = [receipt_curve(t, p) for p in np.linspace(0, clamp(progress), max(2, round(progress * 110)))]
    line(im, [(x + 6, y + 13) for x, y in pts], '#170c22', 65)
    line(im, pts, INK, 61)
    line(im, pts, PAPER, 52)
    for p in np.arange(.025, clamp(progress), .057):
        x, y = receipt_curve(t, p)
        a = receipt_curve(t, p + .01)
        angle = -math.degrees(math.atan2(a[1] - y, a[0] - x))
        txt = lettering('AUDACITY 99', 11, INK, INK, 0, True, .87)
        paste(im, txt, x, y, angle=angle)
    for p in np.arange(.02, clamp(progress), .031):
        x, y = receipt_curve(t, p)
        a = receipt_curve(t, p + .006)
        angle = math.atan2(a[1] - y, a[0] - x)
        nx, ny = -math.sin(angle), math.cos(angle)
        line(im, [(x + nx * 17, y + ny * 17), (x - nx * 17, y - ny * 17)], '#6c6460', 1)


def attack_shot(t):
    u = t - 7.65
    im = city_shot(t, 1.25, .62, .68, .54)
    stage = layer()
    poly(stage, [(-80, 90), (735, 0), (455, 720), (-80, 720)], (255, 25, 153, 85))
    poly(stage, [(795, 0), (1350, 0), (1350, 720), (535, 720)], (25, 16, 25, 155))
    im.alpha_composite(stage)
    if u < .65:
        text(im, 'RECEIPT', 855, 120, 109, PAPER, angle=5)
        text(im, 'APOCALYPSE', 835, 227, 102, ACID, angle=5, squeeze=.69)
    target_u = clamp((u - 1.45) / .45)
    target_x = 1030 + target_u * 90
    target_y = 449 - math.sin(target_u * math.pi) * 120
    paste(im, CARD, target_x, target_y, w=255, angle=-9 - target_u * 28)
    if u < .9:
        speech(im, ['ACTUALLY,', 'ACCORDING TO—'], 970, 93, 330, 104, angle=5)
    # A three-frame ink smear leads the drawn action pose.
    if .5 < u < .68:
        actor(im, 3, 276 - (u - .5) * 390, height=592, alpha=.28, squash=1.25)
        actor(im, 3, 320 - (u - .5) * 390, height=592, alpha=.42, squash=1.14)
    pose = 2 if u < .5 else 3
    travel = ease((u - .52) / 1.03)
    ribbon(im, t, travel)
    actor(im, pose, 280 + ease((u - .5) / .28) * 38, floor=695, height=590, angle=-5 + math.sin(u * 4) * 2)
    if u > 1.25:
        # The snake winds across the card: explicit front wraps make contact readable.
        for j in range(4):
            pp = clamp((u - 1.25 - j * .08) / .23)
            strip = RECEIPT.crop((0, size(j * 72), RECEIPT.width, size(j * 72 + 50)))
            paste(im, strip, target_x, target_y - 84 + j * 62, w=310 * pp, h=48, angle=14 - j * 9, alpha=pp)
    for j in range(10):
        pp = clamp((u - 1.5 - j * .014) / .75)
        if pp:
            x = 1070 + math.cos(j * 2.4) * pp * 335
            y = 335 + math.sin(j * 2.4) * pp * 270 + pp * pp * 95
            fragment = RECEIPT.crop((0, size(j * 50), RECEIPT.width, size(j * 50 + 40)))
            paste(im, fragment, x, y, w=80 + j % 3 * 30, angle=j * 38 + pp * 120, alpha=1 - pp * .6)
    if 1.57 < u < 1.8:
        text(im, 'RATIO.', 758, 546, 160, ACID, angle=-12)
    return im


def verdict_shot(t):
    im = layer()
    halftone(im, t, PAPER, '#e4d5b5', (1030, 430))
    startled = 11.12 <= t < 11.55
    hop = math.sin(clamp((t - 11.12) / .43) * math.pi) * 35 if startled else 0
    actor(im, 5 if startled else 4, 380, floor=730 - hop, height=635, angle=7 if startled else 0)
    paste(im, CARD, 1006, 414, w=215, angle=-17)
    for j in range(5):
        strip = RECEIPT.crop((0, size(j * 72), RECEIPT.width, size(j * 72 + 50)))
        paste(im, strip, 1005, 316 + j * 43, w=290, h=40, angle=11 - j * 5)
    text(im, 'THREAD', 815, 118, 110, INK, sw=0)
    text(im, 'LOCKED.', 845, 225, 126, PINK, angle=-4)
    if not startled:
        speech(im, ['I AM', 'THE MANAGER.'], 693, 458, 320, 130, angle=-5)
    else:
        label(im, 'PAPER CUT. EMOTIONAL DAMAGE.', 704, 465, PINK, 6, 15)
        paste(im, RECEIPT.crop((0, 0, RECEIPT.width, size(130))), 485 - hop * 4, 330 - hop, w=100, angle=30 + hop * 3)
    label(im, 'NO REFUNDS. NO APPEAL.', 794, 659, ACID, -3, 22)
    return im


def final_shot(t):
    u = t - 12.15
    im = city_shot(t, 1.16 - .08 * ease(u / 2.5), .44, .43, .35)
    # Papery diagonal chapter cut gives way to the original city logo.
    paste(im, LOGO, 640, 260, w=600 * (.88 + .12 * back(u / .55)))
    label(im, 'EVERYONE IS THE PROBLEM.', 640, 470, ACID, -3, 26)
    text(im, 'PULL. FIGHT. REPEAT.', 640, 551, 32, PAPER, mono=True, squeeze=.9)
    text(im, 'FINAL BOSS KAREN / RECEIPT APOCALYPSE', 640, 628, 13, PAPER, mono=True, squeeze=1, sw=1)
    return im


def render(t):
    if t < 2.25:
        im = city_shot(t, 1.08 + t * .035, .35 + t * .08, .45 + t * .065, .08)
        actor(im, 0 if t < 1.3 else 1, 804 - t * 18, floor=642, height=207, angle=-2)
        if t > .2:
            label(im, 'CANCEL CITY / 08:59 AM', 348, 122, ACID, -3, 22)
        p = ease((t - .35) / .6)
        text(im, 'ANOTHER', 386 - (1 - p) * 700, 257, 79, PAPER, angle=-3)
        text(im, 'NORMAL DAY.', 424 - (1 - p) * 850, 335, 86, ACID, angle=-3)
        if t > 1.18:
            label(im, 'CUSTOMER SERVICE HAS LEFT THE CHAT.', 513, 620, PAPER, 2, 18)
    elif t < 4.8:
        im = pack_shot(t)
    elif t < 6.25:
        im = layer()
        halftone(im, t, PINK, '#7c165a', (360, 350))
        u = t - 4.8
        actor(im, 0 if u < .53 else 1, 376, floor=714, height=650, angle=-3)
        text(im, 'FINAL BOSS', 910, 158, 73, PAPER, angle=-4)
        text(im, 'KAREN', 905, 267, 148, ACID, angle=-4)
        label(im, 'CUSTOMER SERVICE / ENDGAME', 923, 392, PAPER, 3, 17)
        if u > .45:
            speech(im, ['I KEPT', 'THE RECEIPTS.'], 908, 536, 335, 124, angle=-4)
    elif t < 7.65:
        im = print_shot(t)
    elif t < 10.2:
        # A six-frame action hold at contact emphasizes weight instead of easing through it.
        action_t = 9.25 if 9.25 <= t < 9.45 else t - .2 if t >= 9.45 else t
        im = attack_shot(action_t)
        if 9.25 <= t < 9.32:
            fx = layer()
            poly(fx, [(535, 0), (565, 0), (1280, 610), (1280, 654)], PAPER)
            im.alpha_composite(fx)
    elif t < 12.15:
        im = verdict_shot(t)
    else:
        im = final_shot(t)
    # Two hand-cut wipes connect the establishing scene and final city tableau.
    for cut in [2.25, 12.15]:
        if cut <= t < cut + .18:
            p = (t - cut) / .18
            x = -500 + p * 2400
            poly(im, [(x - 460, 0), (x + 30, 0), (x - 200, 720), (x - 690, 720)], INK)
    im.alpha_composite(NOISE[round(t * 15) % len(NOISE)])
    # Thin ink frame, finite movement and safe inset for the widescreen composition.
    line(im, [(3, 3), (1277, 3), (1277, 717), (3, 717), (3, 3)], INK, 6)
    return im.convert('RGB')


def soundtrack():
    sr = 48000
    length = round(DURATION * sr)
    audio = np.zeros((length, 2), dtype=np.float64)
    rng = np.random.default_rng(26)

    def add(at, sample, gain=1, pan=0):
        start = round(at * sr)
        if start < 0:
            sample, start = sample[-start:], 0
        n = min(len(sample), length - start)
        if n <= 0:
            return
        theta = (clamp(pan, -1, 1) + 1) * math.pi / 4
        audio[start:start+n, 0] += sample[:n] * gain * math.cos(theta)
        audio[start:start+n, 1] += sample[:n] * gain * math.sin(theta)

    def tone(hz, seconds, distortion=0, decay=7):
        tt = np.arange(round(seconds * sr)) / sr
        sig = np.sin(math.tau * hz * tt) + .23 * np.sin(math.tau * hz * 2 * tt)
        if distortion:
            sig = np.tanh(sig * distortion)
        return sig * (1 - np.exp(-tt * 250)) * np.exp(-tt * decay)

    def noise(seconds, decay=9):
        tt = np.arange(round(seconds * sr)) / sr
        return rng.normal(0, .34, len(tt)) * np.exp(-tt * decay)

    def sweep(seconds, f0, f1):
        tt = np.arange(round(seconds * sr)) / sr
        freq = f0 + (f1 - f0) * tt / seconds
        return np.sin(math.tau * np.cumsum(freq) / sr) * np.sin(math.pi * tt / seconds) ** 2

    # Original 144 BPM punk sting, compact bass/guitar harmonics and drums.
    step = 60 / 144 / 2
    notes = [110, 110, 130.813, 110, 146.832, 130.813, 98, 98]
    for k, at in enumerate(np.arange(.12, 14.3, step)):
        if 10.18 < at < 11.6:  # Deliberately awkward deadpan silence after the hit.
            continue
        add(at, tone(notes[k % 8], .24, 3.2), .06, -.15)
        add(at, noise(.055, 65), .11, .3)
        if k % 2 == 0:
            add(at, sweep(.11, 150, 42), .31)
        if k % 4 == 2:
            add(at, noise(.16, 18), .3, .05)
            add(at, tone(185, .10), .09)
    # Street hum, foil crinkles, seam tear, printer feed, swoosh, strike and tiny squeak.
    add(0, tone(55, 2.1, decay=.9), .04)
    for at in [2.73, 2.87, 3.04, 3.22, 3.38]:
        add(at, noise(.1, 25), .16, -.2)
    add(3.57, noise(.45, 4), .34)
    add(3.57, sweep(.28, 1200, 180), .08)
    add(4.02, sweep(.67, 180, 940), .09)
    for at, hz in [(4.83, 440), (4.9, 554.365), (5.01, 659.255)]:
        add(at, tone(hz, .45), .07)
    for at in np.arange(6.3, 7.67, .055):
        add(at, tone(910 + ((at * 100) % 4) * 150, .045, 2, 38), .035, -.4)
        add(at, noise(.025, 120), .06)
    add(8.12, noise(1.05, 1.5), .19, .1)
    add(8.12, sweep(1.1, 95, 540), .09)
    add(9.25, sweep(.3, 180, 32), .55)
    add(9.25, noise(.38, 11), .46)
    add(10.2, noise(.09, 45), .32)
    add(11.12, sweep(.13, 1300, 450), .06, -.2)
    add(11.66, tone(146.832, .62, 2, 3), .12)
    add(12.23, sweep(.18, 95, 43), .35)
    add(14.2, tone(110, .55, 3, 8), .16)
    peak = float(np.max(np.abs(audio)))
    if peak > .89:
        audio *= .89 / peak
    # 12 ms edge fades avoid clicks; natural fade on the final sting.
    audio[:576] *= np.linspace(0, 1, 576)[:, None]
    audio[-12000:] *= np.linspace(1, 0, 12000)[:, None]
    path = WORK / 'score.wav'
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes((audio * 32767).astype('<i2').tobytes())
    return path


STILLS = [1.2, 2.9, 4.45, 5.7, 7.1, 8.7, 9.28, 10.85, 13.15]


def stills():
    tiles = []
    for i, t in enumerate(STILLS):
        frame = render(t)
        frame.save(WORK / f'shot-{i+1:02d}.jpg', quality=94)
        tile = frame.resize((640, 360), RESAMPLE)
        tiles.append(tile)
    sheet = Image.new('RGB', (1920, 1080))
    for i, tile in enumerate(tiles):
        sheet.paste(tile, ((i % 3) * 640, (i // 3) * 360))
    sheet.save(WORK / 'contact-sheet.jpg', quality=95)
    render(5.7).save(OUT / 'premiere-poster.webp', quality=88, method=5)
    for name, t in [('city', 1.2), ('pack', 2.9), ('karen', 5.7), ('special', 7.1), ('verdict', 10.85)]:
        render(t).resize((640, 360), RESAMPLE).save(OUT / f'chapter-{name}.webp', quality=84, method=5)


def main():
    global WIDTH, HEIGHT, S
    parser = argparse.ArgumentParser()
    parser.add_argument('--stills', action='store_true')
    parser.add_argument('--width', type=int, default=1920)
    args = parser.parse_args()
    if args.width not in [1280, 1920]:
        parser.error('Use --width 1280 or 1920')
    WIDTH, HEIGHT, S = args.width, args.width * 9 // 16, args.width / 1280
    OUT.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    load_assets()
    stills()
    if args.stills:
        print(json.dumps({'contactSheet': str(WORK / 'contact-sheet.jpg'), 'width': WIDTH}), flush=True)
        return
    audio = soundtrack()
    movie = OUT / 'cancel-city-premiere.mp4'
    cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y', '-f', 'rawvideo', '-pixel_format', 'rgb24',
           '-video_size', f'{WIDTH}x{HEIGHT}', '-framerate', str(FPS), '-i', 'pipe:0', '-i', str(audio),
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', str(movie)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    try:
        for i in range(round(DURATION * FPS)):
            proc.stdin.write(render(i / FPS).tobytes())
            if i % 60 == 0:
                print(f'Rendered {i}/{round(DURATION * FPS)} frames', flush=True)
        proc.stdin.close()
    except BaseException:
        proc.kill()
        proc.wait()
        raise
    if proc.wait() != 0:
        raise RuntimeError('FFmpeg encoding failed')
    print(json.dumps({'video': str(movie), 'bytes': movie.stat().st_size, 'duration': DURATION, 'fps': FPS, 'width': WIDTH, 'height': HEIGHT}), flush=True)


if __name__ == '__main__':
    main()
