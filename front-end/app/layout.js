import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Qaamuuska Soomaaliga",
  description: "Somali to Somali Dictionary",
};

export default function RootLayout({ children }) {
  return (
    <html lang="so">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
