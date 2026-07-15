import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Keyframe | Q&A for Creatives",
  description: "A community-driven Q&A platform tailored for video editors, VFX artists, and graphic designers.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
