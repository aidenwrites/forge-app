import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { marked } from "marked";
marked.setOptions({ breaks: true, gfm: true });
import {
  Dumbbell, Activity, Calendar, BarChart3, Settings, Plus, ChevronRight,
  Flame, Target, TrendingUp, Clock, Check, X, Edit3, Upload, Zap, Moon,
  Heart, Play, Square, ChevronLeft, Trash2, Send, Utensils, Route, Timer,
  AlertCircle, Loader2, Sparkles, ArrowRight, Home, BookOpen, Sun,
  ChevronDown, ChevronUp, MessageCircle, Camera, Users, Award, Info,
  SkipForward, Brain, Battery, AlertTriangle, Trophy, Layers, FileText,
  HelpCircle, Crosshair, Shield, Gauge, Notebook, Coffee, ListChecks
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// ══════════════════════════════════════
//  CORE: Storage, Helpers, API
// ══════════════════════════════════════
const K={API:"f3:api",PROF:"f3:prof",PLAN:"f3:plan",GYM:"f3:gym",RUN:"f3:run",NUT:"f3:nut",HP:"f3:hp",OB:"f3:ob",CHAT:"f3:chat",BODY:"f3:body",REV:"f3:rev",CON:"f3:con",JOUR:"f3:jour",PERIO:"f3:perio",PRS:"f3:prs",ACH:"f3:ach"};
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const td=()=>new Date().toISOString().split("T")[0];
const dn=d=>DAYS[new Date(d+"T12:00:00").getDay()];
const sd=d=>SD[new Date(d+"T12:00:00").getDay()];
const fd=d=>new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const epley=(w,r)=>r<=1?w:Math.round(w*(1+r/30));
function wkDates(off=0){const n=new Date();n.setDate(n.getDate()+off*7);const s=new Date(n);s.setDate(n.getDate()-n.getDay());return Array.from({length:7},(_,i)=>{const d=new Date(s);d.setDate(s.getDate()+i);return d.toISOString().split("T")[0]})}
async function sg(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch{return null}}
async function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){console.error(e)}}
const sanitize=s=>typeof s==="string"?s.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/\u2014/g,"--").replace(/\u2013/g,"-").replace(/[^\x00-\x7F]/g,""):s;
async function ai(key,sys,usr,o={}){
  const raw=Array.isArray(usr)
    ?usr.map(m=>({...m,content:sanitize(typeof m.content==="string"?m.content:JSON.stringify(m.content))}))
    :[{role:"user",content:sanitize(typeof usr==="string"?usr:JSON.stringify(usr))}];
  // Ensure roles strictly alternate user/assistant, starting with user
  const msgs=raw.reduce((acc,m)=>{
    if(acc.length===0){if(m.role==="user")acc.push(m);return acc;}
    if(m.role!==acc[acc.length-1].role)acc.push(m);
    return acc;
  },[]);
  const b={apiKey:key,model:"claude-sonnet-4-6",max_tokens:o.mt||4096,system:sanitize(sys),messages:msgs};
  if(o.mcp)b.mcp_servers=o.mcp;if(o.tools)b.tools=o.tools;
  console.log('sending apiKey:', key ? key.slice(0,10) + '...' : 'MISSING');
  const r=await fetch("https://forge-app-steel.vercel.app/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});
  if(!r.ok)throw new Error(`API ${r.status}`);return r.json();
}
function aT(d){return d.content.filter(b=>b.type==="text").map(b=>b.text).join("\n")}
function aJ(t){const c=t.replace(/```json\s*/g,"").replace(/```/g,"").trim();const s=c.indexOf("{")!==-1?c.indexOf("{"):c.indexOf("[");const e=Math.max(c.lastIndexOf("}"),c.lastIndexOf("]"));return JSON.parse(c.slice(s,e+1))}

// ══════════════════════════════════════
//  THEME
// ══════════════════════════════════════
// Palette: Sport-science instrument — field-paper off-white, near-black ink, signal vermillion
const C={bg:"#f4f2ee",bg2:"#e8e5de",card:"#fafaf7",card2:"#eeebe3",bdr:"#d0ccc4",bdr2:"#8a867e",
  acc:"#e8341a",accD:"rgba(232,52,26,.07)",accG:"rgba(232,52,26,.18)",
  r:"#cc2a18",rD:"rgba(204,42,24,.07)",o:"#d96b0a",oD:"rgba(217,107,10,.07)",
  b:"#2468a2",bD:"rgba(36,104,162,.07)",p:"#7a4e2d",pD:"rgba(122,78,45,.07)",
  cy:"#1a7a6a",gd:"#9a7200",pk:"#c44060",
  t:"#0f0f0d",d:"#4a4740",m:"#9a9590"};
const F={d:"'Bebas Neue',cursive",b:"'IBM Plex Mono',monospace",m:"'IBM Plex Mono',monospace"};
const FURL="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap";
const CSS=`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}@keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes pop{0%{transform:scale(.9);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}@keyframes mountIn{0%{opacity:0;transform:translateY(7px)}100%{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:0}input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}button{cursor:pointer;border:none;background:none;font-family:${F.b}}button:active{transform:scale(.97)}textarea:focus,input:focus{border-color:${C.t}!important;outline:none}.ch:hover{background:${C.card2}!important;border-color:${C.bdr2}!important}`;

// ══════════════════════════════════════
//  EXERCISE & MUSCLE DATABASE
// ══════════════════════════════════════
const MUSCLES={chest:{label:"Chest",mev:8,mav:16,mrv:22},back:{label:"Back",mev:8,mav:16,mrv:22},quads:{label:"Quads",mev:6,mav:14,mrv:20},hamstrings:{label:"Hamstrings",mev:4,mav:10,mrv:16},glutes:{label:"Glutes",mev:4,mav:12,mrv:18},shoulders:{label:"Shoulders",mev:6,mav:16,mrv:22},side_delts:{label:"Side Delts",mev:6,mav:18,mrv:26},rear_delts:{label:"Rear Delts",mev:4,mav:14,mrv:22},biceps:{label:"Biceps",mev:4,mav:12,mrv:20},triceps:{label:"Triceps",mev:4,mav:12,mrv:18},traps:{label:"Traps",mev:4,mav:12,mrv:18},core:{label:"Core",mev:4,mav:10,mrv:16},calves:{label:"Calves",mev:6,mav:12,mrv:18}};

const EX_DB={
  "bench press":{muscles:{chest:1,shoulders:.3,triceps:.5},type:"compound",sfr:"high",cues:["Retract scapulae","Arch upper back","Drive feet","Touch mid-chest","Full lockout"],subs:["Dumbbell Bench Press","Floor Press","Machine Chest Press","Push-ups"]},
  "incline bench press":{muscles:{chest:.8,shoulders:.5,triceps:.4},type:"compound",sfr:"high",cues:["30-45° angle","Retract scapulae","Touch upper chest","Full lockout"],subs:["Incline Dumbbell Press","Low-to-High Cable Fly","Landmine Press"]},
  "dumbbell bench press":{muscles:{chest:1,shoulders:.3,triceps:.4},type:"compound",sfr:"high",cues:["Full ROM","Control the descent","Press in slight arc"],subs:["Bench Press","Cable Fly","Machine Press"]},
  "cable fly":{muscles:{chest:.8},type:"isolation",sfr:"very high",cues:["Slight elbow bend","Squeeze at peak","Control eccentric"],subs:["Pec Deck","Dumbbell Fly","Cable Crossover"]},
  "squat":{muscles:{quads:1,glutes:.6,core:.3},type:"compound",sfr:"moderate",cues:["Brace hard","Knees track toes","Hit parallel+","Drive through midfoot"],subs:["Leg Press","Hack Squat","Goblet Squat","Bulgarian Split Squat"]},
  "leg press":{muscles:{quads:1,glutes:.4},type:"compound",sfr:"high",cues:["Full ROM","Don't lock knees","Push through heels"],subs:["Squat","Hack Squat","Lunges"]},
  "leg extension":{muscles:{quads:1},type:"isolation",sfr:"very high",cues:["Full extension","Squeeze at top","Control negative"],subs:["Sissy Squat","Front Foot Elevated Split Squat"]},
  "deadlift":{muscles:{hamstrings:.8,glutes:.8,back:.6,core:.3},type:"compound",sfr:"low",cues:["Hinge at hips","Bar close to body","Neutral spine","Lock out with glutes"],subs:["Romanian Deadlift","Trap Bar Deadlift","Hip Thrust"]},
  "romanian deadlift":{muscles:{hamstrings:1,glutes:.6},type:"compound",sfr:"moderate",cues:["Soft knee bend","Push hips back","Feel hamstring stretch","Squeeze at top"],subs:["Single Leg RDL","Good Morning","Stiff Leg Deadlift"]},
  "leg curl":{muscles:{hamstrings:1},type:"isolation",sfr:"very high",cues:["Full ROM","Squeeze at peak","Slow eccentric"],subs:["Nordic Curl","Seated Leg Curl","Swiss Ball Curl"]},
  "hip thrust":{muscles:{glutes:1,hamstrings:.3},type:"compound",sfr:"high",cues:["Drive through heels","Full extension","Squeeze glutes","Chin tucked"],subs:["Glute Bridge","Cable Pull-through","Step-ups"]},
  "overhead press":{muscles:{shoulders:1,triceps:.5,core:.2},type:"compound",sfr:"moderate",cues:["Brace core","Press slightly back","Head through at top"],subs:["Dumbbell Shoulder Press","Arnold Press","Landmine Press"]},
  "lateral raise":{muscles:{side_delts:1},type:"isolation",sfr:"very high",cues:["Slight forward lean","Lead with elbows","Stop at shoulder height","Light weight"],subs:["Cable Lateral Raise","Machine Lateral Raise","Upright Row"]},
  "face pull":{muscles:{rear_delts:1,traps:.3},type:"isolation",sfr:"very high",cues:["Pull to forehead","Externally rotate","Squeeze rear delts"],subs:["Reverse Fly","Band Pull-apart","Rear Delt Machine"]},
  "barbell row":{muscles:{back:1,biceps:.4,rear_delts:.3},type:"compound",sfr:"moderate",cues:["Hinge to 45°","Pull to lower chest","Squeeze scapulae"],subs:["Dumbbell Row","Cable Row","T-Bar Row","Chest-Supported Row"]},
  "pull-up":{muscles:{back:1,biceps:.5},type:"compound",sfr:"moderate",cues:["Full dead hang","Pull elbows to hips","Chin over bar","Control descent"],subs:["Lat Pulldown","Assisted Pull-ups","Inverted Row"]},
  "lat pulldown":{muscles:{back:1,biceps:.4},type:"compound",sfr:"high",cues:["Lean slightly back","Pull to upper chest","Squeeze lats"],subs:["Pull-up","Cable Row","Straight Arm Pulldown"]},
  "cable row":{muscles:{back:1,biceps:.3,rear_delts:.2},type:"compound",sfr:"high",cues:["Pull to lower chest","Squeeze scapulae","Don't lean back"],subs:["Barbell Row","Dumbbell Row","Machine Row"]},
  "bicep curl":{muscles:{biceps:1},type:"isolation",sfr:"very high",cues:["Elbows pinned","Full ROM","Squeeze at top","Control negative"],subs:["Hammer Curl","Cable Curl","Preacher Curl","Incline Curl"]},
  "hammer curl":{muscles:{biceps:.8},type:"isolation",sfr:"very high",cues:["Neutral grip","Full ROM","Don't swing"],subs:["Bicep Curl","Cross-body Curl","Cable Hammer Curl"]},
  "tricep pushdown":{muscles:{triceps:1},type:"isolation",sfr:"very high",cues:["Elbows at sides","Full extension","Squeeze at bottom"],subs:["Overhead Extension","Skull Crushers","Dips"]},
  "skull crusher":{muscles:{triceps:1},type:"isolation",sfr:"high",cues:["Lower to forehead","Elbows fixed","Full extension"],subs:["Tricep Pushdown","Overhead Extension","Close Grip Bench"]},
  "dips":{muscles:{chest:.5,triceps:1,shoulders:.3},type:"compound",sfr:"moderate",cues:["Lean forward for chest","Upright for triceps","Full depth","Lock out"],subs:["Close Grip Bench","Tricep Pushdown","Machine Dip"]},
  "calf raise":{muscles:{calves:1},type:"isolation",sfr:"very high",cues:["Full stretch at bottom","Pause at top","Slow eccentric"],subs:["Seated Calf Raise","Leg Press Calf Raise"]},
  "plank":{muscles:{core:1},type:"isolation",sfr:"high",cues:["Neutral spine","Squeeze glutes","Breathe steadily"],subs:["Dead Bug","Ab Wheel","Pallof Press"]},
  "cable crunch":{muscles:{core:1},type:"isolation",sfr:"high",cues:["Curl down","Don't pull with arms","Squeeze abs"],subs:["Hanging Leg Raise","Ab Wheel","Decline Crunch"]},
};

function getEx(name){
  const k=name.toLowerCase().trim();
  for(const[n,v]of Object.entries(EX_DB)){if(k.includes(n)||n.includes(k))return{name:n,...v}}
  return null;
}

// Compute weekly sets per muscle from gym logs
function muscleVolume(gymLogs,dates){
  const vol={};
  Object.keys(MUSCLES).forEach(m=>vol[m]=0);
  gymLogs.filter(l=>dates.includes(l.date)).forEach(l=>{
    l.exercises?.forEach(ex=>{
      const info=getEx(ex.name);
      if(!info?.muscles)return;
      const sets=ex.sets?.filter(s=>(s.reps||0)>0).length||0;
      Object.entries(info.muscles).forEach(([m,w])=>{
        if(vol[m]!==undefined)vol[m]+=Math.round(sets*w);
      });
    });
  });
  return vol;
}

// Compute all e1RMs
function allE1RM(gymLogs){
  const m={};
  gymLogs.forEach(l=>{l.exercises?.forEach(ex=>{
    const n=ex.name?.toLowerCase().trim();if(!n)return;
    ex.sets?.forEach(s=>{if(s.weight>0&&s.reps>0){
      const e=epley(s.weight,s.reps);
      if(!m[n]||e>m[n].est)m[n]={est:e,w:s.weight,r:s.reps,date:l.date};
    }});
  })});return m;
}

// Detect stalls
function stalls(gymLogs){
  const h={};
  gymLogs.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(l=>{
    l.exercises?.forEach(ex=>{
      const n=ex.name?.toLowerCase().trim();if(!n)return;
      const top=ex.sets?.reduce((b,s)=>(s.weight||0)*(s.reps||0)>(b.weight||0)*(b.reps||0)?s:b,{});
      if(!h[n])h[n]=[];h[n].push({date:l.date,e1rm:epley(top.weight||0,top.reps||0)});
    });
  });
  const st=[];
  Object.entries(h).forEach(([n,hist])=>{
    if(hist.length<3)return;const l3=hist.slice(-3);
    const mx=Math.max(...l3.map(h=>h.e1rm)),mn=Math.min(...l3.map(h=>h.e1rm));
    if(mx>0&&(mx-mn)/mx<.03)st.push({ex:n,e1rm:l3[l3.length-1].e1rm});
  });return st;
}

// Exercise history for deep analysis
function exHistory(gymLogs,name){
  const n=name.toLowerCase().trim();
  return gymLogs.filter(l=>l.exercises?.some(e=>e.name?.toLowerCase().trim()===n||n.includes(e.name?.toLowerCase().trim())))
    .map(l=>{
      const ex=l.exercises.find(e=>e.name?.toLowerCase().trim()===n||n.includes(e.name?.toLowerCase().trim()));
      const totalVol=ex.sets?.reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0)||0;
      const topE1rm=Math.max(...(ex.sets?.map(s=>epley(s.weight||0,s.reps||0))||[0]));
      const effectiveSets=ex.sets?.filter(s=>(s.rpe||0)>=7).length||0;
      const totalSets=ex.sets?.length||0;
      return{date:l.date,volume:totalVol,e1rm:topE1rm,effectiveSets,totalSets,sets:ex.sets};
    }).sort((a,b)=>a.date.localeCompare(b.date));
}

