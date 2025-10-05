import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title:
    "Qaamuuska Soomaaliga | Somali to Somali Dictionary | Eray Bixin & Fasiraad",
  description:
    "Qaamuuska Soomaaliga waa eray bixin Soomaaliyeed oo online ah. Ka raadi erayo Soomaali ah oo leh fasiraad Soomaali ah. Waxay ku habboon tahay ardayda, turjumayaasha, macallimiinta iyo dadka xiiseeya af Soomaaliga.",
  keywords: [
    "Qaamuus Soomaali",
    "Qaamuuska Soomaaliga",
    "Somali Dictionary",
    "Somali to Somali Dictionary",
    "Eray bixin Soomaali",
    "Fasiraad Soomaali",
    "Af Soomaali",
    "Somali language",
    "Somali vocabulary",
    "Learn Somali",
    "Turjumaad Soomaali",
    "Somali lexicon",
    "Qaamuus Afsomali",
    "qaamuuska Afka Soomaaliga",
  ],
  authors: [{ name: "Qaamuuska Soomaaliga Team" }],
  creator: "Qaamuuska Soomaaliga",
  publisher: "Qaamuuska Soomaaliga",

  openGraph: {
    title: "Qaamuuska Soomaaliga - Somali to Somali Dictionary",
    description:
      "Ka hel fasiraad buuxda oo Soomaali ah eray kasta oo aad rabto. Qaamuus Online ah oo Af-Soomaali ku qoran.",
    url: "https://somali-to-somali-dictionary.vercel.app/",
    siteName: "Qaamuuska Soomaaliga",
    locale: "so_SO",
    type: "website",
    // images: [
    //   {
    //     url: "https://YOURDOMAIN.com/og-image.jpg",
    //     width: 1200,
    //     height: 630,
    //     alt: "Qaamuuska Soomaaliga - Somali Dictionary",
    //   },
    // ],
  },

  // twitter: {
  //   card: "summary_large_image",
  //   title: "Qaamuuska Soomaaliga - Somali Dictionary",
  //   description:
  //     "Somali to Somali Dictionary | Eray bixin iyo fasiraad buuxda oo Af Soomaali ah.",
  //   images: ["https://YOURDOMAIN.com/og-image.jpg"],
  // },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  alternates: {
    canonical: "https://somali-to-somali-dictionary.vercel.app",
  },

  other: {
    google: "notranslate", // disables auto-translation
  },
  icons: {
    icon: "/favicon.ico", // <-- This is where you add your favicon
  },
};

export default function RootLayout({ children }) {
  if (typeof window !== "undefined") {
    // Disable Chrome translation popup
    document.documentElement.setAttribute("translate", "no");

    // Attempt to remove existing translation banners injected by Google
    const observer = new MutationObserver(() => {
      const translateBar = document.querySelector(
        ".goog-te-banner-frame, .VIpgJd-ZVi9od-ORHb, .VIpgJd-ZVi9od-xl07Ob"
      );
      if (translateBar) translateBar.remove();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
  return (
    <html lang="so" translate="no">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
