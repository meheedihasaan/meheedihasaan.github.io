// content comes from the page (written at build time); sections are already in the HTML
const C=JSON.parse(document.getElementById('space-data').textContent),$=id=>document.getElementById(id);
const ids=[...document.querySelectorAll('#pf .pf-section')].map(s=>s.id);

// headings rise word by word; items in a section appear one after another
document.querySelectorAll('.pf-head h2').forEach(h=>{h.innerHTML=h.textContent.split(' ').map((wd,i)=>`<span class="w" style="transition-delay:${i*70}ms">${wd}</span>`).join(' ')});
document.querySelectorAll('.pf-section').forEach(sec=>sec.querySelectorAll(':is(.pf-card,.pf-stat,.pf-rows>div,.pf-tl>div,.pf-skills>div,.pf-contact a,.pf-post)').forEach((el,i)=>el.style.transitionDelay=(200+Math.min(i,10)*70)+'ms'));

// ---------- research interests: the camera turns back to Earth; one panel changes with the globe ----------
const DAY_SUN=[-.72,.3,.62],FRONT_SUN=[-.42,.28,.86],NIGHT_SUN=[.7,.2,-.68];
// layers: 0 none, 1 vegetation index, 2 ice & snow, 3 land cover, 4 night lights
const INTEREST_VIEWS=[
  {lon:12,lat:44,r:.46,x:.7,y:.5,sun:NIGHT_SUN,layer:4,region:'Europe at night'},
  {lon:89,lat:24,r:.6,x:.72,y:.52,sun:DAY_SUN,layer:1,region:'Bengal delta'},
  {lon:-42,lat:68,r:.5,x:.72,y:.5,sun:[-.4,.6,.7],layer:2,region:'Greenland & Arctic'},
  {lon:-62,lat:-6,r:.56,x:.72,y:.5,sun:DAY_SUN,layer:3,region:'Amazon basin'}
];
const LEGENDS={
  1:`<h4>Vegetation index · Bengal delta</h4><div class="bar" style="background:linear-gradient(90deg,#735233,#d9c759,#59b340,#0d611f)"></div><div class="ends"><span>bare soil</span><span>dense crops & forest</span></div>`,
  2:`<h4>Ice & snow · Greenland and Arctic</h4><div class="sw"><span><i style="background:#8cd9ff"></i>ice / snow</span><span><i style="background:#0b1424"></i>open water</span><span><i style="background:#141c20"></i>bare land</span></div>`,
  3:`<h4>Land cover · Amazon basin</h4><div class="sw"><span><i style="background:#146b2e"></i>forest</span><span><i style="background:#8cbf4d"></i>grass & crops</span><span><i style="background:#bf9961"></i>bare / desert</span><span><i style="background:#0d3373"></i>water</span><span><i style="background:#ebf2ff"></i>ice</span></div>`,
  4:`<h4>Night lights · Europe</h4><div class="sw"><span><i style="background:#ffb24d"></i>city lights: where electricity is used</span></div>`
};
const LEGEND_NOTE='<p>Derived from NASA Blue Marble imagery. For illustration, not analysis.</p>';
let storyK=-1;
function setStory(k){
  if(k===storyK)return;const st=$('story'),firstTime=storyK<0;storyK=k;
  const apply=()=>{const it=C.interests[k],vw=INTEREST_VIEWS[k];
    $('stN').textContent=String(k+1).padStart(2,'0');$('stR').textContent=vw.region;$('stT').textContent=it.title;$('stD').textContent=it.text;
    $('stG').innerHTML=it.tags.map(t=>`<span>#${t}</span>`).join('');$('stL').innerHTML=LEGENDS[vw.layer]+LEGEND_NOTE;
    st.querySelectorAll('.st-steps i').forEach((e,i)=>e.className=i<k?'done':i===k?'on':'');st.classList.remove('fading')};
  if(firstTime)apply();else{st.classList.add('fading');setTimeout(apply,250)}
}
setStory(0);

// ---------- scroll position as a continuous section index (-1 = hero) ----------
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
// section positions are measured once (and on resize), so a frame never forces a layout
let secBox=[];
const measureSections=()=>{secBox=ids.map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {top:r.top+scrollY,h:r.height}})};
addEventListener('load',measureSections);addEventListener('resize',measureSections);measureSections();
// ?at=9.3 pins the journey to a position (handy for screenshots)
const PIN=parseFloat(new URLSearchParams(location.search).get('at'));
function scrollIndex(){
  if(!isNaN(PIN))return PIN;
  const vh=document.getElementById('fg').clientHeight||innerHeight;   // stable on phones (100lvh), unlike innerHeight
  const mid=vh*.5;let idx=-1+Math.min(1,scrollY/vh);
  secBox.forEach((b,i)=>{const top=b.top-scrollY;if(top<mid)idx=i+Math.min(1,(mid-top)/b.h)-.5});
  return idx;
}
let mouse={x:0,y:0};
// where Earth is: big in the hero, a pale blue dot on the journey, turned to for the research layers, home at contact
function targetView(idx){
  const si=Math.max(0,Math.min(ids.length-1,Math.floor(idx+.5))),f=Math.max(0,Math.min(1,idx+.5-si)),id=idx<-.5?'hero':ids[si];
  if(id==='hero')return {id,f,lon:18,lat:14,r:.66,x:.8,y:.66,mx:.5,my:.17,mk:.62,sun:DAY_SUN,layer:0};
  if(id==='interests'){const k=Math.min(3,Math.floor(f*4));return {id,f,k,mx:.5,my:.22,...INTEREST_VIEWS[k]}}
  if(id==='contact')return {id,f,lon:90.4,lat:23.8,r:.28,x:.72,y:.52,mx:.5,my:.26,sun:FRONT_SUN,layer:0,sats:'contact'};
  return {id,f,lon:18,lat:14,r:.008,x:.86,y:.18,mx:.82,my:.12,sun:FRONT_SUN,layer:0};
}

// ---------- trajectory bar ----------
const traj=$('traj');
ids.forEach((id,i)=>{const b=document.createElement('button');b.style.left=(i/(ids.length-1)*100)+'%';b.innerHTML=`<span>${id}</span>`;b.setAttribute('aria-label','Go to '+id);b.onclick=()=>document.getElementById(id).scrollIntoView({behavior:'smooth'});b.dataset.id=id;traj.appendChild(b)});

