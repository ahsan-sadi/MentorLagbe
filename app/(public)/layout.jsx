import Navbar from "@/components/site/navbar"
import Footer from "@/components/site/footer"

/* Layout for every public / marketing page (navbar + footer). */
export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
