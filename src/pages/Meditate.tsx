
import React from 'react';
import { Header } from '@/components/Header';
import { MeditationContainer } from '@/components/meditation/MeditationContainer';

export default function Meditate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-deepPurple via-midnightBlue to-cosmicBlue">
      <Header />
      <div className="pt-16">
        <MeditationContainer />
      </div>
    </div>
  );
}
