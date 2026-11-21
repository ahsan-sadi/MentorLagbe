/* Application reads — the Express API (`NEXT_PUBLIC_API_URL`) owns the data.
   Every function here is a plain GET that resolves to the JSON body. */

/* Documents written outside the app may miss fields the UI renders; fill the
   gaps from safe defaults instead of letting a `toLowerCase()` / `fmtDate()`
   blow up a whole page. */
const withDefaults = (application) => {
  const id = String(application?._id ?? "")
  let appliedAt = application?.appliedAt
  if (!appliedAt && /^[0-9a-f]{24}$/i.test(id)) {
    /* A Mongo ObjectId starts with the creation timestamp (seconds). */
    appliedAt = new Date(parseInt(id.slice(0, 8), 16) * 1000).toISOString()
  }
  return {
    status: "pending",
    tutorEmail: "",
    tuitionTitle: "",
    subject: "",
    monthlyFee: 0,
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    preferredSchedule: "",
    studentNote: "",
    ...application,
    appliedAt,
  }
}

export const getApplications = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
    method: "GET",
  })
  const applications = await res.json()
  return Array.isArray(applications) ? applications.map(withDefaults) : []
}
