import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner'
import AuthProvider from '@/components/AuthProvider'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SyncTune - Sync Music with Friends",
  description: "Listen to music together with friends in perfect sync",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <AuthProvider>
            {children}
            <Toaster position="bottom-right" />
          </AuthProvider>
        </body>
    </html>
  );
}