// Readiness
function readiness(hp,gym,run,nut,prof){
  const t=td();const y=new Date();y.setDate(y.getDate()-1);const yd=y.toISOString().split("T")[0];
  const h=(hp||[]).find(x=>x.date===t)||(hp||[]).find(x=>x.date===yd)||{};
  const d3=new Date();d3.setDate(d3.getDate()-3);const d3s=d3.toISOString().split("T")[0];
  const sl=h.sleepHours||0;const slS=sl>=8?25:sl>=7?22:sl>=6?16:sl>=5?10:5;
  const rhr=h.restingHeartRate||0;const base=prof?.restingHR||62;
  const rS=rhr===0?15:rhr<=base-3?25:rhr<=base+2?20:rhr<=base+5?12:5;
  const rc=gym.filter(l=>l.date>=d3s).length+run.filter(l=>l.date>=d3s).length;
  const lS=rc===0?20:rc===1?25:rc===2?22:rc===3?15:8;
  const rm=nut.filter(n=>n.date>=d3s);
  const ap=rm.length>0?rm.reduce((a,m)=>a+(m.protein||0),0)/Math.max(1,new Set(rm.map(m=>m.date)).size):0;
  const tp=(parseFloat(prof?.weight)||165)*.8;
  const nS=rm.length===0?12:ap>=tp?25:ap>=tp*.7?18:10;
  const sc=clamp(slS+rS+lS+nS,0,100);
  const st=sc>=80?"peak":sc>=60?"good":sc>=40?"moderate":"low";
  const rec=sc>=80?"Push hard — you're primed for PRs.":sc>=60?"Good to train. Standard intensity.":sc>=40?"Dial back 15-20% volume/intensity.":"Rest or light mobility today.";
  return{score:sc,bd:{sleep:slS,recovery:rS,load:lS,nutrition:nS},status:st,rec,data:h};
}

// PR detection
function detectPRs(gymLogs){
  const prs=[];const best={};
  gymLogs.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(l=>{
    l.exercises?.forEach(ex=>{
      const n=ex.name?.toLowerCase().trim();if(!n)return;
      ex.sets?.forEach(s=>{
        if(s.weight>0&&s.reps>0){
          const e=epley(s.weight,s.reps);
          if(!best[n]||e>best[n]){
            if(best[n])prs.push({ex:n,e1rm:e,prev:best[n],w:s.weight,r:s.reps,date:l.date});
            best[n]=e;
          }
        }
      });
    });
  });
  return prs.reverse().slice(0,50);
}

// Achievements
function computeAchievements(gymLogs,runLogs,nutLogs,bodyLogs){
  const a=[];
  const totalGym=gymLogs.length;const totalRun=runLogs.length;
  if(totalGym>=1)a.push({id:"first_workout",icon:"🏋️",label:"First Rep",desc:"Logged first workout"});
  if(totalGym>=10)a.push({id:"ten_workouts",icon:"💪",label:"Double Digits",desc:"10 workouts logged"});
  if(totalGym>=50)a.push({id:"fifty_workouts",icon:"🔥",label:"Iron Regular",desc:"50 workouts logged"});
  if(totalGym>=100)a.push({id:"hundred_workouts",icon:"⚡",label:"Centurion",desc:"100 workouts logged"});
  if(totalRun>=1)a.push({id:"first_run",icon:"🏃",label:"First Mile",desc:"Logged first run"});
  if(totalRun>=20)a.push({id:"twenty_runs",icon:"🛤️",label:"Road Warrior",desc:"20 runs logged"});
  const totalDist=runLogs.reduce((a,r)=>a+(r.distance||0),0);
  if(totalDist>=26.2)a.push({id:"marathon",icon:"🏅",label:"Marathon Distance",desc:`${totalDist.toFixed(1)} total miles`});
  if(totalDist>=100)a.push({id:"hundred_miles",icon:"🌍",label:"Century Club",desc:"100+ miles run"});
  const e1=allE1RM(gymLogs);
  if(e1["bench press"]?.est>=135)a.push({id:"bench135",icon:"🎯",label:"Plate Club",desc:"Bench e1RM ≥ 135lbs"});
  if(e1["bench press"]?.est>=225)a.push({id:"bench225",icon:"👑",label:"Two Plate Bench",desc:"Bench e1RM ≥ 225lbs"});
  if(e1["squat"]?.est>=225)a.push({id:"squat225",icon:"🦵",label:"Two Plate Squat",desc:"Squat e1RM ≥ 225lbs"});
  if(e1["deadlift"]?.est>=315)a.push({id:"dl315",icon:"💀",label:"Three Plate Pull",desc:"Deadlift e1RM ≥ 315lbs"});
  const nutDays=new Set(nutLogs.map(n=>n.date)).size;
  if(nutDays>=7)a.push({id:"week_tracking",icon:"📊",label:"Data Driven",desc:"7 days of nutrition tracked"});
  if(nutDays>=30)a.push({id:"month_tracking",icon:"📈",label:"Nutrition Nerd",desc:"30 days tracked"});
  // Streak
  let streak=0;const d=new Date();
  for(let i=0;i<365;i++){
    const ds=d.toISOString().split("T")[0];
    if(gymLogs.some(l=>l.date===ds)||runLogs.some(l=>l.date===ds))streak++;
    else if(i>0)break;
    d.setDate(d.getDate()-1);
  }
  if(streak>=7)a.push({id:"streak7",icon:"🔗",label:"Week Warrior",desc:"7-day streak"});
  if(streak>=30)a.push({id:"streak30",icon:"⛓️",label:"Monthly Machine",desc:"30-day streak"});
  return{achievements:a,streak};
}

// ══════════════════════════════════════
//  UI COMPONENTS
// ══════════════════════════════════════
const S={
  page:{padding:"10px 18px 18px"},
  card:{background:C.card,borderRadius:0,padding:14,marginBottom:8,border:`1px solid ${C.bdr}`,transition:"all .15s",animation:"mountIn .22s ease"},
  glow:{borderLeft:`3px solid ${C.acc}`,paddingLeft:12},
  lab:{fontFamily:F.m,fontSize:8,fontWeight:500,textTransform:"uppercase",letterSpacing:".14em",color:C.m,marginBottom:4},
  h2:{fontFamily:F.d,fontSize:26,fontWeight:400,marginBottom:12,letterSpacing:".06em",textTransform:"uppercase"},
  row:{display:"flex",alignItems:"center",gap:7},
  bet:{display:"flex",justifyContent:"space-between",alignItems:"center"},
  g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6},
  g3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6},
  g4:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5},
  btn:{fontFamily:F.m,fontWeight:500,fontSize:10,letterSpacing:".1em",textTransform:"uppercase",borderRadius:0,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .12s",width:"100%"},
  pri:{background:C.t,color:C.bg},sec:{background:"transparent",color:C.t,border:`1px solid ${C.bdr2}`},gho:{background:"transparent",color:C.d,padding:"5px 8px"},dan:{background:C.acc,color:"#fff"},
  inp:{fontFamily:F.m,fontSize:11,background:C.bg,color:C.t,border:`1px solid ${C.bdr}`,borderRadius:0,padding:"8px 10px",width:"100%",outline:"none",boxSizing:"border-box"},
  ta:{fontFamily:F.m,fontSize:11,background:C.bg,color:C.t,border:`1px solid ${C.bdr}`,borderRadius:0,padding:"8px 10px",width:"100%",outline:"none",resize:"vertical",minHeight:60,boxSizing:"border-box"},
  chip:{fontFamily:F.m,fontSize:8,letterSpacing:".08em",textTransform:"uppercase",padding:"4px 8px",borderRadius:0,border:`1px solid ${C.bdr}`,cursor:"pointer",transition:"all .12s",background:"transparent",color:C.d},
  chipOn:{background:C.t,borderColor:C.t,color:C.bg},
  tag:{fontFamily:F.m,fontSize:8,padding:"2px 6px",borderRadius:0,border:`1px solid ${C.bdr2}`,background:"transparent",color:C.d,fontWeight:500,textTransform:"uppercase",letterSpacing:".1em"},
  empty:{textAlign:"center",padding:"32px 16px",color:C.m},
  div:{height:1,background:C.bdr,margin:"12px 0"},
  tabBar:{position:"fixed",bottom:0,left:0,right:0,background:C.bg,borderTop:`2px solid ${C.t}`,display:"flex",justifyContent:"space-around",padding:"0 0 env(safe-area-inset-bottom,4px)",zIndex:100,maxWidth:480,margin:"0 auto"},
  modal:{position:"fixed",inset:0,background:"rgba(244,242,238,.88)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200},
  modalIn:{background:C.card,borderRadius:0,padding:20,width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",border:`1px solid ${C.t}`,borderBottom:"none",animation:"slideUp .2s ease"},
};
function P({children,active,onClick,style:x}){return<button onClick={onClick} style={{...S.chip,...(active?S.chipOn:{}),...x}}>{children}</button>}
function B({children,v="pri",style:x,...p}){const m={pri:S.pri,sec:S.sec,gho:S.gho,dan:S.dan};return<button style={{...S.btn,...(m[v]||S.pri),...x}} {...p}>{children}</button>}
function St({label,value,sub,icon:I,color}){return<div style={S.card}><div style={S.bet}><div><div style={S.lab}>{label}</div><div style={{fontFamily:F.m,fontSize:18,fontWeight:400,color:color||C.acc,lineHeight:1}}>{value}</div>{sub&&<div style={{color:C.m,fontSize:9,marginTop:3}}>{sub}</div>}</div>{I&&<I size={15} style={{color:color||C.acc,opacity:.25}}/>}</div></div>}
function Ld({text}){return<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:28,color:C.d}}><Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/><span style={{fontFamily:F.m,fontSize:10,letterSpacing:".1em",textTransform:"uppercase"}}>{text||"Loading..."}</span></div>}
function Md({children,onClose}){return<div style={S.modal} onClick={e=>e.target===e.currentTarget&&onClose?.()}><div style={S.modalIn}>{children}</div></div>}
function PB({value,max,color}){const p=max>0?Math.min(100,(value/max)*100):0;return<div style={{height:2,borderRadius:0,background:C.bdr,overflow:"hidden"}}><div style={{height:"100%",borderRadius:0,background:color||C.acc,width:`${p}%`,transition:"width .4s ease"}}/></div>}

