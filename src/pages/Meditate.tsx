
import React from 'react';
import { Header } from '@/components/Header';
import { MeditationContainer } from '@/components/meditation/MeditationContainer';
import { VHSOverlay } from '@/components/ui/VHSOverlay';

export default function Meditate() {
  return (
    <div className="min-h-screen relative">
      <VHSOverlay />
      <Header />
      <div className="pt-16">
        <MeditationContainer />
      </div>
    </div>
  );
}
