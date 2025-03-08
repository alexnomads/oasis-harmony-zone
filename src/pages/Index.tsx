
import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Programs } from '@/components/Programs';
import { Testimonials } from '@/components/Testimonials';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { Token } from '@/components/Token';
import { Newsletter } from '@/components/Newsletter';
import { Roadmap } from '@/components/Roadmap';
import { GetInTouch } from '@/components/GetInTouch';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="pt-16">
        <section id="hero">
          <Hero />
        </section>
        <section id="ai-agent-alpha">
          <Features />
        </section>
        <section id="programs">
          <Programs />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="subscription-plans">
          <SubscriptionPlans />
        </section>
        <section id="token">
          <Token />
        </section>
        <section id="newsletter">
          <Newsletter />
        </section>
        <section id="roadmap">
          <Roadmap />
        </section>
        <section id="contact">
          <GetInTouch />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
