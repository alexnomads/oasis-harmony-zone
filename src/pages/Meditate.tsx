
import React from 'react';
import { Header } from '@/components/Header';
import { MeditationContainer } from '@/components/meditation/MeditationContainer';

export default function Meditate() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <Header />
      <main className="flex-1 pt-16 pb-8 lg:pb-4">
        <MeditationContainer />
      </main>
    </div>
  );
}
