
export const calculateSessionQuality = (
  focusLost: number,
  windowBlurs: number,
  hasMovement: boolean
) => {
  let quality = 1.0;
  
  // Deduct for tab switches
  quality -= (focusLost * 0.2); // -20% per tab switch
  
  // Deduct for window switches
  quality -= (windowBlurs * 0.2); // -20% per window switch
  
  // Deduct for excessive movement
  if (hasMovement) {
    quality -= 0.3; // -30% for excessive movement
  }
  
  return Math.max(0, quality); // Don't go below 0
};

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
