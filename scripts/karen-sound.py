"""Original material-specific procedural Foley. Deterministic, stereo, no voices/music."""
import math
from pathlib import Path
import wave
import numpy as np

RATE = 24000
DEST = Path('public/assets/karen/audio')
DEST.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(26026)

def write(name, sound):
    sound = np.clip(sound, -0.88, 0.88)
    stereo = np.stack((sound, np.roll(sound, 13) * 0.93), axis=-1)
    with wave.open(str(DEST / (name + '.wav')), 'wb') as out:
        out.setnchannels(2); out.setsampwidth(2); out.setframerate(RATE)
        out.writeframes((stereo * 32767).astype('<i2').tobytes())

def time(duration): return np.arange(round(duration*RATE))/RATE
def noise(duration): return rng.normal(0, 1, round(duration*RATE))
def filtered(values, radius=10): return np.convolve(values, np.ones(radius)/radius, mode='same')

t=time(3.0)
write('room', filtered(noise(3.0), 90)*0.055*np.minimum(1,t*5)*np.minimum(1,(3-t)*3))
t=time(.16)
write('tick', filtered(noise(.16), 3)*np.exp(-t*85)*.33)
t=time(1.3)
chatter=np.maximum(0,np.sin(t*2*math.pi*23))**9
write('printer', (filtered(noise(1.3), 4)*.19+np.sin(2*math.pi*93*t)*.028)*chatter*np.minimum(1,(1.3-t)*9))
t=time(.72)
grain=noise(.72);grain=grain-filtered(grain,22)
write('paper', grain*.11*(.3+.7*np.sin(t*math.pi/.72)**2)*np.minimum(1,(.72-t)*20))
t=time(.48)
write('step', (filtered(noise(.48), 34)*.4+np.sin(2*math.pi*85*t)*.10)*(np.exp(-t*25)+.65*np.exp(-np.maximum(t-.24,0)*25)*(t>.24)))
t=time(.30)
write('snap', noise(.30)*np.exp(-t*45)*.26+np.sin(2*math.pi*190*t)*np.exp(-t*32)*.08)
t=time(.64)
write('fold', filtered(noise(.64), 5)*.23*(np.sin(t*math.pi/.64)**2)*(0.6+.4*np.sin(t*2*math.pi*11)))
t=time(.70)
write('stamp', (filtered(noise(.70), 14)*.65+np.sin(2*math.pi*62*t)*.28)*np.exp(-t*21)+noise(.70)*np.exp(-t*110)*.19)
t=time(1.65)
write('shutter', filtered(noise(1.65), 7)*.18*(.28+.72*np.maximum(0,np.sin(t*2*math.pi*14))**3)*np.minimum(1,(1.65-t)*10))
print('Authored nine original stereo material cues at 24 kHz.')
