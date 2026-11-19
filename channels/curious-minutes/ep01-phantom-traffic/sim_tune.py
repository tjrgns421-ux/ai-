import math, statistics as st
L, N = 230.0, 22
def mk(VMAX,HC,W): return lambda h: VMAX/2*(math.tanh((h-HC)/W)+math.tanh(HC/W))
def run(A, V, T=300, dt=0.05, ctrl_t=None, ci=5, win=40.0, gain=0.4, kick_t=5.0):
    x=[i*L/N for i in range(N)]; v=[V(L/N)]*N; out={}
    buf=[]; t=0.0; step=0
    jam_pos=[]
    while t<T:
        h=[((x[(i+1)%N]-x[i])%L) for i in range(N)]
        acc=[A*(V(h[i])-v[i]) for i in range(N)]
        if kick_t<=t<kick_t+2.0: acc[0]=-1.5
        buf.append(st.mean(v)); buf=buf[-int(win/dt):]
        if ctrl_t is not None and t>=ctrl_t:
            vcmd=min(st.mean(buf), V(h[ci])); acc[ci]=gain*(vcmd-v[ci])
        for i in range(N):
            v[i]=max(0.0,v[i]+acc[i]*dt); x[i]=(x[i]+v[i]*dt)%L
        if step%20==0:
            k=min(range(N),key=lambda i:v[i]); jam_pos.append((t,x[k],v[k]))
        if step%int(1/dt)==0: out[round(t)]=(min(v)*3.6,max(v)*3.6,st.pstdev(v)*3.6)
        t+=dt; step+=1
    # jam backward speed: track slowest car position change when it's ~stopped (unwrap backward)
    return out, jam_pos
def jam_speed(jp):
    pts=[(t,x) for t,x,v in jp if v<1.0 and 60<t<120]
    if len(pts)<5: return None
    import math
    # unwrap backward motion
    xs=[pts[0][1]]; 
    for (t0,x0),(t1,x1) in zip(pts,pts[1:]):
        d=(x1-x0+L/2)%L-L/2; xs.append(xs[-1]+d)
    return (xs[-1]-xs[0])/(pts[-1][0]-pts[0][0])*3.6
V=mk(12.0,10.0,2.0)
for A in [1.0,2.0,3.0,4.0]:
    o,jp=run(A,V); o2,_=run(A,V,ctrl_t=120.0)
    f=lambda o:" ".join(f"{t}:{o[t][2]:.0f}" for t in (20,40,60,100,140,180,240,290))
    print(f"A={A}  jamspeed={jam_speed(jp)}  nocontrol spread {f(o)}\n        calm car  spread {f(o2)}  final min/max {o2[290][0]:.0f}/{o2[290][1]:.0f}")
