const stars = [
  {cx:80,cy:60,r:1.5},{cx:155,cy:38,r:1},{cx:225,cy:82,r:2},{cx:305,cy:48,r:1},
  {cx:425,cy:68,r:1.5},{cx:505,cy:44,r:1},{cx:582,cy:92,r:2},{cx:655,cy:52,r:1},
  {cx:735,cy:74,r:1.5},{cx:812,cy:38,r:1},{cx:905,cy:63,r:2},{cx:985,cy:48,r:1},
  {cx:1062,cy:82,r:1.5},{cx:1145,cy:44,r:1},{cx:1225,cy:68,r:2},{cx:1305,cy:52,r:1},
  {cx:1382,cy:84,r:1.5},{cx:442,cy:132,r:1},{cx:562,cy:112,r:1.5},{cx:684,cy:142,r:1},
  {cx:802,cy:122,r:2},{cx:922,cy:105,r:1},{cx:1042,cy:132,r:1.5},{cx:1162,cy:115,r:1},
  {cx:1282,cy:142,r:1.5},{cx:132,cy:182,r:1},{cx:252,cy:162,r:1.5},{cx:372,cy:192,r:1},
  {cx:702,cy:172,r:1},{cx:1002,cy:182,r:1.5},{cx:1102,cy:162,r:1},{cx:1322,cy:178,r:1},
  {cx:462,cy:222,r:1},{cx:842,cy:212,r:1.5},{cx:1202,cy:202,r:1},{cx:180,cy:250,r:1},
  {cx:550,cy:265,r:1.5},{cx:1050,cy:240,r:1},{cx:1350,cy:255,r:1.5},{cx:750,cy:260,r:1},
];

const sparkles = [
  {x:388,y:205},{x:785,y:132},{x:1055,y:162},{x:1352,y:112},{x:952,y:248},
  {x:635,y:302},{x:205,y:292},{x:1255,y:282},{x:505,y:352},{x:1105,y:322},
  {x:158,y:138},{x:472,y:178},{x:870,y:95},{x:1420,y:175},{x:285,y:322},
];

