
import Navbar from "../Components/Navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthContextProvider } from "../app/context/AuthContext";
import { DarkModeProvider } from "./DarkModeContext";
import Ai from "@/Components/Ai/Ai";
import Cursor from "@/Components/Cursor/Cursor";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BiteBox",
  description: "Get the Recipes for any Cuisines.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <Script id="dark-mode-script" strategy="beforeInteractive">
        {`
          (function() {
            try {
              const savedMode = localStorage.getItem('darkMode');
              const darkMode = savedMode ? savedMode === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (darkMode) {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          })();
        `}
      </Script>
      <AuthContextProvider>
        <DarkModeProvider>
        <div className="relative min-h-screen">
          <div className="top-0 left-0 right-0 ">
          <Navbar />
          </div>
          <div className="-z-50">
          <div className="fixed inset-0 pointer-events-none z-50">
          <Cursor />
          </div>
          {children}
          </div>
        </div>
        <Ai />
        </DarkModeProvider>
      </AuthContextProvider>
      </body>
    </html>
  );
}