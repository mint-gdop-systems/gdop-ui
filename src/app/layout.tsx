import type { Metadata } from "next";

import "./globals.css";
import AppSidebar from "@/components/shared/app-sidebar";
import { ThemeProvider } from "@/components/shared/theme-provider";
import TopBar from "@/components/shared/top-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
            <SidebarInset className="px-5 py-2 shadow-none!">
              <TopBar />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