// ---------- Earth + galaxy (WebGL) ----------
const sky=$('sky'),gl=sky.getContext('webgl');
const FALLBACK='radial-gradient(circle at 78% 62%,#1d3d6b 0%,#0b1630 30%,#020308 70%)';
if(!gl)sky.style.background=FALLBACK;
sky.addEventListener('webglcontextlost',e=>{e.preventDefault();sky.style.opacity=0;document.body.style.background=FALLBACK});
const DPR=Math.min(devicePixelRatio||1,1.5);let U,glScale=DPR,maxScale=DPR,texReady=false,dirty=true;
function initGL(){
  const deriv=gl.getExtension('OES_standard_derivatives'),aniso=gl.getExtension('EXT_texture_filter_anisotropic');
  const fs=(deriv?'#extension GL_OES_standard_derivatives : enable\n#define SEAMLESS 1\n':'')+`precision highp float;
  uniform vec2 R;uniform float T;uniform vec2 E;uniform float ER;uniform vec2 ROT;uniform vec3 SUN;uniform float LAYER,PREV,SWEEP,READY;uniform vec2 STAR;uniform float LIGHT;uniform vec3 WH;uniform float WA,WT,WP;
  uniform sampler2D DAY,OCEAN,CLOUD,LIGHTS;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n2(p);p*=2.03;a*=.5;}return v;}
  vec3 starLayer(vec2 q,float scale,float th,float br){
    vec2 g=q*scale,id=floor(g),f=fract(g)-.5;float s=h(id);if(s<th)return vec3(0.);
    float d=length(f-(vec2(h(id+3.),h(id+7.))-.5)*.7),tp=h(id+11.);
    vec3 tint=tp<.3?vec3(.68,.8,1.):tp>.85?vec3(1.,.8,.6):vec3(1.,.97,.92);
    return tint*(1.-smoothstep(0.,.1,d))*br*(s-th)/(1.-th)*(.7+.3*sin(T*(1.+3.*h(id+5.))+s*90.));
  }
  // the galaxy you fly through: faint nebula band, dust lanes, stars in three depths, a few with spikes
  vec3 sky(vec2 q){
    vec2 p=q+STAR,pn=p*1.5;
    float neb=fbm(pn*1.3+vec2(0.,T*.006)),neb2=fbm(pn*2.6-vec2(T*.005,0.)+5.);
    float band=exp(-pow((pn.y-pn.x*.32+.15)*2.,2.));
    vec3 col=vec3(.001,.0012,.003)+vec3(.05,.07,.15)*neb*.12;
    col+=band*(vec3(.20,.13,.32)*neb*neb*.45+vec3(.42,.22,.09)*pow(neb2,3.)*.35);
    col*=1.-band*.6*smoothstep(.55,.75,n2(pn*4.+9.)*.6+neb2*.4);   // dust lanes, reusing the noise above
    col+=starLayer(p,260.,.992,1.1)*(1.+band*2.5)+starLayer(p,120.,.988,1.9)+starLayer(p,45.,.994,4.);
    vec2 g=p*16.,id=floor(g),f=fract(g)-.5;float s=h(id+21.);
    if(s>.988){vec2 d=f-(vec2(h(id+2.),h(id+9.))-.5)*.5;
      float sp=exp(-abs(d.x)*110.)*exp(-abs(d.y)*10.)+exp(-abs(d.y)*110.)*exp(-abs(d.x)*10.);
      col+=vec3(.9,.95,1.)*(sp*.6+(1.-smoothstep(0.,.025,length(d)))*3.)*(s-.988)*70.;}
    return col;
  }
  vec3 farSide(vec2 p){
    // the other end: deep blue-black space, crisp dense stars, a faint nebula and a small spiral galaxy
    vec3 c=vec3(.006,.012,.03)+vec3(.04,.08,.2)*pow(n2(p*1.6+4.),3.)*.9+vec3(.12,.06,.18)*pow(n2(p*2.3+11.),4.)*.6;
    c+=starLayer(p,240.,.975,1.8)+starLayer(p+7.,110.,.986,3.)+starLayer(p+3.,48.,.992,5.);
    vec2 g=p-vec2(-.28,-.42);g=vec2(g.x*.9+g.y*.45,-g.x*.45+g.y*.9);g.y/=.4;float gr=length(g),ga=atan(g.y,g.x);
    c+=vec3(.75,.8,1.)*exp(-gr*9.)*(.35+.65*pow(.5+.5*cos(2.*(ga-log(gr+.01)*2.6)),3.))*.9+vec3(1.,.9,.75)*exp(-gr*40.)*1.2;
    return c;
  }
  vec3 vegPal(float v){vec3 a=vec3(.45,.32,.2),b=vec3(.85,.78,.35),c=vec3(.35,.7,.25),d=vec3(.05,.38,.12);
    return v<.33?mix(a,b,v/.33):v<.66?mix(b,c,(v-.33)/.33):mix(c,d,(v-.66)/.34);}
  // one data layer, computed from the imagery: 1 vegetation, 2 ice & snow, 3 land cover, 4 night lights, 0 plain
  vec3 layerCol(float id,vec3 c,vec3 srgb,float ocean,float lights,float dayAmt,float sh,float vari,float lo2,float hi2,float sat,float iceM){
    float land=1.-ocean;
    if(id>.5&&id<1.5){vec3 lc=mix(vegPal(clamp(vari*2.2+.35,0.,1.)),vec3(.85),iceM);return mix(vec3(.01,.03,.07),pow(lc,vec3(2.2))*1.2,land)*sh;}
    if(id>1.5&&id<2.5)return mix(mix(vec3(.02,.04,.09),vec3(.05,.07,.08),land),vec3(.55,.85,1.)*1.1,iceM)*sh;
    if(id>2.5&&id<3.5){vec3 cls=vec3(.75,.6,.38);
      if(vari>.02)cls=vec3(.55,.75,.3);
      if(vari>.02&&hi2<.32)cls=vec3(.08,.42,.18);
      if(lo2>.55&&sat<.2)cls=vec3(.92,.95,1.);
      return pow(mix(cls,vec3(.05,.2,.45),ocean),vec3(2.2))*1.1*sh;}
    if(id>3.5)return c+vec3(1.,.7,.35)*lights*(1.-dayAmt)*1.2;
    return c;
  }
  void main(){
    vec2 q=(gl_FragCoord.xy-.5*R)/R.y;
    // wormhole: starlight bends around the mouth (lensing); inside is another part of space
    vec2 wp=(gl_FragCoord.xy-WH.xy)/max(WH.z,1.);float wr=length(wp),wz=WH.z/R.y;
    vec2 wc=(WH.xy-.5*R)/R.y,rel=q-wc;
    float drag=WA*min(1.4,.5/max(wr*wr,1.))*step(1.,wr);                   // frame dragging: space swirls near the mouth
    float cd=cos(drag),sd=sin(drag);rel=vec2(cd*rel.x-sd*rel.y,sd*rel.x+cd*rel.y);
    vec2 qs=wc+rel-normalize(wp+1e-5)*WA*wz*wz*2.2/max(wr*wz,1e-3)*step(1.,wr);
    vec3 col=sky(qs)*(1.-LIGHT);float haloA=0.;
    vec2 p=(gl_FragCoord.xy-E)/ER;float r=length(p);
    vec3 L=normalize(SUN);
    {float hgt=max(r-1.,0.);vec2 pd=p/max(r,1e-4);   // glow under the edge too, so the rim blends into glow, not black
      float sun=max(clamp(dot(pd,normalize(L.xy+1e-4))*.6+.4,0.,1.)*clamp(L.z+.7,.15,1.),.38);
      haloA=(exp(-hgt*ER/R.y*70.)*.95+exp(-hgt*3.)*.09)*sun;col+=vec3(.3,.56,1.)*haloA*(1.-LIGHT);}
    col=1.-exp(-col*1.7);
    vec3 paper=mix(vec3(.965,.972,.98),vec3(.9,.915,.94),clamp(length(q)*.7,0.,1.));
    col=mix(col,mix(paper,vec3(.42,.62,.95),clamp(haloA*.55,0.,.75)),LIGHT);     // light theme: paper, pale blue halo
    if(WA>0.){
      if(wr<1.){
        // a lensing sphere: the centre shows the far side, the rim wraps our own sky, squeezed and mirrored
        vec2 inn=wp*(1.+2.2*pow(wr,4.));
        vec3 far=farSide(inn);
        float sdist=length(inn-vec2(-.4,.34));far+=vec3(1.,.9,.72)*(exp(-sdist*22.)*3.+exp(-sdist*6.)*.35+exp(-sdist*1.8)*.06);   // the Sun: a sharp core, a soft halo
        vec2 ep=(inn-vec2(.28,-.2))/.2;float er=length(ep);                    // Earth, where the tunnel leads
        if(er<1.){vec3 en=vec3(ep,sqrt(1.-er*er));float elon=atan(en.x,en.z)+T*.08+1.6,elat=asin(clamp(en.y,-1.,1.));
          vec3 eday=pow(texture2D(DAY,vec2(fract(elon/6.2831853+.5),.5-elat/3.1415927)).rgb,vec3(2.2));
          vec3 ec=eday*max(dot(en,normalize(vec3(-.6,.45,.65))),0.)*2.+vec3(.25,.45,1.)*pow(1.-en.z,2.5)*.7;
          far=mix(far,ec*READY+far*(1.-READY),1.-smoothstep(.93,1.,er));}
        far+=vec3(.3,.5,1.)*exp(-max(er-1.,0.)*7.)*.35*step(1.,er);             // Earth's atmosphere glow
        float rim=smoothstep(.6,.97,wr);
        vec3 near=sky(wc-wp*wz*(2.6*(1.-wr)+.15))*1.5;                        // our sky, flipped through the sphere
        vec3 inside=mix(far,near,rim*.8);
        col=mix(col,1.-exp(-inside*1.6),WA);}
      col+=vec3(.9,.95,1.)*exp(-pow((wr-1.)*45.,2.))*.75*WA;                 // thin bright rim
      col+=vec3(.55,.7,1.)*exp(-pow((wr-1.04)*30.,2.))*.25*WA;
      col+=vec3(.5,.65,1.)*exp(-pow((wr-1.09)*22.,2.))*.35*WA;             // a fainter second ring outside it
      col+=vec3(.15,.3,.75)*exp(-max(wr-1.,0.)*4.)*.08*WA*step(1.,wr);
    }
    if(r<1.){
      vec3 n=vec3(p,sqrt(1.-r*r));
      float lo=ROT.x,la=ROT.y;
      vec3 m=vec3(n.x,n.y*cos(la)+n.z*sin(la),-n.y*sin(la)+n.z*cos(la));
      vec3 wv=vec3(m.x*cos(lo)+m.z*sin(lo),m.y,-m.x*sin(lo)+m.z*cos(lo));
      float lon=atan(wv.x,wv.z),lat=asin(clamp(wv.y,-1.,1.));
      float ux=lon/6.2831853+.5;
#ifdef SEAMLESS
      float u1=fract(ux),u2=fract(ux+.5)-.5;vec2 uv=vec2(fwidth(u1)<fwidth(u2)+1e-6?u1:u2,.5-lat/3.1415927);   // no seam at the date line
#else
      vec2 uv=vec2(fract(ux),.5-lat/3.1415927);
#endif
      vec3 srgb=texture2D(DAY,uv).rgb,day=pow(srgb,vec3(2.2)),dat=vec3(texture2D(OCEAN,uv).r,0.,texture2D(LIGHTS,uv).r);
      float cloud=texture2D(CLOUD,vec2(uv.x+T*.0008,uv.y)).r;
      float ocean=smoothstep(.3,.6,dat.r);
      float NdL=dot(n,L),lit=max(NdL,0.),dayAmt=smoothstep(-.1,.18,NdL);
      float isNew=step(.5,LAYER)*step(LAYER,3.5),isOld=step(.5,PREV)*step(PREV,3.5);
      float u=p.x*.5+.5,rev=1.-smoothstep(SWEEP-.06,SWEEP,u);      // new layer revealed behind a scan line moving left to right
      float dataOn=mix(isOld,isNew,rev);
      float e=1./2048.,h0=dot(srgb,vec3(.333)),hx=dot(texture2D(DAY,uv+vec2(e,0.)).rgb,vec3(.333)),hy=dot(texture2D(DAY,uv+vec2(0.,e)).rgb,vec3(.333));
      float relief=mix(1.,clamp(1.+((h0-hx)*L.x-(h0-hy)*L.y)*7.,.75,1.25),1.-ocean);
      float cshadow=smoothstep(.2,.8,texture2D(CLOUD,vec2(uv.x+T*.0008+L.x*.004,uv.y-L.y*.004)).r);
      vec3 c=day*lit*1.7*relief*(1.-.35*cshadow*(1.-dataOn));
      float cl=smoothstep(.12,.85,cloud)*(1.-dataOn*.9);
      c=mix(c,vec3(.95,.97,1.)*lit*1.35,cl*.88);
      float lights=smoothstep(.14,.7,dat.b);
      c+=vec3(1.,.66,.3)*lights*(1.-dayAmt)*(1.-cl*.85)*1.3;
      float lo2=min(srgb.r,min(srgb.g,srgb.b)),hi2=max(srgb.r,max(srgb.g,srgb.b)),sat=hi2-lo2;
      float vari=(srgb.g-srgb.r)/(srgb.g+srgb.r-srgb.b+.001);
      float iceM=smoothstep(.45,.7,lo2)*(1.-smoothstep(.12,.3,sat));
      float sh=lit*.85+.15;
      c=mix(layerCol(PREV,c,srgb,ocean,lights,dayAmt,sh,vari,lo2,hi2,sat,iceM),layerCol(LAYER,c,srgb,ocean,lights,dayAmt,sh,vari,lo2,hi2,sat,iceM),rev);
      float latD=lat*57.29578,lonD=lon*57.29578;                     // graticule during data layers
      float g1=1.-smoothstep(0.,.3,abs(fract(latD/15.+.5)-.5)*15.);
      float g2=1.-smoothstep(0.,.3/max(cos(lat),.25),abs(fract(lonD/15.+.5)-.5)*15.);
      c+=vec3(1.,.76,.48)*max(g1,g2)*dataOn*.14*(.4+.6*sh);
      c+=vec3(1.,.76,.48)*exp(-abs(u-SWEEP)*110.)*step(.01,SWEEP)*step(SWEEP,1.08)*max(isNew,isOld)*1.6;   // scan line
      float fres=pow(1.-n.z,2.6);
      c=mix(c,vec3(.3,.55,1.)*(.32+.6*clamp(NdL+.45,0.,1.)),fres*.72);   // atmosphere rim, never black
      c+=vec3(1.,.45,.18)*pow(1.-n.z,6.)*exp(-NdL*NdL/.006)*.35;         // twilight at the limb
      c+=day*.03*(1.-dayAmt)+vec3(.22,.4,.85)*pow(1.-n.z,3.5)*.22*(1.-dayAmt);   // earthshine, night-side rim
      c=1.-exp(-c*1.25);c=pow(c,vec3(1./2.2));
      col=mix(col,c,(1.-smoothstep(1.-1.5/ER,1.,r))*READY);
    }
    // transit: a rushing tunnel of light, flashing white at the peak
    if(WT>0.){
      float a=atan(q.y,q.x)+WP*2.2+T*.15,rr=max(length(q),.001);
      float z=.2/rr+T*2.5+WP*9.;                                             // depth along the tube
      vec2 cs=vec2(cos(a),sin(a));
      float neb=n2(cs*2.4+vec2(z*.55,0.))*.65+n2(cs*6.+vec2(z*1.6,3.))*.35;
      float st=pow(n2(cs*30.+vec2(z*5.,7.)),14.)*5.;                          // stars stretched along the walls
      vec3 tint=WP<.5?mix(vec3(.25,.42,1.),vec3(.68,.36,1.),WP*2.):mix(vec3(.68,.36,1.),vec3(1.,.72,.36),WP*2.-1.);
      float hole=mix(.03,.5,WP);                                             // the exit opens as you travel
      vec3 tun=tint*(neb*neb*.95+st)*(.2+.55*smoothstep(0.,.9,rr))+tint*exp(-pow((rr-hole*1.25)*9.,2.))*.75;
      tun=1.-exp(-tun*1.25);                                                  // deeper walls keep the page text readable
      col=mix(col,tun,WT*smoothstep(hole,hole*1.25+.015,rr));                // Earth shows through the exit
      col+=vec3(.9,.95,1.)*pow(WT,10.)*.25*(1.-WP);}
    col*=1.-.4*dot(q,q)*(1.-LIGHT);
    gl_FragColor=vec4(col,1.);
  }`;
  const mk=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.warn(gl.getShaderInfoLog(o));return o};
  const pr=gl.createProgram();gl.attachShader(pr,mk(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));gl.attachShader(pr,mk(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  U={};for(const k of ['R','T','E','ER','ROT','SUN','LAYER','PREV','SWEEP','READY','STAR','LIGHT','WH','WA','WT','WP','DAY','OCEAN','CLOUD','LIGHTS'])U[k]=gl.getUniformLocation(pr,k);
  gl.uniform1i(U.DAY,0);gl.uniform1i(U.OCEAN,1);gl.uniform1i(U.CLOUD,2);gl.uniform1i(U.LIGHTS,3);
  // imagery (~300 KB of WebP) loads after the text has rendered
  const texObj={},mip=!!deriv;
  const upload=(unit,img)=>{const tx=texObj[unit]||(texObj[unit]=gl.createTexture());gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tx);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    if(mip){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);if(aniso)gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))}
    else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);dirty=true};
  const load=(k,unit)=>new Promise(res=>{const img=new Image();img.decoding='async';img.onload=()=>{upload(unit,img);res()};img.onerror=res;img.src=`/earth/${k}.webp`});
  // 2K imagery first (~300 KB); on large screens the 4K day map and night lights replace it a moment later
  const loadTex=()=>Promise.all([['day-2k',0],['ocean',1],['clouds',2],['lights-2k',3]].map(([k,u])=>load(k,u))).then(()=>{texReady=true;dirty=true;sky.classList.add('ready');
    if(Math.max(innerWidth,innerHeight)*DPR>1300)setTimeout(()=>{load('day',0);load('lights',3)},400)});
  loadTex();sizeSky();dirty=true;
}
if(gl){const later=()=>window.requestIdleCallback?requestIdleCallback(initGL,{timeout:1500}):setTimeout(initGL,200);
  document.readyState==='complete'?later():addEventListener('load',later)}
