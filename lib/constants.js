/* Global app constants — shared across landing pages & dashboards */

export const APP_NAME = "MentorLagbe"

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "How It Works" },
]

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Programming",
  "English",
  "IELTS",
  "Bangla",
  "Economics",
  "ICT",
]

export const CLASS_LEVELS = [
  "Class 6-8",
  "Class 9-10",
  "Class 11-12",
  "Admission",
  "University",
]

export const MODES = ["Online", "Offline"]

export const DAYS_PER_WEEK = [1, 2, 3, 4, 5, 6, 7]

export const ROLES = ["student", "tutor", "admin"]

export const ROLE_LABELS = {
  student: "Student",
  tutor: "Tutor",
  admin: "Admin",
}

export const PLANS = {
  free: { id: "free", name: "Free", price: 0, currency: "$" },
  proStudent: {
    id: "pro-student",
    name: "Pro Student",
    price: 10,
    currency: "$",
    audience: "student",
    tagline: "Priority booking & faster tutor replies",
    features: [
      "Priority application highlighting",
      "Unlimited saved / bookmarked tuitions",
      "Direct message access to tutors",
      "Priority support within 12 hours",
    ],
  },
  proTutor: {
    id: "pro-tutor",
    name: "Pro Tutor",
    price: 15,
    currency: "$",
    audience: "tutor",
    tagline: "Unlimited tuition posts & verified badge",
    features: [
      "Unlimited tuition posts (Free = max 2)",
      "Verified Pro badge on every listing",
      "Applicant contact details unlocked",
      "Priority placement in search results",
    ],
  },
}

export const FREE_TUTOR_POST_LIMIT = 2

export const STATUS_STYLES = {
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  rejected:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
  accepted:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  active:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  closed: "bg-muted text-muted-foreground border-border",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  free: "bg-muted text-muted-foreground border-border",
  pro: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30",
  student:
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30",
  tutor:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30",
  admin:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
}

export const SUBJECT_ICONS = {
  Mathematics: "calculator",
  Physics: "atom",
  Chemistry: "flask",
  Biology: "dna",
  Programming: "code",
  English: "book",
  IELTS: "languages",
  Bangla: "pen",
  Economics: "chart",
  ICT: "cpu",
}

/* Bangladesh-ready sample data ------------------------------------ */

export const DEMO_ACCOUNTS = [
  { email: "student@mentorlagbe.com", password: "123456", role: "student" },
  { email: "tutor@mentorlagbe.com", password: "123456", role: "tutor" },
  { email: "admin@mentorlagbe.com", password: "123456", role: "admin" },
]
