import type { Metadata } from "next";

import "./globals.css";
import AppSidebar from "@/components/shared/app-sidebar";
import { ThemeProvider } from "@/components/shared/theme-provider";
import TopBar from "@/components/shared/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "GDOP UI",
  description: "Custom shadcn/ui registry for GDOP",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="bg-card my-2 mr-2 w-full rounded-lg px-5 py-2">
              <TopBar />
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
