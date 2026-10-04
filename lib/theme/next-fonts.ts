import {
  Inter,
  Plus_Jakarta_Sans,
  DM_Sans,
  Outfit,
  Manrope,
  Nunito,
  Space_Grotesk,
  Fraunces,
  Playfair_Display,
  Cormorant_Garamond,
  DM_Serif_Display,
  Lora,
  Geist_Mono,
} from "next/font/google";

// Every selectable face is declared here so the admin/user font pickers can
// switch between them at runtime with just a CSS variable change. Only the
// two defaults are preloaded; the rest are fetched by the browser the first
// time a theme actually uses them (next/font emits @font-face for all, but a
// font file is only downloaded when text renders in it).

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], preload: false });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], preload: false });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], preload: false });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], preload: false });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], preload: false });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], preload: false });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], preload: false });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500", "600", "700"], preload: false });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400", preload: false });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], preload: false });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const fontVariableClasses = [
  inter, fraunces, jakarta, dmSans, outfit, manrope, nunito, spaceGrotesk, playfair, cormorant, dmSerif, lora, geistMono,
]
  .map((f) => f.variable)
  .join(" ");
