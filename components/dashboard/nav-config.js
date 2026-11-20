import {
  Bookmark,
  ClipboardList,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Receipt,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"

/* Role-based sidebar navigation for /dashboard */
export function getNavItems(role) {
  const profile = {
    href: "/dashboard/profile",
    label: "Update Profile",
    icon: UserRound,
  }

  if (role === "admin") {
    return [
      { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/admin/users", label: "User Management", icon: Users },
      {
        href: "/dashboard/admin/tuitions",
        label: "Tuition Approval",
        icon: ShieldCheck,
      },
      {
        href: "/dashboard/admin/transactions",
        label: "Transactions",
        icon: Receipt,
      },
      profile,
    ]
  }

  if (role === "tutor") {
    return [
      { href: "/dashboard/tutor", label: "Overview", icon: LayoutDashboard },
      {
        href: "/dashboard/tutor/post-tuition",
        label: "Post a Tuition",
        icon: PlusCircle,
      },
      {
        href: "/dashboard/tutor/my-tuitions",
        label: "My Tuitions",
        icon: FileText,
      },
      {
        href: "/dashboard/tutor/applicants",
        label: "Applicants",
        icon: ClipboardList,
      },
      profile,
    ]
  }

  return [
    { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/student/my-applications",
      label: "My Applications",
      icon: ClipboardList,
    },
    {
      href: "/dashboard/student/saved",
      label: "Saved Tuitions",
      icon: Bookmark,
    },
    profile,
  ]
}

export default getNavItems