function sizeSky(){if(!gl)return;sky.width=Math.round(w*glScale);sky.height=Math.round(hgt*glScale);gl.viewport(0,0,sky.width,sky.height)}

// ---------- 2D layer: stars flying past, star systems with labelled planets, satellites at home ----------
const fg=$('fg'),ctx=fg.getContext('2d');let w,hgt;
document.fonts?.ready.then(()=>{dirty=true});   // redraw labels once the web fonts arrive
const pfEl=$('pf');let pfRight=0;
// size from the canvas box (100lvh): on phones it stays put while the address bar slides, so the scene doesn't jump
function size(){const d=devicePixelRatio||1,nw=fg.clientWidth||innerWidth,nh=fg.clientHeight||innerHeight;
  if(nw===w&&nh===hgt&&fg.width===Math.floor(w*d))return;w=nw;hgt=nh;fg.width=w*d;fg.height=hgt*d;ctx.setTransform(d,0,0,d,0,0);sizeSky();pfRight=pfEl.getBoundingClientRect().right;dirty=true}
const GAP=1600,F=640,rnd=(a,b)=>a+Math.random()*(b-a);
const short=t=>t.length>30?t.slice(0,29)+'…':t;
const NOTES={
  news:C.news.map(([d,t])=>({v:d,k:short(t.replace(/\.$/,''))})),
  about:C.stats.map(x=>({v:x.text||(x.n+x.suffix).toUpperCase(),k:x.label})),
  publications:C.pubs.map(p=>({v:p.venue+' '+p.y,k:p.type})),
  research:C.research.map(r=>({v:short(r.title),k:r.status})),
  writing:(C.writing||[]).map(p=>({v:short(p.title),k:p.date.slice(0,7)})),
  work:C.work.map(x=>({v:x.title,k:x.when.split(' · ')[0]})),
  experience:C.experience.map(e=>({v:e.title,k:e.when})),
  skills:C.skills.map(([k,v])=>({v:v.join(' · '),k,wrap:true})),
  awards:C.awards.map(([p,t])=>({v:p,k:short(t)})),
  contact:[{v:C.links.email,k:'email'},{v:'GitHub',k:'meheedihasaan'},{v:'LinkedIn',k:'meheedihasaan'},{v:'Google Scholar',k:'publications'}]
};
// a label: value (wrapped into lines when it.wrap) over a small key; ey is the first line's baseline
function lines(it,vs){
  if(!it.wrap)return [it.v];
  if(it._lines&&it._lvs===vs)return it._lines;
  ctx.font=`600 ${vs}px 'Space Grotesk Variable',system-ui,sans-serif`;const max=vs*17,out=[];let cur='';
  for(const word of it.v.split(' · ')){const t=cur?cur+' · '+word:word;if(cur&&ctx.measureText(t).width>max){out.push(cur);cur=word}else cur=t}
  if(cur)out.push(cur);it._lvs=vs;return it._lines=out;
}
const labelH=(it,vs)=>lines(it,vs).length*(vs+5)+15;
function label(it,lx,ey,al,vs){
  const ls=lines(it,vs),lh=vs+5;
  ctx.font=`600 ${vs}px 'Space Grotesk Variable',system-ui,sans-serif`;const vw=Math.max(...ls.map(l=>ctx.measureText(l).width));
  ctx.font=`10px 'JetBrains Mono Variable',ui-monospace,monospace`;const kw=ctx.measureText(it.k.toUpperCase()).width+it.k.length*1.5;
  const tw=Math.max(vw,kw),ky=ey+(ls.length-1)*lh;return {tw,draw:x=>{
    ctx.shadowBlur=0;ctx.fillStyle=`rgba(${TH.bg},${TH.bga*al})`;ctx.beginPath();(ctx.roundRect?ctx.roundRect(x-6,ey-vs+1,tw+12,ky-ey+vs+20,6):ctx.rect(x-6,ey-vs+1,tw+12,ky-ey+vs+20));ctx.fill();ctx.shadowBlur=8;
    ctx.textAlign='left';ctx.fillStyle=`rgba(${TH.text},${al})`;ctx.font=`600 ${vs}px 'Space Grotesk Variable',system-ui,sans-serif`;ls.forEach((l,i)=>ctx.fillText(l,x,ey+3+i*lh));
    ctx.fillStyle=`rgba(${TH.acc},${.9*al})`;ctx.font=`10px 'JetBrains Mono Variable',ui-monospace,monospace`;
    if('letterSpacing' in ctx)ctx.letterSpacing='1.5px';ctx.fillText(it.k.toUpperCase(),x,ky+17);if('letterSpacing' in ctx)ctx.letterSpacing='0px';}};
}
// labels in two columns beside a body; each anchor's label goes to the side it is on, sorted so lines don't cross;
// the leader always ends at its label, wherever the label had to move
function columnCallouts(list,c,rr,a,p,anchors,visible){
  if(a<.02||!list||w<760)return;   // on phones the text column is full width; labels would sit on the text
  const n=Math.min(list.length,anchors.length),gap=w<760?44:48,colOff=rr+34,vs=w<760?12:15;
  const sides={l:[],r:[]};
  for(let j=0;j<n;j++){const an=anchors[j];if(!an)continue;const it=list[j],dx=an.x-c.x;if(!it._side||Math.abs(dx)>rr*.25)it._side=dx<0?'l':'r';sides[it._side].push(j)}
  ctx.save();ctx.shadowColor=TH.shadow;ctx.shadowBlur=8;ctx.lineWidth=1;
  for(const side of ['l','r']){
    const js=sides[side].sort((x,y)=>anchors[x].y-anchors[y].y),m=js.length,dir=side==='l'?-1:1,colX=c.x+dir*colOff;
    const hs=js.map(j=>Math.max(gap,labelH(list[j],vs)+12)),tot=hs.reduce((x,y)=>x+y,0);let acc=c.y-tot/2;
    const tys=hs.map(h=>{const t=acc+gap/2;acc+=h;return t});
    js.forEach((j,k)=>{
      const it=list[j],an=anchors[j],ty=tys[k];
      if(it._y==null){it._y=ty;it._x=colX}it._y+=(ty-it._y)*.12;it._x+=(colX-it._x)*.12;
      const kk=Math.max(0,Math.min(1,(p-j*.08)/.25)),al=a*kk*(visible&&visible[j]===false?.3:1);if(al<=0)return;
      const ey=it._y,L=label(it,0,ey,al,vs),minX=w>=760?pfRight+16:8;
      let lx=side==='l'?it._x-6-L.tw:it._x+6;lx=Math.max(minX,Math.min(w-12-L.tw,lx));
      const ex=side==='l'?lx+L.tw+8:lx-8,mx=ex-dir*14,l1=Math.min(1,kk*2);
      ctx.strokeStyle=`rgba(${TH.ink},${.32*al})`;ctx.beginPath();ctx.moveTo(an.x,an.y);ctx.lineTo(an.x+(mx-an.x)*l1,an.y+(ey-an.y)*l1);if(l1>=1)ctx.lineTo(ex,ey);ctx.stroke();
      if(!an.sat){ctx.strokeStyle=`rgba(${TH.ink},${.4*al})`;ctx.beginPath();ctx.arc(an.x,an.y,7,0,7);ctx.stroke()}
      if(kk<.5)return;L.draw(lx);
    });
  }
  ctx.restore();
}
// one star system per engineering section: glowing star, tilted orbits, one planet per item
const SYS_HUES=[38,200,280,20,170,45,330,210,55,15,190];
const systems=ids.filter(id=>id!=='contact'&&id!=='interests').map(id=>{
  const i=ids.indexOf(id),items=(NOTES[id]||[]).slice(0,innerWidth<760?4:6),orbits=[0,1,2].map(o=>({r:78+o*48,pl:[]}));
  items.forEach((it,j)=>orbits[j%3].pl.push({a:j*2.39+rnd(0,.4),size:rnd(4.5,7.5),hue:rnd(-40,40),j}));
  return {id,x:(i%2?-1:1)*rnd(20,80),y:rnd(-40,40),z:(i+1)*GAP,hue:SYS_HUES[i%SYS_HUES.length],tilt:rnd(1.12,1.24),spin:rnd(.05,.08)*(i%2?-1:1),orbits:orbits.filter(o=>o.pl.length)};
}).filter(S=>S.orbits.length);
const stars=Array.from({length:700},()=>({x:rnd(-2600,2600),y:rnd(-1600,1600),z:rnd(-1000,(ids.length+2)*GAP),b:rnd(.4,1)}));
// satellites around Earth at contact: three 3D orbits, the globe hides the far side
const RINGS=[{r:1.22,i:1.36,o:-.2,sp:.07},{r:1.4,i:1.12,o:.62,sp:-.05},{r:1.58,i:1.46,o:.05,sp:.035}];
const satPhase=NOTES.contact.map((_,j)=>j/NOTES.contact.length*Math.PI*2+.4);
function satellites(list,gx,gy,R,a,p,t){
  if(a<.02)return;
  const P=(rg,th)=>{const X=Math.cos(th)*rg.r*R,Z0=Math.sin(th)*rg.r*R,Y=-Z0*Math.sin(rg.i),Z=Z0*Math.cos(rg.i);
    const x=X*Math.cos(rg.o)-Y*Math.sin(rg.o),y=X*Math.sin(rg.o)+Y*Math.cos(rg.o);
    return {x:gx+x,y:gy-y,hid:Z<0&&Math.hypot(x,y)<R,sat:true}};
  ctx.save();ctx.lineWidth=1;
  for(const rg of RINGS){ctx.strokeStyle=`rgba(${TH.orbit},${.13*a})`;ctx.beginPath();let on=false;
    for(let k=0;k<=160;k++){const q=P(rg,k/160*Math.PI*2);if(q.hid){on=false;continue}on?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);on=true}ctx.stroke()}
  const anchors=[],vis=[];
  list.forEach((_,j)=>{const rg=RINGS[j%3],th=satPhase[j]+t*rg.sp,q=P(rg,th);
    for(let k=0;k<14;k++){const q0=P(rg,th-Math.sign(rg.sp)*k*.035),q1=P(rg,th-Math.sign(rg.sp)*(k+1)*.035);if(q0.hid||q1.hid)continue;
      ctx.strokeStyle=`rgba(${TH.acc},${a*.5*(1-k/14)})`;ctx.lineWidth=1.6*(1-k/14)+.4;ctx.beginPath();ctx.moveTo(q0.x,q0.y);ctx.lineTo(q1.x,q1.y);ctx.stroke()}
    const al=a*(q.hid?.3:1);ctx.fillStyle=`rgba(${TH.body},${al})`;ctx.fillRect(q.x-2.5,q.y-2.5,5,5);
    ctx.fillStyle=`rgba(${TH.orbit},${.85*al})`;ctx.fillRect(q.x-11,q.y-1.5,7,3);ctx.fillRect(q.x+4,q.y-1.5,7,3);
    anchors.push(q);vis.push(!q.hid)});
  ctx.restore();
  columnCallouts(list,{x:gx,y:gy},RINGS[2].r*R,a,p,anchors,vis);
}
// screen position of a lat/lon on the globe (inverse of the shader's rotation); null on the far side
function project(lat,lon,gx,gy,R){
  const D=Math.PI/180,la=lat*D,lo=lon*D,a=cur.lat*D,b=cur.lon*D;
  const wx=Math.cos(la)*Math.sin(lo),wy=Math.sin(la),wz=Math.cos(la)*Math.cos(lo);
  const x1=wx*Math.cos(b)-wz*Math.sin(b),z1=wx*Math.sin(b)+wz*Math.cos(b);
  const ny=wy*Math.cos(a)-z1*Math.sin(a),nz=wy*Math.sin(a)+z1*Math.cos(a);
  return nz>0?{x:gx+x1*R,y:gy-ny*R}:null;
}
function pin(x,y,v,k,a,t,dir=1){
  if(a<.02)return;ctx.save();
  const pr=6+3*Math.sin(t*2.5);
  ctx.strokeStyle=`rgba(${TH.acc},${a})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,pr,0,7);ctx.stroke();
  ctx.fillStyle=`rgba(${TH.acc},${a})`;ctx.beginPath();ctx.arc(x,y,2.5,0,7);ctx.fill();
  const up=dir<0?100:60;
  ctx.strokeStyle=`rgba(${TH.ink},${.4*a})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+dir*pr,y-pr);ctx.lineTo(x+dir*60,y-up);ctx.lineTo(x+dir*86,y-up);ctx.stroke();
  ctx.shadowColor=TH.shadow;ctx.shadowBlur=8;const L=label({v,k},0,y-up,a,15);L.draw(dir>0?Math.min(w-12-L.tw,x+92):Math.max(8,x-92-L.tw));
  ctx.restore();
}

