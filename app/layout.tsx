"use client";
import AppTitleBar from "@/components/costume/title_bar";
import "./globals.css";
import { ProfileAndSettingsProvider } from "@/context/profile_context";
import { ThemeProvider } from "next-themes";
import { ChatContext } from "@/context/chat_context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/costume/app_sidebar";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
        {/* Inline script to set theme before React loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var storedTheme = localStorage.getItem('theme');
                  var theme = storedTheme || (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased no-scroll overflow-x-hidden overflow-y-hidden bg-white flex h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <ChatContext>
              <AppTitleBar />
              <ProfileAndSettingsProvider>
                <div className="flex h-screen w-full">
                  <AppSidebar />
                  <main className="flex-1 h-full overflow-y-auto">
                    {children}
                  </main>
                </div>
              </ProfileAndSettingsProvider>
            </ChatContext>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
