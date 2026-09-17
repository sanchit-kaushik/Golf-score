import React from 'react';
import { Navbar } from '../components/Navbar/Navbar';
import { Hero } from '../components/Hero/Hero';
import { IdeaSection } from '../components/IdeaSection/IdeaSection';
import { CharitySection } from '../components/CharitySection/CharitySection';
import { DrawSection } from '../components/DrawSection/DrawSection';
import { PrizeSection } from '../components/PrizeSection/PrizeSection';
import { ImpactSection } from '../components/ImpactSection/ImpactSection';
import { FinalCTA } from '../components/FinalCTA/FinalCTA';
import { Footer } from '../components/Footer/Footer';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-sage-200 selection:text-sage-900">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Section 2: The Idea (01 Play, 02 Chance, 03 Impact) */}
        <IdeaSection />

        {/* Section 3: Charity (Every Game Can Give Something Back) */}
        <CharitySection />

        {/* Section 4: How the Draw Works (5 Steps) */}
        <DrawSection />

        {/* Section 5: Prize Pool (40% - 35% - 25% Allocation & Rollover) */}
        <PrizeSection />

        {/* Section 6: Impact Story (Your Game -> Your Chance -> Your Impact) */}
        <ImpactSection />

        {/* Section 7: Final Call to Action */}
        <FinalCTA />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};
