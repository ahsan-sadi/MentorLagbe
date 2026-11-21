import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { StoreProvider } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
})

export const metadata = {
  title: {
    default: "MentorLagbe — Find Your Ideal Tutor or Mentorship Batch",
    template: "%s · MentorLagbe",
  },
  description:
    "MentorLagbe connects Bangladeshi students with verified tutors and mentorship batches for classes, board exams, admission tests and beyond.",
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        jakarta.variable
      )}
    >
      <body className="min-h-svh bg-background text-foreground">
        <ThemeProvider>
          <StoreProvider>
            <div className="flex min-h-screen flex-col">{children}</div>
            <Toaster richColors position="top-right" closeButton />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