export default function CastleBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#fce8f4"/>
            <stop offset="22%"  stopColor="#f5b0d8"/>
            <stop offset="52%"  stopColor="#e878b8"/>
            <stop offset="76%"  stopColor="#c04890"/>
            <stop offset="100%" stopColor="#8a2065"/>
          </linearGradient>
          <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,200,235,0)"/>
            <stop offset="100%" stopColor="rgba(255,215,240,0.82)"/>
          </linearGradient>
          <linearGradient id="castle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d8eeff"/>
            <stop offset="100%" stopColor="#98ccf0"/>
          </linearGradient>
          <linearGradient id="castle2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#cce8ff"/>
            <stop offset="100%" stopColor="#88c4f0"/>
          </linearGradient>
          <filter id="moonGlow">
            <feGaussianBlur stdDeviation="10" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="sparkleGlow">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* SKY */}
        <rect width="1440" height="900" fill="url(#sky)"/>

        {/* MOON */}
        <circle cx="330" cy="118" r="64" fill="rgba(255,255,255,0.9)" filter="url(#moonGlow)"/>
        <circle cx="360" cy="102" r="57" fill="#f0a0cc" opacity="0.72"/>

        {/* STARS */}
        {stars.map((s,i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={0.45+((i*7)%5)*0.11}/>
        ))}

        {/* SPARKLES */}
        {sparkles.map((s,i) => (
          <g key={i} transform={`translate(${s.x},${s.y})`} opacity="0.78" filter="url(#sparkleGlow)">
            <line x1="0" y1="-9" x2="0" y2="9"   stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="-9" y1="0" x2="9" y2="0"   stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="-5" y1="-5" x2="5" y2="5"  stroke="white" strokeWidth="0.7" strokeLinecap="round"/>
            <line x1="5"  y1="-5" x2="-5" y2="5" stroke="white" strokeWidth="0.7" strokeLinecap="round"/>
          </g>
        ))}

        {/* CONSTELLATION LINES */}
        <line x1="582" y1="92"  x2="655" y2="52"  stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>
        <line x1="655" y1="52"  x2="735" y2="74"  stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>
        <line x1="905" y1="63"  x2="985" y2="48"  stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>
        <line x1="985" y1="48"  x2="1062" y2="82" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>

        {/* ── LEFT CASTLE GROUP ── */}
        <ellipse cx="210" cy="620" rx="202" ry="54" fill="#6a2558" opacity="0.88"/>
        <ellipse cx="210" cy="614" rx="185" ry="36" fill="#7e3272" opacity="0.55"/>
        <ellipse cx="95"  cy="612" rx="38" ry="11" fill="#551846" opacity="0.7"/>
        <ellipse cx="325" cy="614" rx="32" ry="9"  fill="#551846" opacity="0.65"/>

        <rect x="40"  y="452" width="38" height="168" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="40,452 59,386 78,452" fill="#daf0ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[40,55,70].map(x=><rect key={x} x={x} y="444" width="9" height="12" fill="#daf0ff"/>)}

        <rect x="90"  y="394" width="58" height="226" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="90,394 119,316 148,394" fill="#daf0ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[90,107,124,141].map(x=><rect key={x} x={x} y="385" width="10" height="13" fill="#daf0ff"/>)}
        {[440,480,520,560].map(y=><rect key={y} x={110} y={y} width="13" height="19" rx="6" fill="rgba(200,240,255,0.5)"/>)}

        <rect x="160" y="255" width="100" height="365" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="160,255 210,163 260,255" fill="#e0f4ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[160,180,200,220,240].map(x=><rect key={x} x={x} y="244" width="14" height="16" fill="#e0f4ff"/>)}
        {[310,360,410,460,510].map(y=><rect key={y} x={193} y={y} width="19" height="27" rx="9" fill="rgba(200,240,255,0.52)"/>)}

        <rect x="268" y="408" width="56" height="212" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="268,408 296,336 324,408" fill="#daf0ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[268,285,302,319].map(x=><rect key={x} x={x} y="400" width="10" height="13" fill="#daf0ff"/>)}
        {[452,492].map(y=><rect key={y} x={282} y={y} width="12" height="18" rx="5" fill="rgba(200,240,255,0.5)"/>)}

        <rect x="330" y="460" width="36" height="160" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="330,460 348,400 366,460" fill="#daf0ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[330,345,360].map(x=><rect key={x} x={x} y="452" width="8" height="11" fill="#daf0ff"/>)}

        <rect x="90" y="562" width="276" height="58" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        {[0,1,2,3,4,5,6,7,8].map(i=><rect key={i} x={90+i*30} y="554" width="14" height="12" fill="#daf0ff"/>)}

        {/* ── RIGHT CASTLE 2 (mid-right) ── */}
        <ellipse cx="1040" cy="620" rx="148" ry="42" fill="#6a2558" opacity="0.82"/>

        <rect x="983" y="382" width="84" height="238" fill="url(#castle2)" stroke="#a8d4f8" strokeWidth="0.5"/>
        <polygon points="983,382 1025,300 1067,382" fill="#d8ecff" stroke="#98c8f0" strokeWidth="0.5"/>
        {[983,1000,1017,1034,1051].map(x=><rect key={x} x={x} y="373" width="11" height="14" fill="#d8ecff"/>)}
        {[428,470,512].map(y=><rect key={y} x={1016} y={y} width="15" height="23" rx="7" fill="rgba(200,236,255,0.5)"/>)}

        <rect x="940" y="440" width="50" height="180" fill="url(#castle2)" stroke="#a8d4f8" strokeWidth="0.5"/>
        <polygon points="940,440 965,376 990,440" fill="#d8ecff" stroke="#98c8f0" strokeWidth="0.5"/>
        {[940,956,972].map(x=><rect key={x} x={x} y="432" width="9" height="12" fill="#d8ecff"/>)}

        <rect x="1082" y="454" width="46" height="166" fill="url(#castle2)" stroke="#a8d4f8" strokeWidth="0.5"/>
        <polygon points="1082,454 1105,396 1128,454" fill="#d8ecff" stroke="#98c8f0" strokeWidth="0.5"/>
        {[1082,1096,1110].map(x=><rect key={x} x={x} y="446" width="8" height="11" fill="#d8ecff"/>)}

        <rect x="940" y="566" width="228" height="54" fill="url(#castle2)" stroke="#a8d4f8" strokeWidth="0.5"/>
        {[0,1,2,3,4,5,6].map(i=><rect key={i} x={940+i*30} y="558" width="13" height="12" fill="#d8ecff"/>)}

        {/* ── RIGHT CASTLE 1 (tallest) ── */}
        <ellipse cx="1285" cy="600" rx="178" ry="50" fill="#6a2558" opacity="0.88"/>
        <ellipse cx="1285" cy="594" rx="160" ry="34" fill="#7e3272" opacity="0.52"/>

        <rect x="1130" y="468" width="38" height="132" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="1130,468 1149,410 1168,468" fill="#daf0ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[1130,1144,1158].map(x=><rect key={x} x={x} y="460" width="8" height="11" fill="#daf0ff"/>)}

        <rect x="1178" y="406" width="64" height="194" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="1178,406 1210,330 1242,406" fill="#daf0ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[1178,1195,1212,1229].map(x=><rect key={x} x={x} y="397" width="10" height="13" fill="#daf0ff"/>)}
        {[446,482,518].map(y=><rect key={y} x={1203} y={y} width="14" height="22" rx="7" fill="rgba(200,240,255,0.5)"/>)}

        <rect x="1252" y="265" width="96" height="335" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="1252,265 1300,175 1348,265" fill="#e0f4ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[1252,1271,1290,1309,1328].map(x=><rect key={x} x={x} y="255" width="13" height="16" fill="#e0f4ff"/>)}
        {[315,363,411,459].map(y=><rect key={y} x={1291} y={y} width="18" height="27" rx="9" fill="rgba(200,240,255,0.52)"/>)}

        <rect x="1356" y="402" width="58" height="198" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="1356,402 1385,328 1414,402" fill="#daf0ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[1356,1373,1390,1407].map(x=><rect key={x} x={x} y="393" width="10" height="13" fill="#daf0ff"/>)}
        {[446,484].map(y=><rect key={y} x={1373} y={y} width="12" height="19" rx="6" fill="rgba(200,240,255,0.5)"/>)}

        <rect x="1414" y="468" width="34" height="132" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        <polygon points="1414,468 1431,410 1448,468" fill="#daf0ff" stroke="#a0d0f0" strokeWidth="0.5"/>
        {[1414,1428,1442].map(x=><rect key={x} x={x} y="459" width="7" height="11" fill="#daf0ff"/>)}

        <rect x="1130" y="548" width="318" height="52" fill="url(#castle)" stroke="#b0d8f8" strokeWidth="0.5"/>
        {[0,1,2,3,4,5,6,7,8,9].map(i=><rect key={i} x={1130+i*30} y="540" width="13" height="12" fill="#daf0ff"/>)}

        {/* ── CENTER STAIRS ── */}
        {[0,1,2,3,4,5,6,7,8,9,10].map(i => {
          const spread = 188 - i*13;
          const y = 900 - i*38;
          return (
            <rect key={i} x={720-spread} y={y-36} width={spread*2} height={36}
              fill={`rgba(${148-i*2},${58+i*2},${102-i*2},${0.72+i*0.02})`}
              stroke="rgba(180,80,130,0.28)" strokeWidth="0.5"/>
          );
        })}

        {/* ── FOREGROUND CRYSTALS ── */}
        <polygon points="28,825 50,758 72,825" fill="rgba(155,75,200,0.52)" stroke="rgba(195,115,240,0.62)" strokeWidth="1"/>
        <polygon points="58,848 84,772 110,848" fill="rgba(135,55,178,0.56)" stroke="rgba(175,95,218,0.62)" strokeWidth="1"/>
        <polygon points="8,865 32,798 56,865" fill="rgba(175,98,220,0.46)" stroke="rgba(205,135,250,0.52)" strokeWidth="1"/>
        <polygon points="1352,852 1374,782 1396,852" fill="rgba(155,75,200,0.52)" stroke="rgba(195,115,240,0.62)" strokeWidth="1"/>
        <polygon points="1384,872 1410,792 1436,872" fill="rgba(135,55,178,0.56)" stroke="rgba(175,95,218,0.62)" strokeWidth="1"/>
        <polygon points="1402,842 1421,776 1440,842" fill="rgba(175,98,220,0.46)" stroke="rgba(205,135,250,0.52)" strokeWidth="1"/>

        {/* ── FLOWERS ── */}
        <circle cx="58"   cy="876" r="9" fill="rgba(225,95,158,0.72)"/>
        <circle cx="42"   cy="868" r="6" fill="rgba(242,118,178,0.62)"/>
        <circle cx="74"   cy="870" r="5" fill="rgba(202,75,140,0.68)"/>
        <rect x="61"  y="876" width="3" height="24" fill="rgba(75,135,55,0.5)"/>
        <circle cx="112"  cy="882" r="7" fill="rgba(225,95,158,0.7)"/>
        <rect x="114" y="882" width="3" height="18" fill="rgba(75,135,55,0.5)"/>
        <circle cx="1382" cy="876" r="9" fill="rgba(225,95,158,0.72)"/>
        <circle cx="1398" cy="870" r="6" fill="rgba(242,118,178,0.62)"/>
        <rect x="1385" y="876" width="3" height="24" fill="rgba(75,135,55,0.5)"/>
        <circle cx="1340" cy="882" r="7" fill="rgba(225,95,158,0.7)"/>
        <rect x="1342" y="882" width="3" height="18" fill="rgba(75,135,55,0.5)"/>

        {/* ── BOTTOM MIST ── */}
        <rect x="0" y="718" width="1440" height="182" fill="url(#mist)"/>
        <ellipse cx="300"  cy="875" rx="355" ry="82" fill="rgba(255,210,238,0.35)"/>
        <ellipse cx="1105" cy="864" rx="305" ry="72" fill="rgba(255,210,238,0.35)"/>
        <ellipse cx="720"  cy="900" rx="510" ry="92" fill="rgba(255,215,240,0.42)"/>
      </svg>
    </div>
  );
}
