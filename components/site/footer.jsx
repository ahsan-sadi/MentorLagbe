import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/site/logo"
import {
  XIcon,
  GithubIcon,
  LinkedinIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/site/social-icons"
import { NAV_LINKS } from "@/lib/constants"

const quickLinks = [
  { href: "/sign-up", label: "Become a Tutor" },
  { href: "/dashboard/student", label: "Student Dashboard" },
  { href: "/dashboard/tutor", label: "Tutor Dashboard" },
  { href: "/dashboard/profile", label: "Update Profile" },
  { href: "/sign-in", label: "Sign In" },
]

const socials = [
  { label: "MentorLagbe on X", href: "https://x.com", Icon: XIcon },
  {
    label: "MentorLagbe on GitHub",
    href: "https://github.com",
    Icon: GithubIcon,
  },
  {
    label: "MentorLagbe on LinkedIn",
    href: "https://linkedin.com",
    Icon: LinkedinIcon,
  },
  {
    label: "MentorLagbe on Facebook",
    href: "https://facebook.com",
    Icon: FacebookIcon,
  },
  {
    label: "MentorLagbe on YouTube",
    href: "https://youtube.com",
    Icon: YoutubeIcon,
  },
]

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="font-heading text-sm font-semibold tracking-wide text-foreground uppercase">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {children}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            MentorLagbe connects students with verified tutors and mentorship
            batches — from class 6 to university, online or offline, across
            Bangladesh.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Explore">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn title="Quick Links">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn title="Contact">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <a
                href="mailto:hello@mentorlagbe.com"
                className="transition-colors hover:text-primary"
              >
                hello@mentorlagbe.com
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <a
                href="tel:+8801700000000"
                className="transition-colors hover:text-primary"
              >
                +880 1700-000000
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                House 12, Road 5
                <br />
                Banani, Dhaka 1213, Bangladesh
              </span>
            </li>
          </ul>
        </FooterColumn>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} MentorLagbe. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Designed &amp; built for Bangladesh
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="MentorLagbe on X"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <XIcon className="size-3.5" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
