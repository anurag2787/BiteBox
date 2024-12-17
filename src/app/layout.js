
import Navbar from "../Components/Navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthContextProvider } from "../app/context/AuthContext";
import { DarkModeProvider } from "./DarkModeContext";
import Footer from "@/Components/Footer";
import Ai from "@/Components/Ai/Ai";
import Cursor from "@/Components/Cursor/Cursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BiteBox",
  description: "Get the Recipes for any Cuisines.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className }>
        <AuthContextProvider>
          <DarkModeProvider>
          <Navbar />
          <Ai />
          <Cursor />
          {children}
          </DarkModeProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}