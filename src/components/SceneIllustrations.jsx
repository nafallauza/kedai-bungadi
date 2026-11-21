// Ilustrasi pengganti foto galeri, mengikuti suasana foto-foto di Instagram kedai.
// Akan otomatis tergantikan begitu foto asli ditaruh di public/images/.
const svgProps = { viewBox: '0 0 400 300', preserveAspectRatio: 'xMidYMid slice', className: 'block h-full w-full' };

export function LampScene() {
  return (
    <svg {...svgProps} role="img" aria-label="Ilustrasi lampu anyaman menyala">
      <defs>
        <radialGradient id="cahaya" cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#f3b85c" stopOpacity="0.45" />
          <stop offset="1" stopColor="#f3b85c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="kap" cx="0.5" cy="0.6" r="0.6">
          <stop offset="0" stopColor="#ffd98a" />
          <stop offset="1" stopColor="#b8681f" />
        </radialGradient>
        <clipPath id="bentuk-kap">
          <path d="M200 112 C236 112 254 150 248 182 C242 214 222 226 200 226 C178 226 158 214 152 182 C146 150 164 112 200 112 Z" />
        </clipPath>
      </defs>
      <rect width="400" height="300" fill="#16110c" />
      <circle cx="200" cy="175" r="150" fill="url(#cahaya)" />
      <line x1="200" y1="0" x2="200" y2="112" stroke="#3a2c1f" strokeWidth="2" />
      <path d="M200 112 C236 112 254 150 248 182 C242 214 222 226 200 226 C178 226 158 214 152 182 C146 150 164 112 200 112 Z" fill="url(#kap)" />
      <g clipPath="url(#bentuk-kap)" stroke="#7a3f12" strokeWidth="2" opacity="0.45">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={`a${i}`} x1={120 + i * 12} y1="100" x2={180 + i * 12} y2="240" />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <line key={`b${i}`} x1={280 - i * 12} y1="100" x2={220 - i * 12} y2="240" />
        ))}
      </g>
    </svg>
  );
}

export function CarafeScene() {
  return (
    <svg {...svgProps} role="img" aria-label="Ilustrasi karaf wedang uwuh di meja kayu">
      <defs>
        <linearGradient id="hijau" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9c2b0" />
          <stop offset="0.45" stopColor="#6f7a5c" />
          <stop offset="1" stopColor="#2c3626" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#hijau)" />
      <path d="M0 150 Q100 132 200 146 T400 140 V300 H0 Z" fill="#3d4a33" />
      <path d="M0 180 Q120 166 240 178 T400 172 V300 H0 Z" fill="#2a3424" />
      <rect x="0" y="222" width="400" height="6" fill="#8a6440" />
      <rect x="0" y="228" width="400" height="72" fill="#5c3f28" />
      <rect x="226" y="112" width="22" height="34" rx="3" fill="#f4ecdc" opacity="0.3" />
      <path d="M214 146 h46 q12 0 12 16 v52 q0 8 -8 8 h-54 q-8 0 -8 -8 v-52 q0 -16 12 -16z" fill="#f4ecdc" opacity="0.25" />
      <path d="M206 168 h64 v46 q0 6 -6 6 h-52 q-6 0 -6 -6z" fill="#7a2418" />
      <rect x="160" y="176" width="30" height="46" rx="3" fill="#f4ecdc" opacity="0.25" />
      <rect x="163" y="192" width="24" height="28" rx="2" fill="#7a2418" />
    </svg>
  );
}

export function BenchScene() {
  return (
    <svg {...svgProps} role="img" aria-label="Ilustrasi meja dan kursi kayu jadul">
      <defs>
        <linearGradient id="dinding" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9a7a2c" />
          <stop offset="1" stopColor="#4a3814" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#dinding)" />
      <rect x="0" y="232" width="400" height="68" fill="#241a12" />
      {/* meja */}
      <rect x="70" y="150" width="190" height="12" fill="#7a5636" />
      <rect x="80" y="162" width="8" height="74" fill="#5a3e27" />
      <rect x="242" y="162" width="8" height="74" fill="#5a3e27" />
      <rect x="80" y="196" width="170" height="6" fill="#5a3e27" />
      {/* kursi besi jadul */}
      <g fill="none" stroke="#d8d0c2" strokeWidth="5" strokeLinecap="round">
        <path d="M300 236 V110 M352 236 V110 M300 120 H352" />
        <path d="M300 182 H352 M296 236 L300 182 M356 236 L352 182" />
      </g>
      <rect x="296" y="176" width="60" height="9" rx="2" fill="#8a6440" />
      <rect x="300" y="126" width="52" height="22" rx="2" fill="#8a6440" />
    </svg>
  );
}
