import { Photo, cx } from './ui';

// Ilustrasi pengganti foto: jendela kayu menghadap Merapi saat senja,
// dengan karaf wedang uwuh di atas meja papan (mengikuti foto-foto di Instagram kedai).
export function WindowIllustration({ fit = 'slice' }) {
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio={`xMidYMid ${fit}`} className="block h-full w-full" role="img" aria-label="Ilustrasi jendela kedai menghadap Gunung Merapi saat senja">
      <defs>
        <linearGradient id="langit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2330" />
          <stop offset="0.55" stopColor="#8b5f60" />
          <stop offset="1" stopColor="#dca57d" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#langit)" />
      <circle cx="318" cy="268" r="16" fill="#f3c98a" />
      {/* Merapi: lereng curam di puncak lalu melandai */}
      <path d="M-40 352 C60 318 112 250 148 186 C158 168 166 160 176 158 L192 158 C202 159 210 166 222 184 C258 240 318 312 440 356 Z" fill="#574b63" />
      <path d="M176 158 C168 190 156 222 136 262 M192 158 C200 196 214 232 240 270" fill="none" stroke="#776a85" strokeWidth="2" opacity="0.45" />
      {/* asap tipis dari puncak */}
      <g fill="#ecdcd3" opacity="0.22">
        <ellipse cx="190" cy="146" rx="12" ry="7" />
        <ellipse cx="202" cy="132" rx="16" ry="8" />
        <ellipse cx="220" cy="118" rx="20" ry="9" />
        <ellipse cx="242" cy="106" rx="22" ry="8" />
      </g>
      {/* lautan awan */}
      <path d="M-10 318 C40 308 90 314 140 310 S240 304 290 310 S370 314 410 308 V330 H-10 Z" fill="#f1dccb" opacity="0.32" />
      <path d="M-10 330 C60 324 120 330 200 326 S330 322 410 328 V344 H-10 Z" fill="#f1dccb" opacity="0.2" />
      {/* perbukitan */}
      <path d="M0 344 Q60 322 120 338 T250 334 T400 340 V500 H0 Z" fill="#46503a" />
      <path d="M0 372 Q80 352 160 368 T320 362 T400 368 V500 H0 Z" fill="#33402d" />
      <path d="M0 402 Q100 384 200 398 T400 394 V500 H0 Z" fill="#232b1f" />
      {/* karaf & gelas wedang uwuh */}
      <rect x="280" y="378" width="14" height="22" rx="2" fill="#f4ecdc" opacity="0.28" />
      <path d="M272 400 h30 q8 0 8 10 v16 q0 6 -6 6 h-34 q-6 0 -6 -6 v-16 q0 -10 8 -10z" fill="#f4ecdc" opacity="0.22" />
      <path d="M266 410 h42 v16 q0 4 -4 4 h-34 q-4 0 -4 -4z" fill="#7a2418" />
      <rect x="238" y="410" width="18" height="22" rx="2" fill="#f4ecdc" opacity="0.24" />
      <rect x="240" y="418" width="14" height="12" rx="1" fill="#7a2418" />
      {/* meja papan */}
      <rect x="0" y="432" width="400" height="5" fill="#8a6440" />
      <rect x="0" y="437" width="400" height="22" fill="#6b4a2f" />
      <rect x="0" y="459" width="400" height="41" fill="#2c2017" />
      {/* kusen jendela */}
      <rect x="0" y="116" width="400" height="10" fill="#241a12" />
      <rect x="196" y="126" width="8" height="306" fill="#241a12" />
      <rect x="7" y="7" width="386" height="486" fill="none" stroke="#241a12" strokeWidth="14" />
    </svg>
  );
}

export default function MerapiWindow({ src, className }) {
  return (
    <figure className={cx('relative overflow-hidden rounded-[28px] border border-kertas/10 bg-kopi-900', className)}>
      <Photo
        src={src}
        alt="Pemandangan Gunung Merapi dari jendela kedai"
        className="h-full w-full object-cover"
        fallback={<WindowIllustration />}
      />
      <div className="grain pointer-events-none absolute inset-0" />
    </figure>
  );
}
