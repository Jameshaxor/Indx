'use client';
import { useEffect, useRef } from 'react';

export default function Chart({ data, color='#7c5ce7', height=200, fill=true }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c||!data?.length) return;
    const ctx = c.getContext('2d'), dpr = devicePixelRatio||1;
    const w = c.parentElement.offsetWidth, h = height;
    c.width=w*dpr; c.height=h*dpr; c.style.width=w+'px'; c.style.height=h+'px';
    ctx.scale(dpr,dpr); ctx.clearRect(0,0,w,h);
    const max=Math.max(...data)*1.05, min=Math.min(...data)*.95, range=max-min||1, step=w/(data.length-1);
    ctx.strokeStyle='rgba(255,255,255,.03)'; ctx.lineWidth=1;
    for(let i=0;i<4;i++){const y=h*.1+(h*.8/3)*i;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.beginPath();
    data.forEach((v,i)=>{const x=i*step,y=h-((v-min)/range)*(h*.8)-h*.1;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();
    if(fill){ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,color+'30');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fill();}
    const lx=(data.length-1)*step,ly=h-((data[data.length-1]-min)/range)*(h*.8)-h*.1;
    ctx.beginPath();ctx.arc(lx,ly,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
    ctx.beginPath();ctx.arc(lx,ly,7,0,Math.PI*2);ctx.fillStyle=color+'20';ctx.fill();
  }, [data,color,height,fill]);
  return <canvas ref={ref}/>;
}
