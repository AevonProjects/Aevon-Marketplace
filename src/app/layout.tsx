import "./globals.css";
import { Header } from "@/components/Header";

export const metadata = {
  title: "Aevon Marketplace",
  description: "Premium Minecraft plugins by Aevon."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
