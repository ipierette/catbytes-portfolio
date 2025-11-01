import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { Skills } from '@/components/sections/skills'
import { Projects } from '@/components/sections/projects'
import { Curiosities } from '@/components/sections/curiosities'
import { AIFeatures } from '@/components/sections/ai-features'
import { Contact } from '@/components/sections/contact'
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const t = await getTranslations()

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Curiosities />
      <AIFeatures />
      <Contact />
    </>
  )
}
