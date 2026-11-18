"""Synthesize three quiet, loopable 30 s background beds for Blip Check (no samples, all math).

A  lofi   : warm electric-piano chords, soft kick/hat, vinyl noise, 78 bpm
B  pulse  : muted plucky arpeggio (terminal vibe), light kick, 96 bpm
C  ambient: slow evolving pad, no drums
Writes raw stems as WAV; ffmpeg does filtering/reverb afterwards.
"""
import sys, wave
import numpy as np

SR = 44100
import os
DUR = float(os.environ.get("DUR", "30"))
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a=0.01, d=0.2, s=0.6, r=0.3):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    e = np.ones(n) * s
    e[:a] = np.linspace(0, 1, a, endpoint=False)
    e[a:a + d] = np.linspace(1, s, d, endpoint=False)[: max(0, min(d, n - a))]
    if r > 0:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def add(buf, start, sig):
    i = int(start * SR)
    j = min(N, i + len(sig))
    if i < N:
        buf[i:j] += sig[: j - i]


def epiano(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * freq * 2 * t) * 1.2 * np.exp(-t * 3)
    s = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 0.9)
    s += 0.25 * np.sin(2 * np.pi * freq * 2.001 * t) * np.exp(-t * 2.5)
    return s * env_adsr(n, 0.005, 0.3, 0.7, 0.4)


def pad(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.12, 0.0, 0.11):
        f = freq * 2 ** (det / 12)
        s += np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * 0.2 * t))
        s += 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return s / 4 * env_adsr(n, dur * 0.35, 0.1, 1.0, dur * 0.35)


def pluck(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * freq * t)) * 0.4 + np.sin(2 * np.pi * freq * t)
    return s * np.exp(-t * 9)


def kick(dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat(dur=0.05):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = np.diff(np.concatenate([[0], x]))  # crude high-pass
    return x * np.exp(-t * 80) * 0.5


def snare_soft(dur=0.18):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (rng.standard_normal(n) * 0.5 + np.sin(2 * np.pi * 190 * t)) * np.exp(-t * 22)


def write(path, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    # 30 ms fades so it loops cleanly
    f = int(0.03 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    pcm = (x * 32767).astype(np.int16)
    st = np.stack([pcm, pcm], axis=1).reshape(-1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(st.tobytes())


# Chord progression: Fmaj7 - Em7 - Dm7 - Cmaj7 (soft, unresolved, "focus" mood)
PROG = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]


def lofi():
    bpm = 78
    beat = 60 / bpm
    bar = beat * 4
    mus = np.zeros(N)
    drm = np.zeros(N)
    nb = int(DUR / bar) + 1
    for b in range(nb):
        ch = PROG[b % 4]
        for k, m in enumerate(ch):
            add(mus, b * bar + k * 0.015, epiano(hz(m), bar * 1.05) * 0.22)
        add(mus, b * bar, epiano(hz(ch[0] - 12), bar) * 0.25)
        for q in range(4):
            tq = b * bar + q * beat
            if q in (0, 2):
                add(drm, tq + (0.02 if q == 2 else 0), kick() * 0.7)
            if q in (1, 3):
                add(drm, tq, snare_soft() * 0.25)
            for e in (0, 0.5):
                add(drm, tq + e * beat + (0.03 if e else 0), hat() * (0.08 if e else 0.12))
    crackle = np.zeros(N)
    pos = rng.integers(0, N, 900)
    crackle[pos] = rng.standard_normal(900) * 0.6
    noise = rng.standard_normal(N) * 0.012
    trem = 1 + 0.05 * np.sin(2 * np.pi * 0.25 * t_all)
    return mus * trem + drm + crackle * 0.05 + noise * 0.3


def pulse():
    bpm = 96
    beat = 60 / bpm
    bar = beat * 4
    mus = np.zeros(N)
    nb = int(DUR / bar) + 1
    for b in range(nb):
        ch = PROG[b % 4]
        arp = [ch[0], ch[2], ch[1] + 12, ch[3], ch[2], ch[1] + 12, ch[3], ch[2] + 12]
        for i, m in enumerate(arp):
            add(mus, b * bar + i * beat / 2, pluck(hz(m), beat * 0.6) * 0.18)
        add(mus, b * bar, pad(hz(ch[0] - 12), bar) * 0.25)
        for q in range(4):
            add(mus, b * bar + q * beat, kick(0.25) * 0.45)
            add(mus, b * bar + q * beat + beat / 2, hat() * 0.07)
    return mus + rng.standard_normal(N) * 0.004


def ambient():
    mus = np.zeros(N)
    seg = 7.5
    for b in range(int(DUR / seg) + 1):
        ch = PROG[b % 4]
        for m in ch:
            add(mus, b * seg - 1.5 if b else 0, pad(hz(m), seg + 3.0) * 0.18)
        add(mus, b * seg, pad(hz(ch[0] - 12), seg + 1.5) * 0.25)
    # sparse soft bell notes
    for k in range(12):
        m = PROG[k % 4][k % 3] + 12
        add(mus, 1.2 + k * 2.4, epiano(hz(m), 2.0) * 0.08)
    return mus


out = sys.argv[1]
write(f"{out}/A_lofi_raw.wav", lofi())
write(f"{out}/B_pulse_raw.wav", pulse())
write(f"{out}/C_ambient_raw.wav", ambient())
print("ok")
