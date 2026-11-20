import Hero from "@/components/home/hero"
import FeaturedTuitions from "@/components/home/featured-tuitions"
import PricingPreview from "@/components/home/pricing-preview"
import HowItWorks from "@/components/home/how-it-works"
import { SubjectsStats, CtaBand } from "@/components/home/subjects-stats"

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedTuitions />
      <PricingPreview />
      <HowItWorks />
      <SubjectsStats />
      <CtaBand />
    </>
  )
}
