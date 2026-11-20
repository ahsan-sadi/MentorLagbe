import BrowseTuitions from "@/components/tuitions/browse-tuitions"

export const metadata = {
  title: "Browse Tuitions",
  description:
    "Search and filter admin-approved tuition batches and 1-on-1 mentorships by subject, class level and mode.",
}

/* Server component: reads the search params (the "query") on the server and
   hands them to the client list, so filtering is URL-driven and shareable —
   exactly how a server-side Mongo query would be wired. */
export default async function TuitionsPage({ searchParams }) {
  const params = await searchParams
  return <BrowseTuitions serverParams={params} />
}