// ---------- the research vessel: a rotating ring of habitat modules, NASA-inspired, with its own details ----------
// twelve habitat modules in a ring on four spokes around a compact hub; thrusters on four modules
const SHIP=(()=>{const P=[];
  // a box centred on the ring at angle a: ht along the ring, hr outward, hz along the ring axis
  const box=(a,ht,hr,hz,R,kind,win)=>{const t=[-Math.sin(a),Math.cos(a),0],r=[Math.cos(a),Math.sin(a),0];
    const c=(st,sr,sz)=>[R*r[0]+st*ht*t[0]+sr*hr*r[0],R*r[1]+st*ht*t[1]+sr*hr*r[1],sz*hz];
    const F=[[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1],'out'],[[-1,-1,-1],[-1,-1,1],[1,-1,1],[1,-1,-1],'in'],
             [[-1,-1,1],[-1,1,1],[1,1,1],[1,-1,1],'z'],[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],'z'],
             [[-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,-1,1],'end'],[[1,-1,-1],[1,-1,1],[1,1,1],[1,1,-1],'end']];
    for(const [p0,p1,p2,p3,side] of F)P.push({pts:[p0,p1,p2,p3].map(q=>c(...q)),kind,spin:true,win:win&&(side==='out'||side==='z')?side:null})};
  // twelve habitat modules in a ring, joined by short tunnels
  for(let i=0;i<12;i++){const a=i/12*6.2832;box(a,.19,.1,.095,1,i%3===0?'band':'ring',true);box(a+6.2832/24,.07,.04,.04,1,'spoke',false)}
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;P.push({line:[[Math.cos(a)*.14,Math.sin(a)*.14,0],[Math.cos(a)*.88,Math.sin(a)*.88,0]],w:.05,kind:'spoke',spin:true})}
  const cyl=(z0,z1,r0,r1,n,kind)=>{for(let i=0;i<n;i++){const a0=i/n*6.2832,a1=(i+1)/n*6.2832;
    P.push({pts:[[r0*Math.cos(a0),r0*Math.sin(a0),z0],[r0*Math.cos(a1),r0*Math.sin(a1),z0],[r1*Math.cos(a1),r1*Math.sin(a1),z1],[r1*Math.cos(a0),r1*Math.sin(a0),z1]],kind})}};
  cyl(-.13,.13,.19,.19,12,'hub');P.forEach(f=>{if(f.kind==='hub'||f.kind==='hubcap')f.spin=true});cyl(-.2,-.13,.1,.15,10,'hubcap');cyl(.13,.2,.15,.1,10,'hubcap');   // compact central hub
  return P})();
