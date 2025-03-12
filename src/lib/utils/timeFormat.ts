
export const formatDurationDetails = (seconds: number) => {
  if (seconds === undefined || seconds === null) {
    console.warn('formatDurationDetails received undefined or null seconds');
    seconds = 0;
  }
  
  // Ensure seconds is a number
  const sec = typeof seconds === 'number' ? seconds : parseInt(seconds as any, 10) || 0;
  
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSeconds = Math.floor(sec % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${remainingSeconds}s`);

  console.log(`Formatting duration: ${sec} seconds → ${parts.join(' ')}`);
  
  return parts.join(' ');
};

export const formatDuration = (seconds: number) => {
  if (seconds === undefined || seconds === null) {
    console.warn('formatDuration received undefined or null seconds');
    seconds = 0;
  }
  
  // Ensure seconds is a number
  const sec = typeof seconds === 'number' ? seconds : parseInt(seconds as any, 10) || 0;
  
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSeconds = Math.floor(sec % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
};