// ══════════════════════════════════════
//  MUSCLE HEATMAP SVG
// ══════════════════════════════════════
function MuscleMap({vol}){
  const mc=m=>{const v=vol[m]||0;const{mev,mav,mrv}=MUSCLES[m];
    if(v===0)return C.m;if(v<mev)return"#3b82f6";if(v<=mav)return C.acc;if(v<=mrv)return C.o;return C.r;};
  const mo=m=>{const v=vol[m]||0;return v===0?.15:clamp(.3+v/20,.3,1)};
  // Simplified front body
  return(
    <svg viewBox="0 0 200 340" style={{width:"100%",maxWidth:160}}>
      {/* Head */}
      <ellipse cx="100" cy="28" rx="18" ry="22" fill={C.bdr} opacity=".5"/>
      {/* Neck/Traps */}
      <rect x="88" y="48" width="24" height="14" rx="4" fill={mc("traps")} opacity={mo("traps")}/>
      {/* Shoulders */}
      <ellipse cx="62" cy="68" rx="16" ry="12" fill={mc("shoulders")} opacity={mo("shoulders")}/>
      <ellipse cx="138" cy="68" rx="16" ry="12" fill={mc("shoulders")} opacity={mo("shoulders")}/>
      {/* Chest */}
      <ellipse cx="83" cy="85" rx="20" ry="16" fill={mc("chest")} opacity={mo("chest")}/>
      <ellipse cx="117" cy="85" rx="20" ry="16" fill={mc("chest")} opacity={mo("chest")}/>
      {/* Core */}
      <rect x="83" y="100" width="34" height="40" rx="6" fill={mc("core")} opacity={mo("core")}/>
      {/* Biceps */}
      <ellipse cx="52" cy="100" rx="9" ry="18" fill={mc("biceps")} opacity={mo("biceps")}/>
      <ellipse cx="148" cy="100" rx="9" ry="18" fill={mc("biceps")} opacity={mo("biceps")}/>
      {/* Triceps */}
      <ellipse cx="48" cy="102" rx="6" ry="16" fill={mc("triceps")} opacity={mo("triceps")}/>
      <ellipse cx="152" cy="102" rx="6" ry="16" fill={mc("triceps")} opacity={mo("triceps")}/>
      {/* Side Delts */}
      <ellipse cx="54" cy="70" rx="8" ry="10" fill={mc("side_delts")} opacity={mo("side_delts")}/>
      <ellipse cx="146" cy="70" rx="8" ry="10" fill={mc("side_delts")} opacity={mo("side_delts")}/>
      {/* Forearms */}
      <rect x="44" y="120" width="12" height="30" rx="5" fill={C.bdr} opacity=".3"/>
      <rect x="144" y="120" width="12" height="30" rx="5" fill={C.bdr} opacity=".3"/>
      {/* Quads */}
      <rect x="74" y="145" width="22" height="50" rx="8" fill={mc("quads")} opacity={mo("quads")}/>
      <rect x="104" y="145" width="22" height="50" rx="8" fill={mc("quads")} opacity={mo("quads")}/>
      {/* Hamstrings (behind quads, show as inner shading) */}
      <rect x="78" y="155" width="14" height="35" rx="5" fill={mc("hamstrings")} opacity={mo("hamstrings")*.5}/>
      <rect x="108" y="155" width="14" height="35" rx="5" fill={mc("hamstrings")} opacity={mo("hamstrings")*.5}/>
      {/* Glutes */}
      <ellipse cx="85" cy="148" rx="14" ry="10" fill={mc("glutes")} opacity={mo("glutes")}/>
      <ellipse cx="115" cy="148" rx="14" ry="10" fill={mc("glutes")} opacity={mo("glutes")}/>
      {/* Calves */}
      <rect x="76" y="200" width="16" height="36" rx="6" fill={mc("calves")} opacity={mo("calves")}/>
      <rect x="108" y="200" width="16" height="36" rx="6" fill={mc("calves")} opacity={mo("calves")}/>
      {/* Legend */}
      {[["Under MEV",C.b,260],["Optimal",C.acc,274],["High",C.o,288],["Over MRV",C.r,302]].map(([l,c,y])=>
        <g key={l}><rect x="55" y={y} width="7" height="7" rx="0" fill={c}/><text x="67" y={y+6} fill={C.d} fontSize="8" fontFamily={F.m}>{l}</text></g>
      )}
    </svg>
  );
}

// ══════════════════════════════════════
//  ONBOARDING
// ══════════════════════════════════════
function Onboard({onDone}){
  const[s,setS]=useState(0);
  const[p,setP]=useState({name:"Aiden",age:"18",weight:"",height:"",goal:"balanced",experience:"intermediate",daysPerWeek:"4",equipment:"full_gym",notes:""});
  const[k,setK]=useState("");
  const u=(f,v)=>setP(x=>({...x,[f]:v}));
  if(s===0)return(
    <div style={{textAlign:"center",padding:"52px 20px"}}>
      <div style={{width:56,height:56,border:`2px solid ${C.acc}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 22px",fontSize:22,color:C.acc}}>⚡</div>
      <h1 style={{fontFamily:F.d,fontSize:52,fontWeight:400,letterSpacing:".1em",textTransform:"uppercase"}}><span style={{color:C.acc}}>FORGE</span></h1>
      <p style={{color:C.d,fontFamily:F.m,fontSize:11,margin:"8px auto 4px",maxWidth:260,letterSpacing:".04em"}}>Hypertrophy-specialist AI training intelligence.</p>
      <p style={{color:C.m,fontFamily:F.m,fontSize:10,margin:"0 auto 36px",maxWidth:240,lineHeight:1.6,letterSpacing:".04em"}}>Coach. Nutritionist. Analyst. One app.</p>
      <B onClick={()=>setS(1)}>Get Started <ArrowRight size={13}/></B>
    </div>
  );
  if(s===1)return(
    <div>
      <h2 style={S.h2}>Profile</h2>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <div style={S.g2}><div><div style={S.lab}>Name</div><input style={S.inp} value={p.name} onChange={e=>u("name",e.target.value)}/></div>
          <div><div style={S.lab}>Age</div><input style={S.inp} type="number" value={p.age} onChange={e=>u("age",e.target.value)}/></div></div>
        <div style={S.g2}><div><div style={S.lab}>Weight (lbs)</div><input style={S.inp} type="number" value={p.weight} placeholder="165" onChange={e=>u("weight",e.target.value)}/></div>
          <div><div style={S.lab}>Height (in)</div><input style={S.inp} type="number" value={p.height} placeholder="70" onChange={e=>u("height",e.target.value)}/></div></div>
        <div><div style={S.lab}>Goal</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {[["strength","Strength"],["hypertrophy","Hypertrophy"],["balanced","Balanced"],["endurance","Endurance"]].map(([a,b])=><P key={a} active={p.goal===a} onClick={()=>u("goal",a)}>{b}</P>)}</div></div>
        <div><div style={S.lab}>Experience</div><div style={{display:"flex",gap:5}}>
          {[["beginner","Beginner"],["intermediate","Intermediate"],["advanced","Advanced"]].map(([a,b])=><P key={a} active={p.experience===a} onClick={()=>u("experience",a)}>{b}</P>)}</div></div>
        <div style={S.g2}><div><div style={S.lab}>Days/wk</div><div style={{display:"flex",gap:4}}>{["3","4","5","6"].map(n=><P key={n} active={p.daysPerWeek===n} onClick={()=>u("daysPerWeek",n)}>{n}</P>)}</div></div>
          <div><div style={S.lab}>Equip</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{[["full_gym","Gym"],["home","Home"],["minimal","Min"]].map(([a,b])=><P key={a} active={p.equipment===a} onClick={()=>u("equipment",a)}>{b}</P>)}</div></div></div>
        <div><div style={S.lab}>Notes</div><textarea style={S.ta} value={p.notes} placeholder="Injuries, preferences..." onChange={e=>u("notes",e.target.value)}/></div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:14}}><B v="sec" style={{flex:1}} onClick={()=>setS(0)}>Back</B><B style={{flex:2}} onClick={()=>setS(2)}>Continue</B></div>
    </div>
  );
  return(
    <div>
      <h2 style={S.h2}>AI Engine</h2>
      <p style={{color:C.d,fontFamily:F.m,fontSize:11,marginBottom:14,lineHeight:1.6,letterSpacing:".02em"}}>FORGE uses Claude for coaching, plan generation, nutrition, analysis, and weekly reviews. Key stays on-device.</p>
      <div style={S.lab}>Anthropic API Key</div>
      <input style={{...S.inp,fontSize:10}} type="password" value={k} placeholder="sk-ant-..." onChange={e=>setK(e.target.value)}/>
      <div style={{display:"flex",gap:6,marginTop:18}}><B v="sec" style={{flex:1}} onClick={()=>setS(1)}>Back</B>
        <B style={{flex:2}} onClick={async()=>{await ss(K.PROF,p);if(k.trim()){await ss(K.API,k.trim());localStorage.setItem(K.API,k.trim());}await ss(K.OB,true);onDone(p,k.trim())}}><Sparkles size={13}/> Launch</B></div>
    </div>
  );
}

// ══════════════════════════════════════
//  DEEP EXERCISE ANALYSIS
// ══════════════════════════════════════
function ExerciseDeep({name,gymLogs,onClose}){
  const info=getEx(name);
  const e1=allE1RM(gymLogs);
  const pr=e1[name.toLowerCase().trim()];
  const hist=exHistory(gymLogs,name);
  const sfrColors={"very high":C.acc,"high":"#86efac","moderate":C.o,"low":C.r};

  return(
    <Md onClose={onClose}>
      <div style={S.bet}><h3 style={{fontFamily:F.d,fontSize:22,fontWeight:400,textTransform:"uppercase",letterSpacing:".06em"}}>{name}</h3>
        <button onClick={onClose}><X size={15} style={{color:C.d}}/></button></div>
      {info?(
        <div style={{marginTop:10}}>
          {/* Tags */}
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
            {Object.entries(info.muscles).map(([m,w])=><span key={m} style={{...S.tag,background:C.bD,color:C.b}}>{MUSCLES[m]?.label||m} {Math.round(w*100)}%</span>)}
            <span style={S.tag}>{info.type}</span>
            <span style={{...S.tag,background:sfrColors[info.sfr]+"20",color:sfrColors[info.sfr]}}>SFR: {info.sfr}</span>
          </div>

          {/* e1RM */}
          {pr&&<div style={{...S.card,...S.glow,marginBottom:10}}>
            <div style={S.lab}>Estimated 1RM</div>
            <div style={{fontFamily:F.m,fontSize:32,fontWeight:400,color:C.acc,letterSpacing:"-.01em"}}>{pr.est}<span style={{fontSize:14,marginLeft:4,color:C.d}}>lbs</span></div>
            <div style={{color:C.d,fontFamily:F.m,fontSize:9,marginTop:2,letterSpacing:".04em"}}>{pr.r}×{pr.w}lbs · {fd(pr.date)}</div>
          </div>}

          {/* Progression Chart */}
          {hist.length>1&&<div style={{...S.card,marginBottom:10}}>
            <div style={S.lab}>e1RM Progression</div>
            <div style={{height:100,marginTop:4}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hist}><Line type="monotone" dataKey="e1rm" stroke={C.acc} strokeWidth={2} dot={{r:2,fill:C.acc}}/>
                  <XAxis dataKey="date" tick={{fill:C.m,fontSize:8,fontFamily:F.m}} axisLine={false} tickLine={false} tickFormatter={fd}/>
                  <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.t}`,borderRadius:0,fontFamily:F.m,fontSize:9}}/></LineChart>
              </ResponsiveContainer>
            </div>
          </div>}

          {/* Volume Trend */}
          {hist.length>1&&<div style={{...S.card,marginBottom:10}}>
            <div style={S.lab}>Session Volume (lbs)</div>
            <div style={{height:80,marginTop:4}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hist.slice(-10)}>
                  <Bar dataKey="volume" fill={C.b} radius={[0,0,0,0]}/>
                  <XAxis dataKey="date" tick={{fill:C.m,fontSize:7,fontFamily:F.m}} axisLine={false} tickLine={false} tickFormatter={fd}/>
                  <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.t}`,borderRadius:0,fontFamily:F.m,fontSize:9}}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>}

          {/* Effective Sets Analysis */}
          {hist.length>0&&hist.some(h=>h.totalSets>0)&&(
            <div style={{...S.card,marginBottom:10}}>
              <div style={S.lab}>Set Quality (last 5 sessions)</div>
              {hist.slice(-5).map((h,i)=>{
                const eff=h.effectiveSets;const tot=h.totalSets;const pct=tot>0?Math.round(eff/tot*100):0;
                return <div key={i} style={{...S.bet,padding:"3px 0"}}>
                  <span style={{fontFamily:F.m,fontSize:10,color:C.d}}>{fd(h.date)}</span>
                  <div style={S.row}>
                    <div style={{width:60}}><PB value={eff} max={tot} color={pct>=70?C.acc:pct>=50?C.o:C.r}/></div>
                    <span style={{fontFamily:F.m,fontSize:10,color:pct>=70?C.acc:C.o}}>{eff}/{tot} effective</span>
                  </div>
                </div>;
              })}
              <div style={{color:C.m,fontSize:10,marginTop:4}}>Effective = RPE ≥ 7 (within ~3 reps of failure)</div>
            </div>
          )}

          {/* Form Cues */}
          <div style={{marginBottom:10}}>
            <div style={S.lab}>Form Cues</div>
            {info.cues.map((c,i)=><div key={i} style={{color:C.d,fontSize:11,marginTop:3,display:"flex",gap:5}}>
              <span style={{color:C.acc,fontSize:8,marginTop:3}}>●</span>{c}</div>)}
          </div>

          {/* Substitutions */}
          <div>
            <div style={S.lab}>Smart Substitutions</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:3}}>
              {info.subs.map(s=><span key={s} style={{...S.chip,fontSize:9}}>{s}</span>)}</div>
          </div>
        </div>
      ):(
        <div style={{color:C.d,fontSize:12,marginTop:10}}>No database entry yet. Ask your Coach for analysis!</div>
      )}
    </Md>
  );
}

// ══════════════════════════════════════
//  LIVE WORKOUT MODE (with superset)
// ══════════════════════════════════════
function LiveMode({session,e1rms,onDone,onCancel,onExInfo}){
  const[ei,setEi]=useState(0);
  const[sets,setSets]=useState(()=>session.exercises?.map(ex=>
    Array.from({length:parseInt(ex.sets)||3},()=>({reps:"",weight:ex.weight||"",rpe:"",done:false})))||[]);
  const[resting,setResting]=useState(false);
  const[rt,setRt]=useState(0);
  const[rtMax,setRtMax]=useState(90);
  const[elapsed,setElapsed]=useState(0);
  const[started]=useState(Date.now());
  const rRef=useRef(null);const tRef=useRef(null);

  useEffect(()=>{tRef.current=setInterval(()=>setElapsed(Math.floor((Date.now()-started)/1000)),1000);return()=>clearInterval(tRef.current)},[started]);
  useEffect(()=>{if(resting){rRef.current=setInterval(()=>setRt(t=>{if(t+1>=rtMax){clearInterval(rRef.current);setResting(false);return 0}return t+1}),1000)}return()=>clearInterval(rRef.current)},[resting,rtMax]);

  const ex=session.exercises?.[ei];const exS=sets[ei]||[];
  const fmt=s=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
  const markSet=si=>{setSets(sets.map((x,i)=>i===ei?x.map((s,j)=>j===si?{...s,done:true}:s):x));setRtMax(parseInt(ex?.rest)||90);setRt(0);setResting(true)};
  const upSet=(si,f,v)=>setSets(sets.map((x,i)=>i===ei?x.map((s,j)=>j===si?{...s,[f]:v}:s):x));
  const finish=()=>onDone({id:uid(),date:session.date||td(),name:session.name||"Workout",type:"gym",duration:Math.round(elapsed/60),
    exercises:session.exercises.map((ex,i)=>({name:ex.name,sets:sets[i]?.filter(s=>s.done||s.reps||s.weight).map(s=>({reps:parseInt(s.reps)||0,weight:parseFloat(s.weight)||0,rpe:parseFloat(s.rpe)||null}))||[]})).filter(e=>e.sets.length>0)});
  const done=sets.flat().filter(s=>s.done).length;const total=sets.flat().length;
  const e1rm=e1rms[ex?.name?.toLowerCase().trim()];
  const isSuperset=ex?.superset;

  return(
    <div>
      <div style={{...S.bet,marginBottom:10}}>
        <button onClick={onCancel} style={{color:C.d,fontFamily:F.m,fontSize:9,letterSpacing:".1em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:3}}><ChevronLeft size={14}/>Exit</button>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:400,color:C.t,letterSpacing:".06em"}}>{fmt(elapsed)}</div>
        <B style={{padding:"6px 12px",fontSize:9,width:"auto"}} onClick={finish}><Check size={11}/> {done>=total?"Finish":"End"}</B>
      </div>
      <PB value={done} max={total}/>
      <div style={{...S.bet,margin:"5px 0 10px"}}><span style={{fontFamily:F.m,fontSize:9,color:C.m}}>{done}/{total} sets</span>
        <span style={{fontFamily:F.m,fontSize:9,color:C.m}}>Ex {ei+1}/{session.exercises?.length}</span></div>

      {resting&&<div style={{...S.card,...S.glow,textAlign:"center",marginBottom:10}}>
        <div style={S.lab}>Rest Timer</div>
        <div style={{fontFamily:F.d,fontSize:48,fontWeight:400,color:C.acc,letterSpacing:".04em",lineHeight:1}}>{fmt(rtMax-rt)}</div>
        <div style={{marginTop:6,marginBottom:4}}><PB value={rt} max={rtMax}/></div>
        <button style={{...S.btn,...S.gho,margin:"4px auto 0",width:"auto",fontSize:9,letterSpacing:".1em"}} onClick={()=>{clearInterval(rRef.current);setResting(false);setRt(0)}}>
          <SkipForward size={11}/> Skip</button>
      </div>}

      {ex&&<div style={S.card}>
        <div style={S.bet}>
          <div>
            {isSuperset&&<span style={{...S.tag,borderColor:C.p,color:C.p,marginBottom:5,display:"inline-block"}}>Superset</span>}
            <div style={{fontFamily:F.d,fontSize:19,fontWeight:400,letterSpacing:".05em",textTransform:"uppercase"}}>{ex.name}</div>
            <div style={{color:C.d,fontFamily:F.m,fontSize:10,marginTop:2,letterSpacing:".04em"}}>{ex.sets}×{ex.reps} {ex.weight?`@ ${ex.weight}lbs`:""} {ex.rest?`· ${ex.rest}s`:""}</div>
          </div>
          <button onClick={()=>onExInfo(ex.name)} style={{padding:4}}><Info size={14} style={{color:C.d}}/></button>
        </div>
        {e1rm&&<div style={{fontFamily:F.m,fontSize:9,color:C.acc,marginTop:3}}>e1RM: {e1rm.est}lbs</div>}
        <div style={{marginTop:10,display:"grid",gridTemplateColumns:"24px 1fr 1fr 44px 30px",gap:4,alignItems:"center"}}>
          <div style={{fontFamily:F.m,fontSize:8,color:C.m}}>#</div>
          <div style={{fontFamily:F.m,fontSize:8,color:C.m}}>REPS</div>
          <div style={{fontFamily:F.m,fontSize:8,color:C.m}}>LBS</div>
          <div style={{fontFamily:F.m,fontSize:8,color:C.m}}>RPE</div><div/>
          {exS.map((set,i)=><React.Fragment key={i}>
            <div style={{fontFamily:F.m,fontSize:11,color:set.done?C.acc:C.d,textAlign:"center"}}>{i+1}</div>
            <input style={{...S.inp,padding:"6px",fontSize:12,fontFamily:F.m,textAlign:"center",background:set.done?C.accD:C.bg2}} type="number" value={set.reps} placeholder={ex.reps?.toString().split("-")[0]||"—"} onChange={e=>upSet(i,"reps",e.target.value)}/>
            <input style={{...S.inp,padding:"6px",fontSize:12,fontFamily:F.m,textAlign:"center",background:set.done?C.accD:C.bg2}} type="number" value={set.weight} placeholder={ex.weight||"—"} onChange={e=>upSet(i,"weight",e.target.value)}/>
            <input style={{...S.inp,padding:"6px",fontSize:12,fontFamily:F.m,textAlign:"center"}} type="number" value={set.rpe} placeholder="—" onChange={e=>upSet(i,"rpe",e.target.value)}/>
            <button style={{width:28,height:28,borderRadius:0,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${set.done?C.acc:C.bdr}`,background:set.done?C.acc:"transparent"}} onClick={()=>!set.done&&markSet(i)}><Check size={11} style={{color:set.done?C.bg:C.bdr2}}/></button>
          </React.Fragment>)}
        </div>
      </div>}
      <div style={{display:"flex",gap:5,marginTop:6}}>
        <B v="sec" style={{flex:1}} disabled={ei===0} onClick={()=>setEi(ei-1)}><ChevronLeft size={13}/></B>
        <B v="sec" style={{flex:1}} disabled={ei>=(session.exercises?.length||1)-1} onClick={()=>setEi(ei+1)}><ChevronRight size={13}/></B>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:3,marginTop:10}}>
        {session.exercises?.map((_,i)=><button key={i} onClick={()=>setEi(i)} style={{width:i===ei?20:6,height:3,borderRadius:0,background:sets[i]?.every(s=>s.done)?C.acc:i===ei?C.t:C.bdr,transition:"all .2s"}}/>)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  HOOKS
// ══════════════════════════════════════
function useWindowSize(){
  const[w,setW]=useState(typeof window!=="undefined"?window.innerWidth:0);
  useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);
  return w;
}

