import { Store } from "lucide-react";

// Courier logo components using realistic SVG designs

export const ButikLogo = () => (
  <div className="w-full h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded flex items-center justify-center">
    <Store className="w-4 h-4 text-white" />
  </div>
);

// JNE - Red with bold JNE text
export const JNELogo = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full">
    <rect width="100" height="50" fill="#D1232A" rx="4"/>
    <text x="50" y="34" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="24" fontFamily="Arial, sans-serif" letterSpacing="1">JNE</text>
  </svg>
);

// SiCepat - Orange with bird icon style
export const SiCepatLogo = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full">
    <rect width="100" height="50" fill="#FF6600" rx="4"/>
    <g transform="translate(10, 10)">
      <path d="M12 5C8 5 5 8 5 12C5 15 7 18 12 22C17 18 19 15 19 12C19 8 16 5 12 5Z" fill="#FFFFFF"/>
    </g>
    <text x="55" y="32" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="13" fontFamily="Arial, sans-serif">SiCepat</text>
  </svg>
);

// J&T - Red with distinctive J&T styling
export const JNTLogo = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full">
    <rect width="100" height="50" fill="#D92027" rx="4"/>
    <text x="50" y="32" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="18" fontFamily="Arial, sans-serif">J&amp;T</text>
    <text x="50" y="44" textAnchor="middle" fill="#FFFFFF" fontWeight="500" fontSize="8" fontFamily="Arial, sans-serif">EXPRESS</text>
  </svg>
);

// AnterAja - Green with Anter Aja text
export const AnterAjaLogo = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full">
    <rect width="100" height="50" fill="#00AA4F" rx="4"/>
    <text x="50" y="28" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="11" fontFamily="Arial, sans-serif">anter</text>
    <text x="50" y="40" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="11" fontFamily="Arial, sans-serif">aja</text>
  </svg>
);

export const courierLogos: Record<string, React.ReactNode> = {
  "Ambil di Butik": <ButikLogo />,
  "JNE REG": <JNELogo />,
  "JNE YES": <JNELogo />,
  "SiCepat REG": <SiCepatLogo />,
  "SiCepat BEST": <SiCepatLogo />,
  "J&T Express": <JNTLogo />,
  "AnterAja": <AnterAjaLogo />,
};