const SHIP_COL={hubcap:[150,156,168],ring:[226,229,236],band:[176,182,194],spoke:[160,166,178],hub:[205,210,220]};
function shipXf(p,st,spinA){let x=p[0],y=p[1],z=p[2],c,s2;
  if(spinA!==null){c=Math.cos(spinA);s2=Math.sin(spinA);[x,y]=[x*c-y*s2,x*s2+y*c]}
  c=Math.cos(st.yaw);s2=Math.sin(st.yaw);[x,z]=[x*c+z*s2,-x*s2+z*c];
  c=Math.cos(st.pitch);s2=Math.sin(st.pitch);[y,z]=[y*c-z*s2,y*s2+z*c];
  return [x,y,z]}
function drawShip(st,L,alpha,t){
  if(alpha<.02||st.s<2)return;
  const S=st.s,sx=q=>st.x+q[0]*S,sy=q=>st.y-q[1]*S,items=[],dim=TH.dark?1:.78;
  for(const f of SHIP){
    if(f.line){const q=f.line.map(p=>shipXf(p,st,st.spin));items.push({z:(q[0][2]+q[1][2])/2,f,q});continue}
    const q=f.pts.map(p=>shipXf(p,st,f.spin?st.spin:null));
    const ux=q[1][0]-q[0][0],uy=q[1][1]-q[0][1],uz=q[1][2]-q[0][2],vx=q[3][0]-q[0][0],vy=q[3][1]-q[0][1],vz=q[3][2]-q[0][2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;if(nz<0){nx=-nx;ny=-ny;nz=-nz}
    items.push({z:(q[0][2]+q[1][2]+q[2][2]+q[3][2])/4,f,q,n:[nx,ny,nz]})}
  // engine glow + exhaust plume, sorted with the hull so it sits in front of or behind the ship correctly
  for(let k=0;k<12;k+=3){const a=k/12*6.2832,px=Math.cos(a),py=Math.sin(a);
    const ge=shipXf([px,py,.14],st,st.spin),gt=shipXf([px,py,.14+2.2*st.thrust],st,st.spin);items.push({z:ge[2],glow:true,ge,gt})}
  items.sort((A,B)=>A.z-B.z);
  ctx.save();ctx.globalAlpha=alpha;ctx.lineJoin='round';
  for(const it of items){
    if(it.glow){if(st.thrust<.02)continue;const x=sx(it.ge),y=sy(it.ge),r=S*(.12+.35*st.thrust);
      const pl=ctx.createLinearGradient(x,y,sx(it.gt),sy(it.gt));pl.addColorStop(0,`rgba(150,200,255,${.55*st.thrust})`);pl.addColorStop(1,'rgba(120,170,255,0)');
      ctx.strokeStyle=pl;ctx.lineWidth=S*.09;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(sx(it.gt),sy(it.gt));ctx.stroke();
      const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(235,245,255,${.95*Math.min(1,st.thrust*1.6)})`);g.addColorStop(.3,`rgba(140,190,255,${.6*st.thrust})`);g.addColorStop(1,'rgba(110,160,255,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();continue}
    const f=it.f,base=SHIP_COL[f.kind];
    if(f.line){const a=it.q[0],b=it.q[1],sh=.5;ctx.strokeStyle=`rgb(${base.map(c=>c*sh*dim|0)})`;ctx.lineWidth=Math.max(1,S*f.w);ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(sx(a),sy(a));ctx.lineTo(sx(b),sy(b));ctx.stroke();continue}
    const d=Math.max(0,it.n[0]*L[0]+it.n[1]*L[1]+it.n[2]*L[2]);
    const sh=.3+.7*d;
    ctx.fillStyle=`rgb(${base.map(c=>Math.min(255,c*sh*dim)|0)})`;ctx.beginPath();
    it.q.forEach((q,i)=>i?ctx.lineTo(sx(q),sy(q)):ctx.moveTo(sx(q),sy(q)));ctx.closePath();ctx.fill();
    ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.6;ctx.stroke();   // seals hairline gaps between faces
    if(f.grid){ctx.strokeStyle=`rgba(10,20,45,${.55})`;ctx.lineWidth=.6;const [a,b,c2,e]=it.q;
      for(let g2=1;g2<6;g2++){const tt=g2/6,p1=[a[0]+(b[0]-a[0])*tt,a[1]+(b[1]-a[1])*tt],p2=[e[0]+(c2[0]-e[0])*tt,e[1]+(c2[1]-e[1])*tt];ctx.beginPath();ctx.moveTo(sx(p1),sy(p1));ctx.lineTo(sx(p2),sy(p2));ctx.stroke()}}
    if(f.win&&it.n[2]>.25&&S>12){const [a,b,c2,e]=it.q,ww=Math.max(1,S*.03);ctx.fillStyle=`rgba(255,214,140,${.9*it.n[2]})`;
      for(let k2=1;k2<4;k2++){const tt=k2/4,mx=(a[0]+(b[0]-a[0])*tt+e[0]+(c2[0]-e[0])*tt)/2,my=(a[1]+(b[1]-a[1])*tt+e[1]+(c2[1]-e[1])*tt)/2;
        ctx.fillRect(st.x+mx*S-ww/2,st.y-my*S-ww/2,ww,ww)}}
  }
  // navigation lights: red and green on opposite modules, a white strobe on the hub
  if(S>8&&!eco){const lights=[[[0,1,0],'255,70,70',Math.sin(t*3)>.2],[[0,-1,0],'80,255,140',Math.sin(t*3+Math.PI)>.2],[[0,0,.22],'255,255,255',(t%1.6)<.08]];
    for(const [p,col,on] of lights){if(!on)continue;const q=shipXf(p,st,p[2]?null:st.spin),x=sx(q),y=sy(q),r=Math.max(3,S*.16);
      const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},.95)`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}}
  ctx.restore();
}
// where the ship is: above Earth at the start, flying with you through the sections, watching Earth during research, home at the end
// phones: always in the clear band under the top bar, never down by the sound button and player
function shipTarget(v,gx,gy,R,wide){
  if(v.id==='hero')return wide?{x:.5*w,y:.25*hgt,s:40,yaw:1.1,pitch:.45,thrust:.3}:{x:.84*w,y:Math.max(110,.14*hgt),s:17,yaw:1.1,pitch:.45,thrust:.3};
  if(v.id==='interests')return wide?{x:.93*w,y:.17*hgt,s:12,yaw:1.3,pitch:-.4,thrust:.08}:{x:.12*w,y:Math.max(110,.14*hgt),s:8,yaw:1.3,pitch:-.4,thrust:.08};
  if(v.id==='contact'){const a=simT*.22;return {x:gx+Math.cos(a)*R*1.45,y:gy+Math.sin(a)*R*.42,s:wide?17:9,yaw:1.35+Math.cos(a)*.5,pitch:-.25,thrust:.05,orbit:a}}
  return wide?{x:.58*w,y:.8*hgt,s:23,yaw:.32,pitch:.34,thrust:.5}:{x:.18*w,y:Math.max(115,.15*hgt),s:12,yaw:.32,pitch:.34,thrust:.5};
}
const meteors=[];let nextMeteor=4;
function drawMeteors(t,dt){
  if(eco||!TH.dark)return;
  if(t>nextMeteor){nextMeteor=t+5+Math.random()*7;const a=Math.PI*(.62+Math.random()*.16);meteors.push({x:w*(.3+Math.random()*.7),y:hgt*Math.random()*.35,a,len:120+Math.random()*120,v:900+Math.random()*500,life:0})}
  for(const m of meteors){m.life+=dt/1000;m.x+=Math.cos(m.a)*m.v*dt/1000;m.y+=Math.sin(m.a)*m.v*dt/1000;
    const al=Math.min(1,m.life*4)*Math.max(0,1-m.life/.9),tx=m.x-Math.cos(m.a)*m.len,ty=m.y-Math.sin(m.a)*m.len;
    const g=ctx.createLinearGradient(m.x,m.y,tx,ty);g.addColorStop(0,`rgba(255,255,255,${.9*al})`);g.addColorStop(1,'rgba(160,190,255,0)');
    ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(tx,ty);ctx.stroke()}
  for(let i=meteors.length-1;i>=0;i--)if(meteors[i].life>.9)meteors.splice(i,1);
}
const ship={x:innerWidth*.5,y:innerHeight*.25,s:40,yaw:1.1,pitch:.45,thrust:.3,spin:0};

// ---------- theme + eco ----------
const TH_DARK={bga:.65,bg:'2,3,8',text:'244,246,255',acc:'255,194,122',orbit:'142,197,255',ink:'255,255,255',body:'230,235,245',shadow:'#000',dark:true};
const TH_LIGHT={bga:.93,bg:'255,255,255',text:'18,22,40',acc:'154,91,19',orbit:'47,95,179',ink:'18,22,40',body:'40,45,60',shadow:'rgba(255,255,255,.9)',dark:false};
let light=matchMedia('(prefers-color-scheme: light)').matches,TH,lightMix;
try{const s=localStorage.getItem('theme');if(s)light=s==='light'}catch(e){}
function setTheme(){document.documentElement.dataset.theme=light?'light':'dark';TH=light?TH_LIGHT:TH_DARK;lightMix=light?1:0;$('theme').textContent=light?'◑ dark':'◑ light';dirty=true}
$('theme').onclick=()=>{light=!light;setTheme();try{localStorage.setItem('theme',light?'light':'dark')}catch(e){}};
setTheme();
let eco=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{const s=localStorage.getItem('eco');if(s!==null)eco=s==='1'}catch(e){}
const ecoBtn=$('eco');const setEco=()=>{ecoBtn.classList.toggle('on',eco);ecoBtn.textContent=eco?'◐ eco mode on':'◐ eco mode'};setEco();
ecoBtn.onclick=()=>{eco=!eco;setEco();dirty=true;try{localStorage.setItem('eco',eco?'1':'0')}catch(e){}};
let lastInput=performance.now()-5000,lastDraw=0,   // start in the slow idle pace until the visitor interacts
simT=0,lastNow=performance.now(),frames=[];
addEventListener('scroll',()=>{dirty=true;lastInput=performance.now()},{passive:true});
addEventListener('pointermove',e=>{mouse.x=e.clientX/innerWidth-.5;mouse.y=e.clientY/innerHeight-.5;lastInput=performance.now();if(!eco)dirty=true});
addEventListener('resize',size);size();

// ---------- one frame ----------
const cur={lon:18,lat:14,lr:Math.log(.66),x:.8,y:.66,mx:.5,my:.17,mk:.62,sun:[...DAY_SUN],layer:0,prev:0,sweep:1.2,intA:0};
const cam={x:0,y:0,z:-800};let vel=0,curSec='';const hud={dist:'',pct:''};
function draw(now,dt){
  if(!eco)simT+=dt/1000;
  const t=simT,idx=scrollIndex(),wide=w>=760,prog=(idx+1)/ids.length;let v=targetView(idx);
  // wormhole timeline, relative to the section before Contact: opens, ship enters, tube, exit onto Earth
  const e=idx-(ids.indexOf('contact')-1);
  const wt=smooth(.36,.44,e)*(1-smooth(.72,.86,e)),wpr=smooth(.4,.78,e);
  if(wt>.01&&e<.82)v={...v,lon:90.4,lat:23.8,r:.04+.2*wpr,x:.5,y:.5,mx:.5,my:.5,mk:1,sun:FRONT_SUN,layer:0};   // Earth waits at the far end of the tube
  const k=Math.min(1,dt/1000*3.2),kc=Math.min(1,dt/1000*3.6),km=Math.min(1,dt/1000*2.4);
  // camera flight through the sections
  const oz=cam.z,tz=(idx+1)*GAP-760;cam.z+=(tz-cam.z)*kc;cam.x+=(mouse.x*240-cam.x)*km;cam.y+=(mouse.y*160-cam.y)*km;
  vel+=(Math.abs(cam.z-oz)*16/Math.max(dt,1)-vel)*.1;
  // the globe eases to its target (radius in log space so the far dot grows smoothly)
  const drift=eco||v.id==='interests'||v.id==='contact'?0:t*1.5;
  const wrap=d=>((d%360)+540)%360-180;
  const dl=wrap(v.lon+drift-cur.lon);cur.lon=wrap(cur.lon+dl*k);cur.lat+=(v.lat-cur.lat)*k;
  cur.lr+=(Math.log(v.r)-cur.lr)*k;cur.x+=(v.x-cur.x)*k;cur.y+=(v.y-cur.y)*k;cur.mx+=(v.mx-cur.mx)*k;cur.my+=(v.my-cur.my)*k;cur.mk+=((v.mk||1)-cur.mk)*k;
  for(let i=0;i<3;i++)cur.sun[i]+=(v.sun[i]-cur.sun[i])*k;
  if(v.layer!==cur.layer){cur.prev=cur.layer;cur.layer=v.layer;cur.sweep=0}
  cur.sweep=Math.min(1.2,cur.sweep+dt/1000*.85);
  cur.intA+=((v.id==='interests'?1:0)-cur.intA)*k;
  const gx=(wide?cur.x:cur.mx)*w,gy=(wide?cur.y:cur.my)*hgt,R=Math.exp(cur.lr)*(wide?hgt:w*.9*cur.mk);
  // wormhole: opens during the section before Contact, the ship flies in, a tunnel, then home
  const whA=smooth(.04,.18,e)*(1-smooth(.42,.5,e)),whK=smooth(.04,.38,e);
  const wx=(wide?.72:.5)*w,wy=(wide?.45:.3)*hgt,wrad=(wide?hgt:w)*(.04+.24*whK);
  if(gl&&U){
    gl.uniform2f(U.R,sky.width,sky.height);gl.uniform1f(U.T,t);gl.uniform1f(U.READY,texReady?1:0);
    gl.uniform2f(U.E,gx*glScale,(hgt-gy)*glScale);gl.uniform1f(U.ER,R*glScale);
    gl.uniform2f(U.ROT,cur.lon*Math.PI/180,cur.lat*Math.PI/180);gl.uniform3fv(U.SUN,cur.sun);
    gl.uniform1f(U.LIGHT,lightMix);gl.uniform2f(U.STAR,cam.x*.0004+prog*.9,-cam.y*.0004);
    gl.uniform3f(U.WH,wx*glScale,(hgt-wy)*glScale,wrad*glScale);gl.uniform1f(U.WA,whA);gl.uniform1f(U.WT,wt);gl.uniform1f(U.WP,wpr);
    gl.uniform1f(U.LAYER,cur.layer);gl.uniform1f(U.PREV,cur.prev);gl.uniform1f(U.SWEEP,cur.sweep);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  ctx.clearRect(0,0,w,hgt);
  const cx=wide?w*.72:w/2,cy=hgt/2;
  const leave=smooth(-1,-.1,idx),back=smooth(ids.length-2.2,ids.length-1,idx),away=leave*(1-back)*(1-cur.intA);
  // stars drift past (dark theme); short faint trails only when moving fast
  if(TH.dark){const trail=Math.min(vel*1.8,70);
    for(const d of stars){const dz=d.z-cam.z;if(dz<20||dz>5200)continue;
      const s=F/dz,x=cx+(d.x-cam.x)*s,y=cy+(d.y-cam.y)*s;if(x<-50||x>w+50||y<-50||y>hgt+50)continue;
      const a=Math.min(1,(5200-dz)/2600)*d.b*Math.min(1,(dz-20)/200)*(.35+.65*away);
      if(trail>6){const s2=F/(dz+trail),x2=cx+(d.x-cam.x)*s2,y2=cy+(d.y-cam.y)*s2;ctx.strokeStyle=`rgba(200,215,255,${a*.35})`;ctx.lineWidth=Math.min(1.4,.5+s*.8);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()}
      ctx.fillStyle=`rgba(230,235,255,${a*.85})`;const r=Math.min(1.8,.4+s*1.1);ctx.fillRect(x-r/2,y-r/2,r,r)}}
  drawMeteors(t,dt);
  // star systems, far to near; they fade while the camera looks back at Earth
  for(const S of systems)S.c=null;
  for(const S of systems.filter(S=>{const dz=S.z-cam.z;return dz>40&&dz<6500}).sort((a,b)=>b.z-a.z)){
    const P=(x,y,z)=>{const dz=S.z+z-cam.z;if(dz<40)return null;const s=F/dz;return {x:cx+(S.x+x-cam.x)*s,y:cy+(S.y+y-cam.y)*s,s,dz}};
    const c=P(0,0,0);if(!c)continue;
    let al=Math.max(0,Math.min(1,(c.dz-60)/300,(6500-c.dz)/3000))*away*(1-smooth(.02,.16,e));   // star systems give way to the wormhole
    if(wide&&c.x<pfRight)al*=.45;
    if(al<.01)continue;
    S.c=c;S.al=al;S.rr=S.orbits[S.orbits.length-1].r*c.s*1.08;S.anchors=[];
    for(const o of S.orbits){ctx.strokeStyle=TH.dark?`hsla(${S.hue},70%,80%,${.14*al})`:`hsla(${S.hue},45%,38%,${.25*al})`;ctx.lineWidth=1;ctx.beginPath();let st=false;
      for(let kk=0;kk<=72;kk++){const a=kk/72*Math.PI*2,q=P(Math.cos(a)*o.r,Math.sin(a)*o.r*Math.cos(S.tilt),Math.sin(a)*o.r*Math.sin(S.tilt));if(!q){st=false;continue}st?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);st=true}
      ctx.stroke()}
    const R2=Math.min(60,Math.max(2,24*c.s));
    let g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,R2*4);
    if(TH.dark){g.addColorStop(0,`hsla(${S.hue},100%,96%,${al})`);g.addColorStop(.15,`hsla(${S.hue},100%,72%,${.5*al})`);g.addColorStop(1,`hsla(${S.hue},100%,60%,0)`)}
    else{g.addColorStop(0,`hsla(${S.hue},90%,50%,${al})`);g.addColorStop(.18,`hsla(${S.hue},85%,55%,${.35*al})`);g.addColorStop(1,`hsla(${S.hue},80%,60%,0)`)}
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,R2*4,0,7);ctx.fill();
    if(TH.dark){const fw=Math.min(R2*10,260);g=ctx.createLinearGradient(c.x-fw,0,c.x+fw,0);g.addColorStop(0,'rgba(150,195,255,0)');g.addColorStop(.5,`rgba(200,220,255,${.3*al})`);g.addColorStop(1,'rgba(150,195,255,0)');ctx.fillStyle=g;ctx.fillRect(c.x-fw,c.y-.6,fw*2,1.2)}
    const pls=[];for(const o of S.orbits)for(const pl of o.pl){const a=pl.a+t*S.spin*(200/o.r),q=P(Math.cos(a)*o.r,Math.sin(a)*o.r*Math.cos(S.tilt),Math.sin(a)*o.r*Math.sin(S.tilt));if(q){pls.push({q,pl});S.anchors[pl.j]=q}}
    pls.sort((a,b)=>b.q.dz-a.q.dz);
    for(const {q,pl} of pls){const r=Math.max(.8,pl.size*q.s),hh=S.hue+pl.hue;
      const pg=ctx.createRadialGradient(q.x-r*.4,q.y-r*.4,r*.1,q.x,q.y,r);pg.addColorStop(0,`hsla(${hh+30},60%,${TH.dark?82:70}%,${al})`);pg.addColorStop(1,`hsla(${hh+60},50%,${TH.dark?22:30}%,${al})`);
      ctx.fillStyle=pg;ctx.beginPath();ctx.arc(q.x,q.y,r,0,7);ctx.fill()}
  }
  // the ship: eases to its place for this section; engine burns harder while you fly
  {const tg=shipTarget(v,gx,gy,R,wide),ks=Math.min(1,dt/1000*(tg.orbit!==undefined?4:2.2));
    tg.yaw+=.08*Math.sin(t*.5);tg.pitch+=.05*Math.sin(t*.7);tg.y+=4*Math.sin(t*.9);   // gentle drift
    const into=smooth(.16,.42,e)*(1-smooth(.5,.55,e)),mixv=(a,b,k)=>a+(b-a)*k;
    if(into>0){tg.x=mixv(tg.x,wx,into);tg.y=mixv(tg.y,wy,into);tg.s=mixv(tg.s,3,into);tg.yaw=mixv(tg.yaw,.1,into);tg.pitch=mixv(tg.pitch,.15,into);tg.thrust=mixv(tg.thrust,1,into)}
    ship.x+=(tg.x-mouse.x*14-ship.x)*ks;ship.y+=(tg.y-mouse.y*10-ship.y)*ks;ship.s=Math.exp(Math.log(ship.s)+(Math.log(tg.s)-Math.log(ship.s))*ks);
    if(!wide)ship.y=Math.max(ship.y,92+ship.s*1.4);   // phones: never under the top bar and its fade
    ship.yaw+=(tg.yaw-ship.yaw)*ks;ship.pitch+=(tg.pitch-ship.pitch)*ks;
    const burn=tg.thrust>0?Math.min(.6,vel/40):0;ship.thrust+=(tg.thrust+burn-ship.thrust)*Math.min(1,dt/1000*4);
    if(!eco)ship.spin+=dt/1000*.35;
    // in orbit the far half of the path passes behind Earth
    const behind=tg.orbit!==undefined&&Math.sin(tg.orbit)<0&&Math.hypot(ship.x-gx,ship.y-gy)<R*1.02;
    const Ln=Math.hypot(...cur.sun);drawShip(ship,cur.sun.map(c=>c/Ln),behind?0:1-smooth(.4,.46,e)*(1-smooth(.62,.78,e)),t)}

  // labels: current system's planets, the research region's pin, or satellites and Dhaka at home
  const fade=smooth(0,.22,v.f||0)*(1-smooth(.78,1,v.f||0));
  const curS=systems.find(S=>S.id===v.id);
  if(curS&&curS.c)columnCallouts(NOTES[curS.id],curS.c,curS.rr,fade*curS.al,((v.f||0)-.12)/.5,curS.anchors);
  if(v.id==='interests'){setStory(v.k);const inFade=smooth(0,.06,v.f)*(1-smooth(.94,1,v.f)),q=project(v.lat,v.lon,gx,gy,R);
    if(q)pin(q.x,q.y,v.region,['','vegetation index','ice & snow cover','land cover','night lights'][cur.layer]||'',inFade*smooth(.3,.9,cur.sweep),t)}
  if(v.id==='contact'&&wt<.3){satellites(NOTES.contact,gx,gy,R,fade*(1-wt/.3),((v.f||0)-.1)/.45,t);const q=project(23.8,90.4,gx,gy,R);if(q)pin(q.x,q.y,'Dhaka, Bangladesh','based here · open to collaborate',fade,t,-1)}
  // HUD + trajectory
  const sec=idx<-.4?'earth orbit':wt>.3?'in transit':whA>.5?'wormhole':v.id==='interests'?'looking back · '+v.region:v.id==='contact'?'home':v.id;
  // write to the page only when something changed
  if(sec!==curSec){curSec=sec;$('sec').textContent=sec;traj.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.id===v.id))}
  const dist=v.id==='contact'&&back>.9?'0':(Math.round(Math.max(0,cam.z+800)/10)*10).toLocaleString();
  if(dist!==hud.dist){hud.dist=dist;$('dist').textContent=dist}
  const pct=(Math.max(0,Math.min(1,idx/(ids.length-1)))*100).toFixed(1);
  if(pct!==hud.pct){hud.pct=pct;$('fill').style.width=pct+'%';$('ship').style.left=pct+'%'}
}

