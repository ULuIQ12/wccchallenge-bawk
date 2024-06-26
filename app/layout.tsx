import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThreeCanvas from "@/components/threecanvas";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "BAWK",
  description: "Bawk, bawk, bawk!",
  /*
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon.ico",
  },*/
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThreeCanvas/>
        <div id="react-div">
          {children}
        </div>
      </body>
    </html>
  );
}