// ══════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════
export default function App(){
  const[vw,setVw]=useState(window.innerWidth);
  const[ld,setLd]=useState(true);const[ob,setOb]=useState(false);const[tab,setTab]=useState("home");const[pay,setPay]=useState(null);
  const[prof,setProf]=useState(null);const[api,setApi]=useState("");const[plan,setPlan]=useState(null);
  const[gym,setGym]=useState([]);const[run,setRun]=useState([]);const[nut,setNut]=useState([]);const[hp,setHp]=useState([]);
  const[chat,setChat]=useState([]);const[body,setBody]=useState([]);const[rev,setRev]=useState(null);const[con,setCon]=useState([]);
  const[jour,setJour]=useState([]);const[exDp,setExDp]=useState(null);

  useEffect(()=>{(async()=>{
    const[a,b,c,d,e,f,g,h,i,j,k,l,m]=await Promise.all([sg(K.OB),sg(K.PROF),sg(K.API),sg(K.PLAN),sg(K.GYM),sg(K.RUN),sg(K.NUT),sg(K.HP),sg(K.CHAT),sg(K.BODY),sg(K.REV),sg(K.CON),sg(K.JOUR)]);
    setOb(!!a);setProf(b);setApi(c||localStorage.getItem(K.API)||"");setPlan(d);setGym(e||[]);setRun(f||[]);setNut(g||[]);setHp(h||[]);setChat(i||[]);setBody(j||[]);setRev(k);setCon(l||[]);setJour(m||[]);setLd(false);
  })()},[]);
  useEffect(()=>{const h=()=>setVw(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);

  const sv=async(k,v,set)=>{set(v);await ss(k,v)};
  const addGym=async l=>{const u=[...gym,l];sv(K.GYM,u,setGym)};
  const delGym=async id=>sv(K.GYM,gym.filter(l=>l.id!==id),setGym);
  const addRun=async l=>sv(K.RUN,[...run,l],setRun);
  const delRun=async id=>sv(K.RUN,run.filter(l=>l.id!==id),setRun);
  const addNut=async l=>sv(K.NUT,[...nut,l],setNut);
  const delNut=async id=>sv(K.NUT,nut.filter(l=>l.id!==id),setNut);
  const addJour=async e=>sv(K.JOUR,[...jour,e],setJour);

  const nav=(t,p)=>{setTab(t);setPay(p||null)};
  const e1=useMemo(()=>allE1RM(gym),[gym]);
  const rd=useMemo(()=>readiness(hp,gym,run,nut,prof),[hp,gym,run,nut,prof]);
  const wk=wkDates();
  const vol=useMemo(()=>muscleVolume(gym,wk),[gym]);
  const ach=useMemo(()=>computeAchievements(gym,run,nut,body),[gym,run,nut,body]);
  const prs=useMemo(()=>detectPRs(gym),[gym]);
  const st=useMemo(()=>stalls(gym),[gym]);

  const isMd=vw>=768;const isLg=vw>=1200;

  if(ld)return<div style={{fontFamily:F.b,background:C.bg,color:C.t,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><link href={FURL} rel="stylesheet"/><style>{CSS}</style><Ld text="Loading Forge..."/></div>;

  const appS={fontFamily:F.b,background:C.bg,color:C.t,minHeight:"100vh",maxWidth:isLg?1100:isMd?"100%":480,margin:"0 auto",position:"relative",paddingBottom:isLg?0:68,WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"};

  if(!ob)return<div style={appS}><link href={FURL} rel="stylesheet"/><style>{CSS}</style><div style={{...S.page,padding:isLg?"16px 36px 24px":isMd?"16px 28px 24px":"10px 18px 18px"}}><Onboard onDone={(p,k)=>{setProf(p);setApi(k);setOb(true)}}/></div></div>;

  // ── HOME ──
  const HomePage=()=>{
    const todS=plan?.sessions?.find(s=>s.date===td());
    const wkC=gym.filter(l=>wk.includes(l.date)).length+run.filter(l=>wk.includes(l.date)).length;
    const todN=nut.filter(n=>n.date===td());
    const todCal=todN.reduce((a,n)=>a+(n.calories||0),0);
    const todPro=todN.reduce((a,n)=>a+(n.protein||0),0);
    const tPro=Math.round((parseFloat(prof?.weight)||165)*.8);
    const sc=rd.score;const sCol=sc>=80?C.acc:sc>=60?C.gd:sc>=40?C.o:C.r;
    const[genR,setGenR]=useState(false);

    const genReview=async()=>{
      if(!api)return;setGenR(true);
      try{
        const wG=gym.filter(l=>wk.includes(l.date));const wR=run.filter(l=>wk.includes(l.date));const wN=nut.filter(l=>wk.includes(l.date));
        const d=await ai(api||"",
          "You are an elite hypertrophy coach writing a weekly review. Be specific with numbers. Reference actual lifts, volume, nutrition data. 3-4 paragraphs, warm but direct coaching voice. Plain text.",
          `Weekly review for ${prof?.name}.
PROFILE: ${prof?.age}yo, ${prof?.weight}lbs, Goal: ${prof?.goal}, ${prof?.experience}. Target ${prof?.daysPerWeek} days/week.
GYM (${wG.length}): ${wG.map(l=>`${l.date} ${l.name}: ${l.exercises?.map(e=>`${e.name} ${e.sets?.map(s=>`${s.reps}x${s.weight}`).join(",")}`).join("; ")}`).join("\n")||"None"}
RUNS (${wR.length}): ${wR.map(r=>`${r.distance}${r.unit} ${r.effort}`).join("; ")||"None"}
NUTRITION: ${wN.length>0?`~${Math.round(wN.reduce((a,m)=>a+m.calories,0)/Math.max(1,new Set(wN.map(m=>m.date)).size))}cal/day, ~${Math.round(wN.reduce((a,m)=>a+m.protein,0)/Math.max(1,new Set(wN.map(m=>m.date)).size))}gP/day`:"Not tracked"}
MUSCLE VOLUME: ${Object.entries(vol).filter(([_,v])=>v>0).map(([m,v])=>`${m}:${v}sets`).join(", ")||"None logged"}
STALLS: ${st.map(s=>`${s.ex} ~${s.e1rm}lbs`).join(", ")||"None"}
READINESS: ${sc}/100`);
        const txt=aT(d);const rv={date:td(),text:txt,weekOf:wk[0]};setRev(rv);await ss(K.REV,rv);
      }catch(e){console.error(e)}setGenR(false);
    };

    return(
      <div>
        <div style={{...S.bet,marginBottom:14}}>
          <div><div style={S.lab}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
            <h1 style={{fontFamily:F.d,fontSize:32,fontWeight:400,letterSpacing:".06em",textTransform:"uppercase"}}>Hey, {prof?.name}</h1></div>
          {ach.streak>0&&<span style={{...S.tag,display:"flex",alignItems:"center",gap:3,borderColor:C.acc,color:C.acc}}><Flame size={9}/>{ach.streak}d</span>}
        </div>

        {/* Readiness */}
        <div style={{...S.card,...S.glow}}>
          <div style={S.bet}>
            <div>
              <div style={S.lab}>Readiness Score</div>
              <div style={{fontFamily:F.d,fontSize:56,fontWeight:400,color:sCol,lineHeight:1,letterSpacing:".02em"}}>{sc}</div>
              <div style={{color:C.d,fontFamily:F.m,fontSize:10,marginTop:4,maxWidth:180,lineHeight:1.5,letterSpacing:".02em"}}>{rd.rec}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[["SLP",rd.bd.sleep,25],["REC",rd.bd.recovery,25],["VOL",rd.bd.load,25],["NUT",rd.bd.nutrition,25]].map(([l,v,m])=>
                <div key={l} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontFamily:F.m,fontSize:8,color:C.m,width:24,textAlign:"right",letterSpacing:".08em"}}>{l}</span>
                  <div style={{width:44,height:2,background:C.bdr}}><div style={{height:"100%",background:sCol,width:`${(v/m)*100}%`}}/></div>
                  <span style={{fontFamily:F.m,fontSize:8,color:sCol}}>{v}</span>
                </div>)}
            </div>
          </div>
        </div>

        {/* Today's Session */}
        <div style={{...S.card,cursor:"pointer"}} className="ch" onClick={()=>todS?nav("train",{session:todS}):nav("train")}>
          <div style={S.bet}><div style={S.lab}>Today's Session</div><ChevronRight size={13} style={{color:C.m}}/></div>
          {todS?<div><div style={{fontFamily:F.d,fontSize:18,fontWeight:400,letterSpacing:".05em",textTransform:"uppercase"}}>{todS.name}</div>
            <div style={{color:C.d,fontFamily:F.m,fontSize:10,marginTop:2,letterSpacing:".04em"}}>{todS.exercises?.length} exercises · ~{todS.duration||60}min</div></div>
          :<div style={{fontFamily:F.m,fontSize:12,color:C.d,letterSpacing:".04em"}}>{plan?"Rest Day":"No plan →"}</div>}
        </div>

        {/* Quick stats */}
        <div style={S.g3}>
          <St label="Sessions" value={`${wkC}/${prof?.daysPerWeek||4}`} icon={Target}/>
          <St label="Cals" value={todCal||"—"} icon={Flame} color={C.o}/>
          <St label="Protein" value={todPro?`${todPro}g`:"—"} sub={todPro?`/${tPro}g`:""} icon={Zap} color={C.p}/>
        </div>

        {/* Muscle Heatmap mini */}
        {Object.values(vol).some(v=>v>0)&&<div style={S.card}>
          <div style={S.bet}><div style={S.lab}>Muscle Volume (this week)</div>
            <button style={{...S.btn,...S.gho,width:"auto",fontSize:10,padding:"3px 6px"}} onClick={()=>nav("analyze")}>Details →</button></div>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <MuscleMap vol={vol}/>
            <div style={{flex:1,fontSize:10}}>
              {Object.entries(vol).filter(([_,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([m,v])=>{
                const{mev,mav,mrv,label}=MUSCLES[m];
                const col=v<mev?C.b:v<=mav?C.acc:v<=mrv?C.o:C.r;
                return<div key={m} style={{...S.bet,padding:"2px 0"}}>
                  <span style={{color:C.d,fontSize:10}}>{label}</span>
                  <span style={{fontFamily:F.m,fontSize:10,color:col}}>{v} sets</span>
                </div>;
              })}
            </div>
          </div>
        </div>}

        {/* Stall alerts */}
        {st.length>0&&<div style={{...S.card,borderColor:C.o,borderLeftWidth:3,paddingLeft:12}}>
          <div style={{...S.row,marginBottom:5}}><AlertTriangle size={11} style={{color:C.o}}/><span style={{fontFamily:F.m,fontSize:10,fontWeight:500,color:C.o,letterSpacing:".08em",textTransform:"uppercase"}}>Stall Detected</span></div>
          {st.map((s,i)=><div key={i} style={{color:C.d,fontFamily:F.m,fontSize:10,letterSpacing:".02em",textTransform:"capitalize"}}>{s.ex} — e1RM ~{s.e1rm}lbs</div>)}
        </div>}

        {/* PRs */}
        {prs.length>0&&<div style={S.card}>
          <div style={{...S.row,marginBottom:8}}><Trophy size={11} style={{color:C.gd}}/><span style={S.lab}>Recent PRs</span></div>
          {prs.slice(0,3).map((p,i)=><div key={i} style={{...S.bet,padding:"3px 0",borderBottom:i<2?`1px solid ${C.bdr}`:"none"}}>
            <span style={{fontFamily:F.m,fontSize:10,textTransform:"capitalize",letterSpacing:".02em"}}>{p.ex}</span>
            <span style={{fontFamily:F.m,fontSize:10,color:C.gd,letterSpacing:".04em"}}>{p.e1rm}lbs <span style={{color:C.m}}>+{p.e1rm-p.prev}</span></span>
          </div>)}
        </div>}

        {/* Week strip */}
        <div style={S.card}>
          <div style={S.lab}>Week</div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            {wk.map(d=>{const isT=d===td();const done=gym.some(l=>l.date===d)||run.some(l=>l.date===d);
              return<div key={d} style={{textAlign:"center",flex:1}}>
                <div style={{color:C.m,fontSize:8,fontFamily:F.m,letterSpacing:".06em"}}>{sd(d)}</div>
                <div style={{width:26,height:26,borderRadius:0,display:"flex",alignItems:"center",justifyContent:"center",
                  margin:"4px auto",fontSize:10,fontFamily:F.m,fontWeight:isT?600:400,
                  border:`1px solid ${isT?C.acc:done?C.bdr2:"transparent"}`,
                  background:isT?C.acc:done?C.accD:"transparent",color:isT?C.bg:done?C.acc:C.d}}>
                  {new Date(d+"T12:00:00").getDate()}</div>
              </div>})}
          </div>
        </div>

        {/* Weekly Review */}
        <div style={S.card}>
          <div style={S.bet}><div style={S.lab}>Weekly Review</div>
            <B v="gho" style={{fontSize:10}} onClick={genReview} disabled={genR||!api}>
              {genR?<Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/>:<><Sparkles size={11}/> Generate</>}</B></div>
          {rev?.text?<div style={{color:C.d,fontFamily:F.m,fontSize:10,lineHeight:1.7,marginTop:6,whiteSpace:"pre-wrap",letterSpacing:".01em"}}>{rev.text}</div>
          :<div style={{color:C.m,fontFamily:F.m,fontSize:10,letterSpacing:".04em"}}>Generate your AI coaching review.</div>}
        </div>

        {/* Quick log */}
        <div style={S.g3}>
          {[["Gym",Dumbbell,C.acc,"gym"],["Run",Route,C.b,"run"],["Meal",Utensils,C.o,"nutrition"]].map(([l,I,c,t])=>
            <button key={l} style={{...S.card,textAlign:"center",padding:14,cursor:"pointer",borderColor:C.bdr}} className="ch" onClick={()=>nav("track",{type:t})}>
              <I size={15} style={{color:c,marginBottom:5}}/><div style={{fontFamily:F.m,fontSize:8,letterSpacing:".12em",textTransform:"uppercase",color:C.d}}>{l}</div></button>)}
        </div>
      </div>
    );
  };

  // ── COACH ──
  const CoachPage=()=>{
    const[inp,setInp]=useState("");const[ldg,setLdg]=useState(false);const[err,setErr]=useState(null);const ref=useRef(null);
    const thoughts=["Analyzing your training data...","Checking volume landmarks...","Reviewing your recent sessions...","Calculating stimulus-to-fatigue...","Checking your readiness score...","Formulating response..."];
    const[tIdx,setTIdx]=useState(0);const[prog,setProg]=useState(0);
    useEffect(()=>{
      if(!ldg){setTIdx(0);setProg(0);return;}
      const ti=setInterval(()=>setTIdx(i=>(i+1)%thoughts.length),1500);
      const pi=setInterval(()=>setProg(p=>{if(p>=100)return 0;return p+(100/80);}),100);
      return()=>{clearInterval(ti);clearInterval(pi)};
    },[ldg]);
    useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"})},[chat]);

    const ctx=()=>{
      const recent=gym.slice(-5).map(l=>`${l.date} ${l.name}: ${l.exercises?.map(e=>`${e.name} ${e.sets?.map(s=>`${s.reps}x${s.weight}`).join(",")}`).join("; ")}`).join("\n");
      const todS=plan?.sessions?.find(s=>s.date===td());
      const volStr=Object.entries(vol).filter(([_,v])=>v>0).map(([m,v])=>{const{mev,mav,mrv,label}=MUSCLES[m];return`${label}:${v}sets(MEV${mev}/MAV${mav}/MRV${mrv})`}).join(", ");
      return`You are FORGE Coach — an elite hypertrophy specialist, S&C coach, and sports nutritionist. You think in terms of stimulus-to-fatigue ratios, effective reps, volume landmarks, and progressive overload.

CLIENT: ${prof?.name}, ${prof?.age}yo, ${prof?.weight||"?"}lbs. Goal: ${prof?.goal}. ${prof?.experience}. ${prof?.daysPerWeek} days/wk.

READINESS: ${rd.score}/100 (${rd.status}) — ${rd.rec}
TODAY: ${todS?`${todS.name} — ${todS.exercises?.map(e=>e.name).join(", ")}`:"Rest/no session"}
RECENT:\n${recent||"None"}
1RMs: ${Object.entries(e1).slice(0,10).map(([k,v])=>`${k}:${v.est}lbs`).join(", ")||"None"}
STALLS: ${st.map(s=>`${s.ex} ~${s.e1rm}lbs`).join(", ")||"None"}
WEEKLY VOLUME: ${volStr||"None"}

If asked to modify a workout, return JSON in \`\`\`json\`\`\` with session structure. Be concise — coaching between sets. Use their name. Reference actual numbers. When discussing exercises, mention SFR, effective reps, and muscle contributions.`;
    };

    const send=async()=>{
      if(!inp.trim()||!api)return;const msg=inp.trim();setInp("");setErr(null);
      const nc=[...chat,{role:"user",content:msg}];setChat(nc);setLdg(true);
      try{
        const cleanChat=nc.filter(m=>!m.content?.startsWith("Error:"));
        const d=await ai(api||"",ctx(),cleanChat.map(m=>({role:m.role,content:m.content})));
        let reply=aT(d);const jm=reply.match(/```json\s*([\s\S]*?)```/);
        if(jm){try{const s=JSON.parse(jm[1]);if(s.exercises&&plan?.sessions){
          setPlan({...plan,sessions:plan.sessions.map(x=>x.date===td()?{...x,...s}:x)});
          await ss(K.PLAN,{...plan,sessions:plan.sessions.map(x=>x.date===td()?{...x,...s}:x)});
          reply=reply.replace(/```json[\s\S]*?```/,"*(Session updated)*");
        }}catch{}}
        const uc=[...nc,{role:"assistant",content:reply}];setChat(uc);await ss(K.CHAT,uc.slice(-40));
      }catch(e){setErr(e.message)}setLdg(false);
    };

    return(
      <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 110px)"}}>
        <div style={S.bet}><h2 style={{...S.h2,marginBottom:0}}>Coach</h2>
          <span style={{...S.tag,borderColor:rd.score>=60?C.acc:C.o,color:rd.score>=60?C.acc:C.o}}>Rdns {rd.score}</span></div>
        <div style={{flex:1,overflowY:"auto",paddingTop:10}}>
          {chat.length===0&&<div style={{...S.empty,paddingTop:40}}>
            <Brain size={24} style={{color:C.bdr2,marginBottom:10}}/>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:400,letterSpacing:".08em",textTransform:"uppercase",color:C.d,marginBottom:10}}>Hypertrophy Coach</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {["Adjust today's workout — I'm beat","Am I overtraining chest?","What should I eat to hit protein?","My bench is stalled, analyze it","Generate a warmup for today","What if I add a 5th training day?"].map(q=>
                <button key={q} style={{...S.chip,fontSize:9,padding:"8px 10px",textAlign:"left",textTransform:"none",letterSpacing:".02em"}} onClick={()=>setInp(q)}>{q}</button>)}
            </div>
          </div>}
          {chat.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:8}}>
            {m.role==="user"
              ?<div style={{maxWidth:"85%",padding:"9px 12px",borderRadius:0,border:`1px solid ${C.acc}`,background:C.acc,color:C.bg,fontFamily:F.m,fontSize:11,lineHeight:1.6,whiteSpace:"pre-wrap",letterSpacing:".01em"}}>{m.content}</div>
              :<div dangerouslySetInnerHTML={{__html:marked(m.content)}} style={{maxWidth:"85%",padding:"9px 12px",borderRadius:0,border:`1px solid ${C.bdr}`,background:C.card,color:C.t,fontFamily:F.m,fontSize:11,lineHeight:1.7,letterSpacing:".01em"}}/>}
          </div>)}
          {ldg&&<div style={{display:"flex",marginBottom:8}}><div style={{padding:"10px 14px",border:`1px solid ${C.bdr}`,background:C.card,minWidth:220}}>
            <div style={{height:2,background:C.bdr2,marginBottom:8,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,height:"100%",width:`${prog}%`,background:C.acc,transition:"width .1s linear"}}/>
            </div>
            <div style={{fontFamily:F.m,fontSize:9,color:C.m,letterSpacing:".06em"}}>{thoughts[tIdx]}</div>
          </div></div>}
          <div ref={ref}/>
        </div>
        {err&&<div style={{fontFamily:F.m,fontSize:9,color:C.r,padding:"4px 0",letterSpacing:".04em"}}>{err}</div>}
        <div style={{display:"flex",gap:6,paddingTop:8,borderTop:`1px solid ${C.bdr}`}}>
          <input style={{...S.inp,flex:1}} value={inp} placeholder={api?"Ask your coach...":"Add API key in Settings"}
            disabled={!api} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}/>
          <button style={{width:38,height:38,borderRadius:0,border:`1px solid ${inp.trim()?C.acc:C.bdr}`,background:inp.trim()?C.acc:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
            onClick={send} disabled={!inp.trim()||ldg}><Send size={13} style={{color:inp.trim()?C.bg:C.bdr2}}/></button>
        </div>
      </div>
    );
  };

  // ── TRAIN ──
  const TrainPage=()=>{
    const[v,setV]=useState(pay?.session?"live":"plan");const[ldg,setLdg]=useState(false);const[err,setErr]=useState(null);
    const[liveSess,setLiveSess]=useState(pay?.session||null);

    const generate=async()=>{
      if(!api){setErr("Add API key");return}setLdg(true);setErr(null);
      try{
        const prsStr=Object.entries(e1).map(([k,v])=>`${k}: e1RM ${v.est}lbs`).join("\n");
        const volStr=Object.entries(vol).filter(([_,v])=>v>0).map(([m,v])=>`${MUSCLES[m]?.label}:${v}sets(MEV${MUSCLES[m]?.mev}/MAV${MUSCLES[m]?.mav}/MRV${MUSCLES[m]?.mrv})`).join("\n");
        const d=await ai(api||"",
          `Elite hypertrophy coach. Generate weekly plan as JSON. Use volume landmarks (MEV/MAV/MRV) to program appropriate volume per muscle group. Prescribe working weights as % of e1RM. Mark supersets with "superset":true on paired exercises. Include warmup notes.

Return ONLY: {"name":"","weekOf":"${wk[0]}","mesocycle":{"week":1,"phase":"hypertrophy","total_weeks":4},"sessions":[{"date":"","dayOfWeek":"","name":"","type":"gym","duration":60,"warmup":"5min cardio + dynamic stretching","exercises":[{"name":"","sets":4,"reps":"8-10","weight":"185","rest":"90","notes":"","e1rm_pct":75,"superset":false}]}],"notes":"","volume_targets":{}}`,
          `Plan for ${wk[0]}-${wk[6]}.
PROFILE: ${prof?.name}, ${prof?.age}yo, ${prof?.weight||"?"}lbs, ${prof?.goal}, ${prof?.experience}, ${prof?.daysPerWeek}d/wk, ${prof?.equipment}
NOTES: ${prof?.notes||"none"}

e1RMs:\n${prsStr||"None — appropriate starting weights for "+prof?.experience}
STALLS: ${st.map(s=>`${s.ex} ~${s.e1rm}lbs`).join(", ")||"None"}
CURRENT VOLUME:\n${volStr||"None — first week"}
READINESS: ${rd.score}/100

Program with progressive overload. If exercises are stalled, substitute or change rep scheme. Balance volume across muscle groups within their landmarks.`,{mt:8192});
        const p=aJ(aT(d));p.generatedAt=new Date().toISOString();setPlan(p);await ss(K.PLAN,p);
      }catch(e){setErr(e.message)}setLdg(false);
    };

    const syncCal=async()=>{
      if(!api||!plan?.sessions)return;setLdg(true);
      try{
        const sess=plan.sessions.filter(s=>s.exercises?.length);
        const desc=sess.map(s=>`Date:${s.date}, Title:"🏋️ ${s.name}", Duration:${s.duration||60}min, Desc:\n${s.exercises.map(e=>`• ${e.name}: ${e.sets}×${e.reps} ${e.weight?`@${e.weight}lbs`:""}`).join("\n")}`).join("\n\n");
        await ai(api||"","Create Google Calendar events for workouts at 6AM. Use workout name as title with 🏋️ prefix.",`Create events:\n\n${desc}`,{mcp:[{type:"url",url:"https://gcal.mcp.claude.com/mcp",name:"gcal"}]});
        alert("Synced!");
      }catch(e){setErr("Sync failed")}setLdg(false);
    };

    if(v==="live"&&liveSess)return<LiveMode session={liveSess} e1rms={e1} onDone={l=>{addGym(l);setV("plan");setLiveSess(null)}} onCancel={()=>{setV("plan");setLiveSess(null)}} onExInfo={setExDp}/>;

    return(
      <div>
        <div style={S.bet}><h2 style={{...S.h2,marginBottom:0}}>Train</h2>
          <div style={S.row}>
            {plan&&<B v="gho" style={{fontSize:10}} onClick={syncCal} disabled={ldg}><Calendar size={12}/></B>}
            <B style={{padding:"6px 12px"}} onClick={generate} disabled={ldg}>
              {ldg?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<><Sparkles size={12}/>{plan?"Regen":"Generate"}</>}</B>
          </div></div>
        {err&&<div style={{...S.card,borderColor:C.r,marginTop:8}}><span style={{fontSize:11,color:C.r}}>{err}</span></div>}

        {Object.keys(e1).length>0&&<div style={{...S.card,marginTop:10}}>
          <div style={S.lab}>Estimated 1RMs</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
            {Object.entries(e1).slice(0,8).map(([k,v])=>
              <button key={k} style={{...S.chip,fontSize:8}} onClick={()=>setExDp(k)}>
                <span style={{textTransform:"capitalize"}}>{k}</span><span style={{color:C.acc,marginLeft:4}}>{v.est}</span></button>)}
          </div></div>}

        {ldg&&!plan&&<Ld text="Building your plan..."/>}

        {plan&&<div style={{marginTop:10}}>
          <div style={{...S.card,borderColor:C.bdr2}}>
            <div style={S.bet}><div><div style={{fontFamily:F.d,fontSize:16,fontWeight:400,letterSpacing:".06em",textTransform:"uppercase"}}>{plan.name}</div>
              <div style={{color:C.m,fontFamily:F.m,fontSize:9,marginTop:1,letterSpacing:".06em"}}>Wk of {fd(plan.weekOf||wk[0])}{plan.mesocycle&&` · ${plan.mesocycle.phase} wk${plan.mesocycle.week}/${plan.mesocycle.total_weeks}`}</div></div>
              <span style={S.tag}>{plan.sessions?.filter(s=>s.exercises?.length).length} sessions</span></div>
            {plan.notes&&<div style={{color:C.d,fontFamily:F.m,fontSize:10,marginTop:6,lineHeight:1.6,letterSpacing:".02em"}}>{plan.notes}</div>}
          </div>
          {wk.map(d=>{const sess=plan.sessions?.find(s=>s.date===d);const isT=d===td();const done=gym.some(l=>l.date===d);
            return<div key={d} style={{...S.card,...(isT?S.glow:{}),opacity:done?.6:1,cursor:sess?.exercises?.length?"pointer":"default"}} className="ch"
              onClick={()=>sess?.exercises?.length&&!done&&(setLiveSess({...sess}),setV("live"))}>
              <div style={S.bet}>
                <div style={S.row}><div style={{width:28,height:28,borderRadius:0,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  border:`1px solid ${isT?C.acc:C.bdr}`,background:isT?C.acc:"transparent",
                  color:isT?C.bg:C.d,fontFamily:F.m,fontSize:11,fontWeight:500}}>{new Date(d+"T12:00:00").getDate()}</div>
                  <div><div style={{fontFamily:F.m,fontSize:11,fontWeight:500,letterSpacing:".02em"}}>{sess?.name||"Rest"}</div><div style={{color:C.m,fontFamily:F.m,fontSize:9,letterSpacing:".06em",textTransform:"uppercase"}}>{dn(d)}</div></div></div>
                {done&&<span style={{...S.tag,borderColor:C.acc,color:C.acc}}><Check size={8}/> Done</span>}
                {!done&&sess?.exercises?.length>0&&<Play size={12} style={{color:C.acc}}/>}
              </div>
              {sess?.warmup&&!done&&<div style={{color:C.m,fontFamily:F.m,fontSize:9,marginTop:5,letterSpacing:".02em"}}>{sess.warmup}</div>}
              {sess?.exercises?.length>0&&!done&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:7}}>
                {sess.exercises.map((ex,i)=><button key={i} style={{...S.chip,fontSize:8,padding:"3px 6px"}} onClick={e=>{e.stopPropagation();setExDp(ex.name)}}>
                  {ex.superset&&<span style={{color:C.p,marginRight:2}}>⟁</span>}{ex.name}{ex.weight&&<span style={{color:C.acc,marginLeft:3}}>{ex.weight}</span>}</button>)}</div>}
            </div>})}
        </div>}
      </div>
    );
  };

  // ── ANALYZE (Muscle Heatmap + Volume + PRs + Achievements) ──
  const AnalyzePage=()=>{
    const[sub,setSub]=useState("volume");

    const VolumeView=()=>(
      <div>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <MuscleMap vol={vol}/>
          <div style={{flex:1}}>
            <div style={S.lab}>Sets / Week vs Landmarks</div>
            {Object.entries(MUSCLES).map(([m,{label,mev,mav,mrv}])=>{
              const v=vol[m]||0;const col=v===0?C.m:v<mev?C.b:v<=mav?C.acc:v<=mrv?C.o:C.r;
              const status=v===0?"—":v<mev?"Under":v<=mav?"Optimal":v<=mrv?"High":"Over";
              return<div key={m} style={{marginBottom:6}}>
                <div style={{...S.bet,marginBottom:2}}><span style={{fontSize:10,color:C.d}}>{label}</span>
                  <span style={{fontFamily:F.m,fontSize:9,color:col}}>{v} ({status})</span></div>
                <div style={{display:"flex",height:3,borderRadius:0,background:C.bdr,overflow:"hidden",position:"relative"}}>
                  <div style={{position:"absolute",left:`${(mev/mrv)*100}%`,top:0,bottom:0,width:1,background:C.b+"80"}}/>
                  <div style={{position:"absolute",left:`${(mav/mrv)*100}%`,top:0,bottom:0,width:1,background:C.acc+"80"}}/>
                  <div style={{height:"100%",width:`${Math.min(100,(v/mrv)*100)}%`,background:col,borderRadius:0,transition:"width .4s"}}/>
                </div>
              </div>;
            })}
          </div>
        </div>
      </div>
    );

    const PRView=()=>(
      <div>
        <div style={S.lab}>Personal Records</div>
        {prs.length===0&&<div style={S.empty}><Trophy size={24} style={{color:C.m,marginBottom:6}}/><div style={{fontSize:12,color:C.d}}>Log more sessions to track PRs</div></div>}
        {prs.slice(0,20).map((p,i)=><div key={i} style={{...S.card,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:0,border:`1px solid ${C.gd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Trophy size={12} style={{color:C.gd}}/></div>
          <div style={{flex:1}}><div style={{fontFamily:F.m,fontSize:10,fontWeight:500,textTransform:"capitalize",letterSpacing:".02em"}}>{p.ex}</div>
            <div style={{color:C.m,fontFamily:F.m,fontSize:9,marginTop:1,letterSpacing:".04em"}}>{fd(p.date)} · {p.r}×{p.w}lbs</div></div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:F.m,fontSize:14,fontWeight:500,color:C.gd}}>{p.e1rm}</div>
            <div style={{fontFamily:F.m,fontSize:9,color:C.m}}>+{p.e1rm-p.prev}</div></div>
        </div>)}
      </div>
    );

    const AchView=()=>(
      <div>
        <div style={S.lab}>Achievements ({ach.achievements.length})</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {ach.achievements.map(a=><div key={a.id} style={{...S.card,textAlign:"center",padding:14,animation:"pop .3s ease"}}>
            <div style={{fontSize:20,marginBottom:6}}>{a.icon}</div>
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:400,letterSpacing:".06em",textTransform:"uppercase"}}>{a.label}</div>
            <div style={{color:C.m,fontFamily:F.m,fontSize:8,marginTop:3,letterSpacing:".04em"}}>{a.desc}</div>
          </div>)}
        </div>
        {ach.achievements.length===0&&<div style={S.empty}><Award size={24} style={{color:C.m}}/><div style={{fontSize:12,color:C.d,marginTop:6}}>Start training to earn achievements!</div></div>}
      </div>
    );

    return(
      <div>
        <h2 style={S.h2}>Analyze</h2>
        <div style={{display:"flex",gap:4,marginBottom:12}}>
          {[["volume","Volume"],["prs","PRs"],["achievements","Trophies"]].map(([k,l])=>
            <P key={k} active={sub===k} onClick={()=>setSub(k)}>{l}</P>)}
        </div>
        {sub==="volume"&&<VolumeView/>}
        {sub==="prs"&&<PRView/>}
        {sub==="achievements"&&<AchView/>}
      </div>
    );
  };

  // ── TRACK ──
  const TrackPage=()=>{
    const[sub,setSub]=useState(pay?.type||"log");const[act,setAct]=useState(pay?.type==="gym"||pay?.type==="run"||pay?.type==="nutrition"?pay.type:null);const[flt,setFlt]=useState("all");

    // Gym logger
    const GymLog=({onDone})=>{
      const[nm,setNm]=useState("");const[exs,setExs]=useState([{name:"",sets:[{reps:"",weight:"",rpe:""}]}]);const[notes,setNotes]=useState("");
      const addEx=()=>setExs([...exs,{name:"",sets:[{reps:"",weight:"",rpe:""}]}]);
      const addSet=i=>{const e=[...exs];const l=e[i].sets[e[i].sets.length-1]||{};e[i].sets=[...e[i].sets,{reps:l.reps||"",weight:l.weight||"",rpe:""}];setExs(e)};
      const upSet=(ei,si,f,v)=>{const e=[...exs];e[ei].sets=[...e[ei].sets];e[ei].sets[si]={...e[ei].sets[si],[f]:v};setExs(e)};
      return<div>
        <div style={S.bet}><h3 style={{...S.h2,marginBottom:0}}>Log Gym</h3><button onClick={()=>setAct(null)}><X size={16} style={{color:C.d}}/></button></div>
        <div style={{marginTop:8}}><div style={S.lab}>Name</div><input style={S.inp} value={nm} placeholder="Upper Push" onChange={e=>setNm(e.target.value)}/></div>
        {exs.map((ex,i)=><div key={i} style={{...S.card,marginTop:8}}>
          <div style={S.bet}><input style={{...S.inp,border:"none",padding:0,background:"transparent",fontWeight:600}} value={ex.name} placeholder="Exercise" onChange={e=>{const a=[...exs];a[i]={...a[i],name:e.target.value};setExs(a)}}/>
            <button onClick={()=>setExs(exs.filter((_,j)=>j!==i))}><Trash2 size={12} style={{color:C.m}}/></button></div>
          <div style={{display:"grid",gridTemplateColumns:"20px 1fr 1fr 42px",gap:4,marginTop:6,alignItems:"center"}}>
            <div style={{fontFamily:F.m,fontSize:7,color:C.m}}>#</div><div style={{fontFamily:F.m,fontSize:7,color:C.m}}>REPS</div><div style={{fontFamily:F.m,fontSize:7,color:C.m}}>LBS</div><div style={{fontFamily:F.m,fontSize:7,color:C.m}}>RPE</div>
            {ex.sets.map((s,j)=><React.Fragment key={j}>
              <div style={{fontFamily:F.m,fontSize:10,color:C.m,textAlign:"center"}}>{j+1}</div>
              <input style={{...S.inp,padding:5,fontSize:11,fontFamily:F.m,textAlign:"center"}} type="number" value={s.reps} onChange={e=>upSet(i,j,"reps",e.target.value)}/>
              <input style={{...S.inp,padding:5,fontSize:11,fontFamily:F.m,textAlign:"center"}} type="number" value={s.weight} onChange={e=>upSet(i,j,"weight",e.target.value)}/>
              <input style={{...S.inp,padding:5,fontSize:11,fontFamily:F.m,textAlign:"center"}} type="number" value={s.rpe} onChange={e=>upSet(i,j,"rpe",e.target.value)}/>
            </React.Fragment>)}
          </div>
          <button style={{...S.chip,marginTop:4,fontSize:9}} onClick={()=>addSet(i)}><Plus size={9}/> Set</button>
        </div>)}
        <B v="sec" style={{marginTop:6}} onClick={addEx}><Plus size={13}/> Exercise</B>
        <div style={{marginTop:8}}><div style={S.lab}>Notes</div><textarea style={S.ta} value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <B style={{marginTop:10}} onClick={()=>onDone({id:uid(),date:td(),name:nm||"Workout",type:"gym",
          exercises:exs.filter(e=>e.name).map(e=>({name:e.name,sets:e.sets.filter(s=>s.reps||s.weight).map(s=>({reps:parseInt(s.reps)||0,weight:parseFloat(s.weight)||0,rpe:parseFloat(s.rpe)||null}))})),notes})}><Check size={13}/> Save</B>
      </div>;
    };

    // Nutrition logger
    const NutLog=({onDone})=>{
      const[inp,setInp]=useState("");const[parsed,setParsed]=useState(null);const[ldg,setLdg]=useState(false);const[mode,setMode]=useState("ai");
      const[form,setForm]=useState({meal:"lunch",desc:"",cal:"",pro:"",carb:"",fat:""});
      const[photo,setPhoto]=useState(null);const fRef=useRef(null);
      const tPro=Math.round((parseFloat(prof?.weight)||165)*.8);
      const todPro=nut.filter(n=>n.date===td()).reduce((a,n)=>a+(n.protein||0),0);

      const parse=async()=>{
        if(!api)return;setLdg(true);
        try{const msgs=[{role:"user",content:photo?
          [{type:"image",source:{type:"base64",media_type:photo.type,data:photo.b64}},{type:"text",text:`Parse meal: "${inp}". JSON only: {"meal":"lunch","description":"...","items":[{"name":"","calories":0,"protein":0,"carbs":0,"fat":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0}}`}]
          :`Parse: "${inp}". JSON only: {"meal":"lunch","description":"...","items":[{"name":"","calories":0,"protein":0,"carbs":0,"fat":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0}}`}];
          const d=await ai(api||"","Nutrition expert. Parse meals to macros. Accurate servings. JSON ONLY.",msgs);
          const r=aJ(aT(d));setParsed(r);setForm({meal:r.meal||"lunch",desc:r.description||inp,cal:r.totals?.calories?.toString()||"",pro:r.totals?.protein?.toString()||"",carb:r.totals?.carbs?.toString()||"",fat:r.totals?.fat?.toString()||""});
        }catch{setMode("manual")}setLdg(false);
      };

      return<div>
        <div style={S.bet}><h3 style={{...S.h2,marginBottom:0}}>Log Meal</h3><button onClick={()=>setAct(null)}><X size={16} style={{color:C.d}}/></button></div>
        {(tPro-todPro)>0&&<div style={{...S.card,background:C.pD,borderColor:C.p+"30",marginTop:6}}>
          <span style={{fontFamily:F.m,fontSize:10,color:C.p}}>{tPro-todPro}g protein remaining</span></div>}
        {!parsed&&mode==="ai"&&<div style={{marginTop:8}}>
          <div style={S.lab}>What did you eat?</div>
          <textarea style={S.ta} value={inp} placeholder="Chipotle bowl double chicken..." onChange={e=>setInp(e.target.value)}/>
          <input ref={fRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>setPhoto({b64:r.result.split(",")[1],type:f.type,prev:r.result});r.readAsDataURL(f)}}/>
          {photo&&<img src={photo.prev} style={{width:"100%",maxHeight:120,objectFit:"cover",borderRadius:0,border:`1px solid ${C.bdr}`,marginTop:6}}/>}
          <div style={{display:"flex",gap:5,marginTop:6}}>
            <B style={{flex:2}} onClick={parse} disabled={ldg||(!inp.trim()&&!photo)||!api}>{ldg?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<><Sparkles size={12}/> Parse</>}</B>
            <B v="sec" style={{flex:0,padding:"8px 12px"}} onClick={()=>fRef.current?.click()}><Camera size={13}/></B>
            <B v="sec" style={{flex:1}} onClick={()=>setMode("manual")}>Manual</B>
          </div></div>}
        {(parsed||mode==="manual")&&<div style={{marginTop:8}}>
          {parsed?.items&&<div style={{...S.card,marginBottom:8}}><div style={S.lab}>Breakdown</div>
            {parsed.items.map((it,i)=><div key={i} style={{...S.bet,padding:"2px 0"}}><span style={{fontSize:11}}>{it.name}</span>
              <span style={{fontFamily:F.m,fontSize:10,color:C.d}}>{it.calories}cal {it.protein}gP</span></div>)}</div>}
          <div style={{display:"flex",gap:3,marginBottom:8}}>{["breakfast","lunch","dinner","snack"].map(m=><P key={m} active={form.meal===m} onClick={()=>setForm({...form,meal:m})}>{m}</P>)}</div>
          <div style={S.g4}>{[["cal","Cal"],["pro","Pro"],["carb","Carb"],["fat","Fat"]].map(([k,l])=><div key={k}><div style={{...S.lab,fontSize:8}}>{l}</div>
            <input style={{...S.inp,fontFamily:F.m,textAlign:"center",fontSize:11}} type="number" value={form[k]} placeholder="0" onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}</div>
          <B style={{marginTop:10}} onClick={()=>onDone({id:uid(),date:td(),type:"nutrition",meal:form.meal,description:form.desc||inp,
            calories:parseInt(form.cal)||0,protein:parseInt(form.pro)||0,carbs:parseInt(form.carb)||0,fat:parseInt(form.fat)||0,items:parsed?.items||[]})}><Check size={13}/> Save</B>
        </div>}
      </div>;
    };

    // Run logger
    const RunLog=({onDone})=>{
      const[f,setF]=useState({dist:"",dur:"",hr:"",effort:"moderate",notes:""});
      return<div>
        <div style={S.bet}><h3 style={{...S.h2,marginBottom:0}}>Log Run</h3><button onClick={()=>setAct(null)}><X size={16} style={{color:C.d}}/></button></div>
        <div style={{...S.g2,marginTop:8}}><div><div style={S.lab}>Distance (mi)</div><input style={S.inp} type="number" step=".1" value={f.dist} onChange={e=>setF({...f,dist:e.target.value})}/></div>
          <div><div style={S.lab}>Duration</div><input style={S.inp} value={f.dur} placeholder="25:30" onChange={e=>setF({...f,dur:e.target.value})}/></div></div>
        <div style={{...S.g2,marginTop:6}}><div><div style={S.lab}>Avg HR</div><input style={S.inp} type="number" value={f.hr} onChange={e=>setF({...f,hr:e.target.value})}/></div>
          <div><div style={S.lab}>Effort</div><div style={{display:"flex",gap:3}}>{["easy","moderate","hard"].map(e=><P key={e} active={f.effort===e} onClick={()=>setF({...f,effort:e})}>{e}</P>)}</div></div></div>
        <B style={{marginTop:12}} onClick={()=>onDone({id:uid(),date:td(),type:"run",distance:parseFloat(f.dist)||0,unit:"miles",duration:f.dur,heartRate:parseInt(f.hr)||null,effort:f.effort,notes:f.notes})}><Check size={13}/> Save</B>
      </div>;
    };

    // Journal
    const Journal=()=>{
      const[f,setF]=useState({energy:3,mood:3,motivation:3,sleep:3,soreness:"",notes:""});
      const todJ=jour.find(j=>j.date===td());
      return<div>
        <div style={S.lab}>Daily Journal</div>
        {todJ?<div style={S.card}><div style={{fontSize:12,color:C.d}}>Today's entry logged.</div>
          <div style={{display:"flex",gap:8,marginTop:6}}>{[["Energy",todJ.energy],["Mood",todJ.mood],["Drive",todJ.motivation],["Sleep",todJ.sleep]].map(([l,v])=>
            <div key={l} style={{textAlign:"center"}}><div style={{fontFamily:F.m,fontSize:8,color:C.m}}>{l}</div><div style={{fontFamily:F.m,fontSize:14,color:v>=4?C.acc:v>=3?C.gd:C.o}}>{v}/5</div></div>)}</div>
          {todJ.notes&&<div style={{color:C.d,fontSize:11,marginTop:6}}>{todJ.notes}</div>}</div>
        :<div style={S.card}>
          {[["Energy","energy"],["Mood","mood"],["Motivation","motivation"],["Sleep Quality","sleep"]].map(([l,k])=><div key={k} style={{marginBottom:8}}>
            <div style={{...S.bet,marginBottom:3}}><span style={{fontSize:11,color:C.d}}>{l}</span><span style={{fontFamily:F.m,fontSize:11,color:C.acc}}>{f[k]}/5</span></div>
            <div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(v=><button key={v} onClick={()=>setF({...f,[k]:v})}
              style={{flex:1,height:18,borderRadius:0,border:`1px solid ${f[k]>=v?C.acc:C.bdr}`,background:f[k]>=v?C.acc:"transparent",transition:"all .12s"}}/>)}</div>
          </div>)}
          <div style={{marginTop:4}}><div style={S.lab}>Notes</div><textarea style={S.ta} value={f.notes} placeholder="How are you feeling?" onChange={e=>setF({...f,notes:e.target.value})}/></div>
          <B style={{marginTop:8}} onClick={()=>{const e={id:uid(),date:td(),...f};addJour(e)}}><Check size={13}/> Save Entry</B>
        </div>}
        {jour.slice().reverse().slice(0,5).map(j=><div key={j.id} style={{...S.card,padding:10}}>
          <div style={S.bet}><span style={{fontFamily:F.m,fontSize:10,letterSpacing:".04em"}}>{fd(j.date)}</span>
            <div style={{display:"flex",gap:6}}>{[["E",j.energy],["M",j.mood],["D",j.motivation],["S",j.sleep]].map(([l,v])=>
              <span key={l} style={{fontFamily:F.m,fontSize:9,color:v>=4?C.acc:v>=3?C.gd:C.o}}>{l}:{v}</span>)}</div></div>
          {j.notes&&<div style={{color:C.d,fontSize:10,marginTop:3}}>{j.notes}</div>}
        </div>)}
      </div>;
    };

    // Body comp
    const BodyComp=()=>{
      const[f,setF]=useState({weight:"",waist:"",bf:""});
      const weightData=body.filter(b=>b.weight).map(b=>({d:fd(b.date),w:b.weight}));
      return<div>
        {weightData.length>1&&<div style={S.card}><div style={S.lab}>Weight</div><div style={{height:80,marginTop:4}}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={weightData}>
            <Line type="monotone" dataKey="w" stroke={C.acc} strokeWidth={2} dot={{r:2,fill:C.acc}}/>
            <XAxis dataKey="d" tick={{fill:C.m,fontSize:8,fontFamily:F.m}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.t}`,borderRadius:0,fontFamily:F.m,fontSize:9}}/></LineChart></ResponsiveContainer></div></div>}
        <div style={S.card}><div style={S.lab}>New Entry</div>
          <div style={S.g3}>{[["weight","Wt (lbs)"],["waist","Waist"],["bf","BF%"]].map(([k,l])=><div key={k}><div style={{...S.lab,fontSize:8}}>{l}</div>
            <input style={{...S.inp,fontFamily:F.m,textAlign:"center",fontSize:11}} type="number" step=".1" value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></div>)}</div>
          <B style={{marginTop:8}} onClick={async()=>{const e={id:uid(),date:td(),weight:parseFloat(f.weight)||null,waist:parseFloat(f.waist)||null,bf:parseFloat(f.bf)||null};
            const u=[...body,e];setBody(u);await ss(K.BODY,u);setF({weight:"",waist:"",bf:""})}}><Check size={12}/> Save</B></div>
      </div>;
    };

    // Health import
    const HealthImp=()=>{
      const[show,setShow]=useState(false);
      return<div style={S.card}>
        <div style={S.bet}><div><div style={S.lab}>Apple Watch</div><div style={{fontSize:11,color:C.d}}>Import health data</div></div>
          <B v="sec" style={{width:"auto",padding:"5px 10px",fontSize:10}} onClick={()=>setShow(!show)}><Upload size={11}/></B></div>
        {show&&<div style={{marginTop:8}}>
          <textarea id="himp" style={{...S.ta,fontFamily:F.m,fontSize:9}} placeholder='[{"date":"2026-03-15","steps":8500,"activeCalories":420,"restingHeartRate":62,"sleepHours":7.2}]'/>
          <B style={{marginTop:6}} onClick={()=>{try{const d=JSON.parse(document.getElementById("himp").value);if(Array.isArray(d)){ss(K.HP,d);window.location.reload()}}catch{alert("Invalid")}}}><Check size={12}/> Import</B>
        </div>}
      </div>;
    };

    if(act==="gym")return<div style={S.page}><GymLog onDone={l=>{addGym(l);setAct(null)}}/></div>;
    if(act==="run")return<div style={S.page}><RunLog onDone={l=>{addRun(l);setAct(null)}}/></div>;
    if(act==="nutrition")return<div style={S.page}><NutLog onDone={l=>{addNut(l);setAct(null)}}/></div>;

    const all=[...gym.map(l=>({...l,_t:"gym"})),...run.map(l=>({...l,_t:"run"})),...nut.map(l=>({...l,_t:"nutrition"}))]
      .filter(l=>flt==="all"||l._t===flt).sort((a,b)=>b.date.localeCompare(a.date));

    return<div>
      <div style={S.bet}><h2 style={{...S.h2,marginBottom:0}}>Track</h2>
        <div style={{display:"flex",gap:3}}>
          <B style={{padding:"6px 10px"}} onClick={()=>setAct("gym")}><Dumbbell size={12}/></B>
          <B style={{padding:"6px 10px",background:C.b,color:C.bg,border:"none"}} onClick={()=>setAct("run")}><Route size={12}/></B>
          <B style={{padding:"6px 10px",background:C.o,color:C.bg,border:"none"}} onClick={()=>setAct("nutrition")}><Utensils size={12}/></B>
        </div></div>
      <div style={{display:"flex",gap:3,marginTop:8,marginBottom:10}}>
        {[["log","Log"],["journal","Journal"],["body","Body"],["health","Health"]].map(([k,v])=><P key={k} active={sub===k} onClick={()=>setSub(k)}>{v}</P>)}</div>
      {sub==="log"&&<div>
        <div style={{display:"flex",gap:3,marginBottom:8}}>{[["all","All"],["gym","Gym"],["run","Runs"],["nutrition","Meals"]].map(([k,v])=><P key={k} active={flt===k} onClick={()=>setFlt(k)}>{v}</P>)}</div>
        {all.length===0&&<div style={S.empty}><BookOpen size={20} style={{color:C.m}}/><div style={{fontSize:11,color:C.d,marginTop:6}}>No logs yet</div></div>}
        {all.slice(0,30).map(l=><div key={l.id} style={S.card}>
          <div style={S.bet}><div style={S.row}>
            <div style={{width:24,height:24,borderRadius:0,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
              border:`1px solid ${l._t==="gym"?C.acc:l._t==="run"?C.b:C.o}`}}>
              {l._t==="gym"&&<Dumbbell size={11} style={{color:C.acc}}/>}{l._t==="run"&&<Route size={11} style={{color:C.b}}/>}{l._t==="nutrition"&&<Utensils size={11} style={{color:C.o}}/>}</div>
            <div><div style={{fontFamily:F.m,fontSize:11,letterSpacing:".02em"}}>{l._t==="nutrition"?(l.description||l.meal):(l.name||"Session")}</div>
              <div style={{color:C.m,fontSize:9}}>{fd(l.date)}</div></div></div>
            <button onClick={()=>l._t==="gym"?delGym(l.id):l._t==="run"?delRun(l.id):delNut(l.id)}><Trash2 size={11} style={{color:C.m}}/></button></div>
          {l._t==="gym"&&l.exercises?.slice(0,2).map((e,i)=><div key={i} style={{color:C.d,fontSize:10,marginTop:1}}>
            <button style={{background:"none",border:"none",color:C.d,fontSize:10,cursor:"pointer",textDecoration:"underline",textDecorationColor:C.bdr,padding:0}} onClick={()=>setExDp(e.name)}>{e.name}</button>: {e.sets?.map(s=>`${s.reps}×${s.weight||"BW"}`).join(", ")}</div>)}
          {l._t==="run"&&<div style={{color:C.d,fontSize:10,marginTop:2}}>{l.distance}mi · {l.duration||"—"} · {l.effort}</div>}
          {l._t==="nutrition"&&<div style={{display:"flex",gap:8,marginTop:2}}><span style={{fontFamily:F.m,fontSize:9,color:C.o}}>{l.calories}cal</span><span style={{fontFamily:F.m,fontSize:9,color:C.d}}>{l.protein}gP</span></div>}
        </div>)}</div>}
      {sub==="journal"&&<Journal/>}
      {sub==="body"&&<BodyComp/>}
      {sub==="health"&&<HealthImp/>}
    </div>;
  };

  // ── SETTINGS ──
  const SettingsPage=()=>{
    const[lk,setLk]=useState(api);const[lp,setLp]=useState(prof||{});const[saved,setSaved]=useState(false);const[nc,setNc]=useState("");
    const up=(f,v)=>setLp(x=>({...x,[f]:v}));
    const save=async()=>{const k=lk.trim();await ss(K.API,k);localStorage.setItem(K.API,k);await ss(K.PROF,lp);setApi(k);setProf(lp);setSaved(true);setTimeout(()=>setSaved(false),2000)};
    return<div>
      <h2 style={S.h2}>Settings</h2>
      <div style={S.card}><div style={{...S.lab,marginBottom:8}}>Profile</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <div style={S.g2}><div><div style={{...S.lab,fontSize:8}}>Name</div><input style={S.inp} value={lp.name||""} onChange={e=>up("name",e.target.value)}/></div>
            <div><div style={{...S.lab,fontSize:8}}>Weight</div><input style={S.inp} type="number" value={lp.weight||""} onChange={e=>up("weight",e.target.value)}/></div></div>
          <div><div style={{...S.lab,fontSize:8}}>Goal</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {[["strength","Str"],["hypertrophy","Hyp"],["balanced","Bal"],["endurance","End"]].map(([a,b])=><P key={a} active={lp.goal===a} onClick={()=>up("goal",a)}>{b}</P>)}</div></div>
          <div><div style={{...S.lab,fontSize:8}}>Days/wk</div><div style={{display:"flex",gap:3}}>{["3","4","5","6"].map(n=><P key={n} active={lp.daysPerWeek===n} onClick={()=>up("daysPerWeek",n)}>{n}</P>)}</div></div>
        </div></div>
      <div style={S.card}><div style={S.lab}>API Key</div>
        <input style={{...S.inp,fontFamily:F.m,fontSize:9}} type="password" value={lk} placeholder="sk-ant-..." onChange={e=>setLk(e.target.value)}/></div>
      <div style={S.card}><div style={{...S.lab,marginBottom:6}}><div style={S.row}><Users size={10}/>Accountability</div></div>
        {con.map(c=><div key={c.id} style={{...S.bet,padding:"4px 0"}}><span style={{fontSize:12}}>{c.name}</span>
          <button onClick={async()=>{const u=con.filter(x=>x.id!==c.id);setCon(u);await ss(K.CON,u)}}><X size={12} style={{color:C.m}}/></button></div>)}
        <div style={{display:"flex",gap:5,marginTop:6}}><input style={{...S.inp,flex:1}} value={nc} placeholder="Name" onChange={e=>setNc(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&nc.trim()){const u=[...con,{id:uid(),name:nc.trim()}];setCon(u);ss(K.CON,u);setNc("")}}}/>
          <B style={{width:"auto",padding:"8px 12px"}} onClick={()=>{if(!nc.trim())return;const u=[...con,{id:uid(),name:nc.trim()}];setCon(u);ss(K.CON,u);setNc("")}}><Plus size={12}/></B></div></div>
      <B style={{marginTop:4}} onClick={save}>{saved?<><Check size={12}/> Saved</>:"Save"}</B>
      <div style={S.div}/>
      <B v="dan" onClick={async()=>{if(!confirm("Reset all?"))return;for(const k of Object.values(K))try{await window.storage.delete(k)}catch{}window.location.reload()}}><Trash2 size={12}/> Reset</B>
    </div>;
  };

  // ── TABS ──
  const tabs=[{id:"home",label:"Home",icon:Home},{id:"coach",label:"Coach",icon:MessageCircle},{id:"train",label:"Train",icon:Dumbbell},{id:"analyze",label:"Analyze",icon:Crosshair},{id:"track",label:"Track",icon:BarChart3},{id:"settings",label:"Settings",icon:Settings}];

  const pageContent=(
    <>
      {tab==="home"&&<HomePage/>}
      {tab==="coach"&&<CoachPage/>}
      {tab==="train"&&<TrainPage/>}
      {tab==="analyze"&&<AnalyzePage/>}
      {tab==="track"&&<TrackPage/>}
      {tab==="settings"&&<SettingsPage/>}
    </>
  );

  const tabBarButtons=tabs.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setPay(null)}}
    style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 4px 4px",fontSize:7,fontWeight:500,fontFamily:F.b,letterSpacing:".1em",textTransform:"uppercase",
      color:tab===t.id?C.acc:C.m,transition:"color .15s",
      borderTop:tab===t.id?`2px solid ${C.acc}`:"2px solid transparent",
      marginTop:0,minWidth:isMd?56:44}}>
    <t.icon size={15} strokeWidth={tab===t.id?2:1.4}/><span>{t.label}</span></button>);

  // ── DESKTOP SHELL (≥ 1200px) ──
  if(isLg)return(
    <div style={{fontFamily:F.b,background:C.bg,color:C.t,width:"100vw",minHeight:"100vh",display:"flex",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"}}>
      <link href={FURL} rel="stylesheet"/><style>{CSS}</style>
      {exDp&&<ExerciseDeep name={exDp} gymLogs={gym} onClose={()=>setExDp(null)}/>}
      <div style={{display:"flex",width:"100%",minHeight:"100vh"}}>
        {/* Sidebar */}
        <div style={{width:220,flexShrink:0,background:C.bg2,borderRight:`1px solid ${C.bdr}`,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh"}}>
          <div style={{padding:"20px 20px 14px",borderBottom:`1px solid ${C.bdr}`}}>
            <div style={{fontFamily:F.d,fontSize:28,fontWeight:400,letterSpacing:".1em"}}><span style={{color:C.acc}}>FORGE</span></div>
            <div style={{fontFamily:F.m,fontSize:8,letterSpacing:".14em",textTransform:"uppercase",color:api?C.acc:C.m,marginTop:5}}>{api?"▪ AI LIVE":"▪ OFFLINE"}</div>
          </div>
          <nav style={{flex:1,padding:"8px 0",overflowY:"auto"}}>
            {tabs.map(t=><button key={t.id} onClick={()=>{setTab(t.id);setPay(null)}}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"12px 0 12px 13px",fontFamily:F.m,fontSize:10,letterSpacing:".1em",textTransform:"uppercase",
                color:tab===t.id?C.acc:C.m,background:"transparent",border:"none",
                borderLeft:tab===t.id?`3px solid ${C.acc}`:"3px solid transparent",
                transition:"all .15s",cursor:"pointer",textAlign:"left"}}>
              <t.icon size={14} strokeWidth={tab===t.id?2:1.4}/>{t.label}
            </button>)}
          </nav>
        </div>
        {/* Main content */}
        <div style={{flex:1,minWidth:0,padding:"0 24px 80px",overflowY:"auto",maxHeight:"100vh"}}>
          {pageContent}
        </div>
      </div>
    </div>
  );

  // ── TABLET SHELL (768–1199px) ──
  if(isMd)return(
    <div style={{...appS,maxWidth:"100%"}}>
      <link href={FURL} rel="stylesheet"/><style>{CSS}</style>
      {exDp&&<ExerciseDeep name={exDp} gymLogs={gym} onClose={()=>setExDp(null)}/>}
      <div style={{padding:"14px 28px 8px",...S.bet,borderBottom:`1px solid ${C.bdr}`}}>
        <div style={{fontFamily:F.d,fontSize:26,fontWeight:400,letterSpacing:".1em"}}><span style={{color:C.acc}}>FORGE</span></div>
        <div style={{fontFamily:F.m,fontSize:8,letterSpacing:".14em",textTransform:"uppercase",color:api?C.acc:C.m}}>{api?"▪ AI LIVE":"▪ OFFLINE"}</div>
      </div>
      <div style={{...S.page,padding:"16px 28px 18px"}}>
        {pageContent}
      </div>
      <div style={{...S.tabBar,maxWidth:"100%"}}>
        {tabBarButtons}
      </div>
    </div>
  );

  // ── MOBILE SHELL (< 768px) ──
  return(
    <div style={appS}>
      <link href={FURL} rel="stylesheet"/><style>{CSS}</style>
      {exDp&&<ExerciseDeep name={exDp} gymLogs={gym} onClose={()=>setExDp(null)}/>}
      <div style={{padding:"14px 18px 8px",...S.bet,borderBottom:`1px solid ${C.bdr}`}}>
        <div style={{fontFamily:F.d,fontSize:26,fontWeight:400,letterSpacing:".1em"}}><span style={{color:C.acc}}>FORGE</span></div>
        <div style={{fontFamily:F.m,fontSize:8,letterSpacing:".14em",textTransform:"uppercase",color:api?C.acc:C.m}}>{api?"▪ AI LIVE":"▪ OFFLINE"}</div>
      </div>
      <div style={S.page}>
        {pageContent}
      </div>
      <div style={S.tabBar}>
        {tabBarButtons}
      </div>
    </div>
  );
}
