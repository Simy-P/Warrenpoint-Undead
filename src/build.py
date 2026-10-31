import json,os
s=open('src/game.js').read();d=json.load(open('src/data.json'))
s=s.replace('__CITY_B__',d['CITY_B']).replace('__CITY_T__',d['CITY_T']).replace('__CTERRS__',d['CTERRS']).replace('__OSM__',d['OSM'])
import base64
s=s.replace('__ROCK_MP3__',base64.b64encode(open('sounds/rotor-rumble.mp3','rb').read()).decode())
out=open('src/shell.html').read()+'\n<script type="module">\n'+s+'\n</script>\n'
open('build/warrenpoint-undead.html','w').write(out);print(len(out))
