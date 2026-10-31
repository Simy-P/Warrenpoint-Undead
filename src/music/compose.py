# "Rotor Rumble": an original 50s rock'n'roll stomper for the chopper bonus round.
# 12-bar blues in G, ~182 bpm, piano / acoustic bass / distorted guitar / steel guitar / tenor sax / drums.
import mido,random
random.seed(7)
TPB=480;E8=TPB//2;BAR=TPB*4
mid=mido.MidiFile(ticks_per_beat=TPB)
def track(name,ch,prog):
  t=mido.MidiTrack();mid.tracks.append(t);t.append(mido.MetaMessage('track_name',name=name))
  if ch!=9:t.append(mido.Message('program_change',channel=ch,program=prog,time=0))
  vol,pan,rev={0:(72,40,40),1:(92,64,20),2:(66,88,30),3:(96,96,40),4:(124,64,50),5:(127,60,70),9:(122,64,30)}[ch]
  for cc,v in ((7,vol),(10,pan),(91,rev)):t.append(mido.Message('control_change',channel=ch,control=cc,value=v,time=0))
  return {'t':t,'ch':ch,'ev':[]}
meta=mido.MidiTrack();mid.tracks.append(meta);meta.append(mido.MetaMessage('set_tempo',tempo=mido.bpm2tempo(182)))
PI=track('Piano',0,1);BA=track('Bass',1,32);GT=track('Dist Gtr',2,30);ST=track('Steel Gtr',3,25);SX=track('Tenor Sax',4,66);VO=track('Voice',5,53);DR=track('Drums',9,0)
def note(tr,start,dur,n,vel):tr['ev'].append((start,1,n,vel));tr['ev'].append((start+max(1,dur),0,n,0))
G=55  # G3
PROG=[0,0,0,0,5,5,0,0,7,5,0,7]   # I I I I IV IV I I V IV I V
BOOG=[0,4,7,9,10,9,7,4]
def chord_root(bar):return G+PROG[bar%12]
# ---------- the band
def band_bar(b0,bar,mode):  # mode: 'full','stop','solo','intro'
  r=chord_root(bar);s=b0
  # drums
  if mode=='stop':
    note(DR,s,E8,36,120);note(DR,s,E8,49 if bar%4==0 else 42,100)
  else:
    for k in range(8):
      t=s+k*E8
      if k in(0,4):note(DR,t,E8,36,118)
      if k in(2,6):note(DR,t,E8,38,124 if mode!='intro' else 0)
      note(DR,t,E8//2,42 if mode!='solo' else 51,90 if k%2==0 else 70)
    if bar%12==11 or mode=='fill':
      for k,(n) in enumerate([38,38,45,45,47,47,48,48]):
        if k>=4:note(DR,s+k*E8,E8//2,n,110)
  # bass: the boogie walk
  if mode=='stop':note(BA,s,E8*2,r-12,115)
  else:
    for k in range(8):note(BA,s+k*E8,E8-20,r-12+BOOG[k],108 if k%2==0 else 92)
  # distorted guitar: the low chug (root+5 / root+6 rocking on the 8ths)
  if mode=='stop':
    for n in(r-12,r-5,r):note(GT,s,E8*2,n,110)
  elif mode!='intro':
    for k in range(8):
      top=(7 if k%4<2 else 9)
      for n in(r-12,r-12+top):note(GT,s+k*E8,E8-30,n,96 if k%2==0 else 84)
  # steel guitar: chord chanks on the backbeat
  if mode in('full','solo'):
    for k in(2,6):
      for n in(r+12,r+16,r+19):note(ST,s+k*E8,E8,n,86)
  # piano: hammered right-hand chords on every 8th, left hand octaves on the beat
  tri=[r+12,r+16,r+19,r+22]
  if mode=='stop':
    for n in tri+[r]:note(PI,s,E8*2,n,118)
  else:
    for k in range(8):
      for n in (tri if k%2==0 else tri[:3]):note(PI,s+k*E8,E8-25,n+12,104 if k%2==0 else 92)
      if k%2==0:note(PI,s+k*E8,E8*2-40,r-12,96);note(PI,s+k*E8,E8*2-40,r,90)
  if bar%12==11 and mode!='stop':  # a run up the keys into the next chorus
    for k,iv in enumerate([0,4,7,10,12,16,19,24]):note(PI,s+k*E8//2+E8*4,E8//2,r+24+iv,100)
# ---------- the tune (the "singer" is the sax), written out: (eighth in bar, length in eighths, semitones above G4)
G4=67
VERSE_A=[[(0,1,7),(1,1,7),(2,2,7),(4,1,10),(5,3,7)],      # stop-time call: short shouted phrases
         [(0,1,5),(1,1,7),(2,2,3),(4,4,0)],
         [(0,1,7),(1,1,7),(2,2,7),(4,1,10),(5,1,12),(6,2,10)],
         [(0,2,7),(2,2,5),(4,4,0)]]
VERSE_B=[[(0,2,12),(2,1,12),(3,1,10),(4,2,12),(6,2,15)],   # over the IV chord: climb
         [(0,2,12),(2,2,10),(4,4,5)],
         [(0,1,7),(1,1,7),(2,2,7),(4,1,10),(5,3,7)],
         [(0,2,5),(2,2,3),(4,2,0),(6,2,-2)],
         [(0,3,14),(3,1,12),(4,2,14),(6,2,11)],            # V: the big ask
         [(0,2,12),(2,2,9),(4,4,5)],
         [(0,1,7),(1,1,8),(2,2,7),(4,2,3),(6,2,0)],
         [(0,2,2),(2,2,5),(4,4,7)]]
HOOK=[[(0,2,19),(2,2,19),(4,1,17),(5,3,14)],               # chorus hook: high and shouted
      [(0,1,15),(1,1,14),(2,2,12),(4,4,7)],
      [(0,2,19),(2,2,19),(4,1,17),(5,1,19),(6,2,22)],
      [(0,2,19),(2,2,17),(4,4,14)],
      [(0,2,24),(2,2,24),(4,1,22),(5,3,17)],
      [(0,1,20),(1,1,19),(2,2,17),(4,4,12)],
      [(0,2,19),(2,2,19),(4,1,17),(5,3,14)],
      [(0,2,15),(2,2,14),(4,4,12)],
      [(0,2,21),(2,2,21),(4,2,19),(6,2,14)],
      [(0,2,17),(2,2,17),(4,2,15),(6,2,12)],
      [(0,1,15),(1,1,16),(2,2,19),(4,2,22),(6,2,19)],
      [(0,2,14),(2,2,12),(4,2,10),(6,2,7)]]
def lead(b0,phrase,vel=112,oct=0):
  for (e,l,iv) in phrase:note(SX,b0+e*E8,l*E8-25,G4+iv+oct,vel)
def solo_bar(b0,bar):  # honking sax solo: repeated blue notes and squeals
  r=G4+PROG[bar%12]
  pat=random.choice([[(0,1,12),(1,1,12),(2,1,12),(3,1,12),(4,2,10),(6,2,7)],[(0,2,15),(2,1,12),(3,1,10),(4,2,12),(6,2,12)],[(0,1,7),(1,1,10),(2,1,12),(3,1,15),(4,4,17)],[(0,2,12),(2,2,12),(4,2,12),(6,2,10)]])
  for (e,l,iv) in pat:note(SX,b0+e*E8,l*E8-20,r-12+iv,120)
def woo(b0):note(VO,b0,E8*3,79,110);note(VO,b0+E8*3,E8*2,76,90)
# ---------- song form
t=0
# intro: pounding piano alone for 2 bars, band crashes in with a fill for 2
for k in range(2):band_bar(t,0,'intro');t+=BAR
for k in range(2):band_bar(t,11,'full');t+=BAR
def chorus12(mode_first4,phr,start_bar=0,lead_fn=None,woo_at=False):
  global t
  for bar in range(12):
    b0=t;mode=mode_first4 if bar<4 else 'full'
    band_bar(b0,bar,mode)
    if lead_fn:lead_fn(b0,bar)
    elif phr and bar<len(phr) and phr[bar] is not None:lead(b0,phr[bar])
    if woo_at and bar==0:woo(b0)
    t+=BAR
verse1=VERSE_A+VERSE_B
chorus12('stop',verse1)           # verse 1 (stop-time call for 4 bars)
chorus12('full',HOOK,woo_at=True) # chorus
verse2=[[(e,l,iv+(2 if iv<10 else 0)) for (e,l,iv) in bar] for bar in VERSE_A]+VERSE_B
chorus12('stop',verse2)           # verse 2
chorus12('full',HOOK,woo_at=True) # chorus
chorus12('full',None,lead_fn=solo_bar,woo_at=True)  # sax solo, the band going like a train
chorus12('stop',verse1)           # last verse
chorus12('full',HOOK,woo_at=True) # chorus
chorus12('full',HOOK)             # and again
# ending: a big held chord with a drum roll, then the final hit
for k in range(16):note(DR,t+k*E8//2,E8//4,38,80+k*3)
for n in (G-12,G,G+4,G+7,G+10,G+12,G+16,G+19):note(PI,t,BAR*2-50,n,118)
note(BA,t,BAR*2,G-12,115);note(GT,t,BAR*2,G-12,112);note(GT,t,BAR*2,G-5,112);note(SX,t,BAR*2,G4+12,118);note(DR,t,BAR,49,124)
t+=BAR*2;note(DR,t,E8,36,127);note(DR,t,E8,49,127);note(PI,t,E8*2,G-12,127);note(PI,t,E8*2,G,127);note(BA,t,E8*2,G-12,127);note(GT,t,E8*2,G-12,127)
t+=BAR
# write the tracks
for tr in (PI,BA,GT,ST,SX,VO,DR):
  ev=sorted(tr['ev'],key=lambda e:(e[0],e[1]));last=0
  for (tm,on,n,v) in ev:
    tr['t'].append(mido.Message('note_on' if on else 'note_off',channel=tr['ch'],note=max(0,min(127,n)),velocity=v,time=tm-last));last=tm
mid.save('/root/wo/song/rotor-rumble.mid');print('bars',t//BAR,'secs',round(mid.length,1))
