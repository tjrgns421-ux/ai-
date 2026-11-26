"""mp04: share of each Korea's land lit at night, per year (our measurement).
Inputs: koreas.json (Natural Earth 10m North/South Korea geometry, exported from world-atlas) and
gf/<year>-10-<day>.png = NASA GIBS WMS GetMap, LAYERS=VIIRS_SNPP_GapFilled_BRDF_Corrected_DayNightBand_Radiance,
CRS=EPSG:4326, BBOX=33,124,43.2,131, WIDTH=1400, HEIGHT=2040, TIME=<year>-10-05/15/25.
python3 research/nk_night_lights.py <threshold 0-255, default 120>   (run inside the folder with koreas.json and gf/)
"""
import json,sys,glob,statistics as st
from PIL import Image, ImageDraw
import numpy as np
G=json.load(open('koreas.json')); W,H=1400,2040; lat0,lon0,lat1,lon1=33,124,43.2,131
def px(lon,lat): return ((lon-lon0)/(lon1-lon0)*W, (lat1-lat)/(lat1-lat0)*H)
M={}
for n,g in G.items():
  m=Image.new('L',(W,H),0); d=ImageDraw.Draw(m)
  for p in (g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]):
    d.polygon([px(*c) for c in p[0]],fill=255)
  M[n]=np.array(m)>0
# Pyongyang box ~ 39.02N 125.75E, +-0.25 deg
x0,y0=px(125.5,39.27); x1,y1=px(126.0,38.77)
PY=np.zeros((H,W),bool); PY[int(y0):int(y1),int(x0):int(x1)]=True
TH=int(sys.argv[1]) if len(sys.argv)>1 else 120
for y in range(2012,2027):
  r={'nk':[],'sk':[],'py':[]}
  for f in sorted(glob.glob(f'gf/{y}-10-*.png')):
    try: a=np.array(Image.open(f).convert("L")).astype(int)
    except Exception: print("bad",f); continue
    lit=a>=TH
    r['nk'].append(100*lit[M['North Korea']].mean()); r['sk'].append(100*lit[M['South Korea']].mean())
    r['py'].append(lit[PY & M['North Korea']].sum()/max(1,lit[M['North Korea']].sum())*100)
  print(y, 'NK lit%', round(st.median(r['nk']),2), 'SK lit%', round(st.median(r['sk']),2), 'Pyongyang share of NK lit', round(st.median(r['py']),1), [round(v,2) for v in r['nk']])