// ---------- render loop: pauses when hidden, slows when idle, eco draws only after a change ----------
let settleFrames=0;
function loop(now){
  requestAnimationFrame(loop);
  if(document.hidden){lastNow=now;return}
  if(eco){if(dirty){settleFrames=90;dirty=false}if(settleFrames<=0){lastNow=now;return}if(now-lastDraw<33)return;settleFrames--}
  else if(now-lastInput>4000&&now-lastDraw<50)return;
  const capped=eco||now-lastInput>4000;
  const dt=Math.max(0,Math.min(100,now-lastNow));lastNow=now;lastDraw=now;dirty=false;
  draw(now,dt);
  // adapt resolution to the GPU, but only from full-speed frames: the idle and eco paces are deliberate, not a slow GPU
  if(gl&&U&&!capped){frames.push(dt);if(frames.length>=60){const avg=frames.reduce((a,b)=>a+b)/frames.length;frames=[];
    if(avg>28&&glScale>maxScale*.75){glScale=Math.max(maxScale*.75,glScale*.85);sizeSky()}else if(avg<20&&glScale<maxScale){glScale=Math.min(maxScale,glScale*1.2);sizeSky()}}}
  else frames=[];
}
requestAnimationFrame(loop);

// ---------- this visit's footprint (Sustainable Web Design model v3: ~0.36 g CO2e per MB) ----------
addEventListener('load',()=>setTimeout(()=>{
  let b=0;const nav=performance.getEntriesByType('navigation')[0];if(nav)b+=nav.transferSize||nav.encodedBodySize||0;
  for(const r of performance.getEntriesByType('resource'))b+=r.transferSize||r.encodedBodySize||0;
  const mb=b/1048576;
  $('fp').innerHTML=mb>0?`This visit: <b>${mb.toFixed(2)} MB</b> transferred, about <b>${(mb*.36).toFixed(2)} g CO₂e</b> (estimate, Sustainable Web Design model v3).`:'This visit was served from cache: close to zero transfer.';
},2500));

