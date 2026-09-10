import json, math, os, subprocess, wave
from pathlib import Path
import numpy as np

SR=22050
CLIP=8.0
GAP=0.25
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'audio'
OUT.mkdir(exist_ok=True)

def hit(buf,t,kind,vel=1.0):
    i=int(t*SR)
    if i<0 or i>=len(buf): return
    if kind=='k':
        dur=.22; n=min(int(dur*SR),len(buf)-i); tt=np.arange(n)/SR
        f=120*np.exp(-tt*22)+44
        phase=2*np.pi*np.cumsum(f)/SR
        sig=np.sin(phase)*np.exp(-tt*18)*.9
    elif kind in ('s','c'):
        dur=.16; n=min(int(dur*SR),len(buf)-i); tt=np.arange(n)/SR
        rng=np.random.default_rng(abs(i)+17+(1 if kind=='c' else 0))
        noise=rng.standard_normal(n); env=np.exp(-tt*25)
        sig=(noise*.42+np.sin(2*np.pi*190*tt)*np.exp(-tt*18)*.25)*env
        if kind=='c':
            sig*=0
            for off in (0,.012,.027):
                j=int(off*SR)
                if j<n:
                    m=n-j; sig[j:]+=rng.standard_normal(m)*np.exp(-np.arange(m)/SR*35)*.24
    elif kind in ('h','o'):
        dur=.07 if kind=='h' else .28; n=min(int(dur*SR),len(buf)-i); tt=np.arange(n)/SR
        rng=np.random.default_rng(abs(i)+37)
        sig=np.diff(np.r_[0,rng.standard_normal(n)])*np.exp(-tt*(55 if kind=='h' else 10))*(.18 if kind=='h' else .13)
    elif kind=='l':
        dur=.18; n=min(int(dur*SR),len(buf)-i); tt=np.arange(n)/SR
        sig=np.sin(2*np.pi*90*tt)*np.exp(-tt*18)*.5
    elif kind=='p':
        dur=.09; n=min(int(dur*SR),len(buf)-i); tt=np.arange(n)/SR
        rng=np.random.default_rng(abs(i)+43)
        sig=(np.sin(2*np.pi*650*tt)*.25+rng.standard_normal(n)*.08)*np.exp(-tt*45)
    else: return
    buf[i:i+n]+=sig*vel

def render(pattern):
    loop=float(pattern['d']); events=pattern['e']
    a=np.zeros(int(CLIP*SR),np.float32)
    reps=int(CLIP/max(loop,.1))+2
    for r in range(reps):
        off=r*loop
        for t,k,v in events:
            when=off+float(t)
            if 0<=when<CLIP-.03: hit(a,when,k,float(v))
    a=np.tanh(a*1.2)
    fade=int(.025*SR)
    a[:fade]*=np.linspace(0,1,fade); a[-fade:]*=np.linspace(1,0,fade)
    mx=max(1e-6,float(np.max(np.abs(a))))
    return a/mx*.88

def wav_write(path,a):
    pcm=(np.clip(a,-1,1)*32767).astype('<i2')
    with wave.open(str(path),'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def main():
    for sec in range(1,10):
        data=json.loads((ROOT/f'patterns/section-{sec}.json').read_text())
        ids=sorted(data,key=lambda x:int(x.split('.')[1]))
        gap=np.zeros(int(GAP*SR),np.float32)
        sprite=np.concatenate([z for i in ids for z in (render(data[i]),gap)])
        wav=OUT/f'section-{sec}.wav'; mp3=OUT/f'section-{sec}.mp3'
        wav_write(wav,sprite)
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(wav),'-ac','1','-ar',str(SR),'-b:a','96k',str(mp3)],check=True)
        wav.unlink()
        print(sec,mp3.stat().st_size)

if __name__=='__main__': main()
