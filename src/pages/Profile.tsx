
import React from 'react';
import { UserProfile } from '@/components/profile/UserProfile';

export default function Profile() {
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">My Profile</h1>
      <UserProfile />
    </div>
  );
}