// ---------- sound: Audiomack's official embed; offline, an original organ piece ----------
const AUDIOMACK='https://audiomack.com/embed/brittonxavier6/song/interstellar-main-theme-hans-zimmer';
let on=false,ac=null,bus=null;
const CHORDS=[[55,110,164.81,220,246.94,329.63],[43.65,87.31,130.81,174.61,220,329.63],[65.41,130.81,196,261.63,329.63,392],[41.2,82.41,123.47,164.81,196,246.94]];
function organ(freq,start,dur,v){
  const env=ac.createGain();env.gain.setValueAtTime(0,start);env.gain.linearRampToValueAtTime(v,start+2.4);env.gain.setValueAtTime(v,start+dur-2.8);env.gain.linearRampToValueAtTime(0,start+dur);env.connect(bus);
  [[1,1],[2,.55],[3,.28],[4,.22],[6,.09],[8,.05]].forEach(([m,g])=>{const o=ac.createOscillator();o.frequency.value=freq*m;o.detune.value=(Math.random()-.5)*5;const gg=ac.createGain();gg.gain.value=g;o.connect(gg).connect(env);o.start(start);o.stop(start+dur+.1)});
}
function synth(play){
  if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();bus=ac.createGain();bus.gain.value=0;
    const verb=ac.createConvolver(),len=ac.sampleRate*6,buf=ac.createBuffer(2,len,ac.sampleRate);
    for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.5)}
    verb.buffer=buf;const wet=ac.createGain();wet.gain.value=.55;bus.connect(verb).connect(wet).connect(ac.destination);bus.connect(ac.destination);
    let next=ac.currentTime+.1,kk=0;setInterval(()=>{while(next<ac.currentTime+3){CHORDS[kk%CHORDS.length].forEach((f,i)=>organ(f,next,10,i<2?.09:.05));next+=8;kk++}},500)}
  ac.resume();bus.gain.cancelScheduledValues(ac.currentTime);bus.gain.setValueAtTime(bus.gain.value,ac.currentTime);bus.gain.linearRampToValueAtTime(play?.5:0,ac.currentTime+(play?3:.8));
  if(!play)setTimeout(()=>{if(!on)ac.suspend()},900);   // silent and idle while off
}
// the button opens the player, then hides and shows it; hiding keeps it loaded, so the music keeps playing; ✕ stops it
let player=0;   // 0 closed, 1 shown, 2 hidden but loaded
function soundUI(){
  const b=$('snd');b.classList.toggle('on',on||player>0);b.setAttribute('aria-pressed',on||player>0);
  b.textContent=on?'♪ sound on':['♪ sound','♪ hide player','♪ show player'][player];$('yt').classList.toggle('show',player===1);
}
$('snd').onclick=()=>{
  if(player===0&&(on||!navigator.onLine)){on=!on;synth(on);soundUI();return}   // offline: the organ piece
  if(player===0){$('amp').src=AUDIOMACK;player=1}else player=player===1?2:1;
  soundUI();
};
$('ytx').onclick=()=>{$('amp').src='about:blank';player=0;soundUI()};
