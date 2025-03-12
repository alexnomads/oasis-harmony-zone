
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.cron("meditation-reminder", "0 14 * * *", async () => {
  try {
    console.log("Running meditation reminder cron job...");
    
    // Get current date in CET
    const now = new Date();
    const cetDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const todayStart = new Date(cetDate.setHours(0, 0, 0, 0));
    
    // Get all users who haven't meditated today
    const { data: usersToRemind, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        meditation_sessions(count)
      `)
      .eq('meditation_sessions.created_at::date', todayStart.toISOString().split('T')[0])
      .is('meditation_sessions.count', 0);

    if (usersError) {
      throw usersError;
    }

    console.log(`Found ${usersToRemind?.length || 0} users to remind`);

    // Send emails to users who haven't meditated
    for (const user of usersToRemind || []) {
      await supabase.auth.admin.sendEmail(user.email, 'meditation-reminder', {
        user_name: user.email.split('@')[0],
        meditation_link: `${SUPABASE_URL}/meditate`,
      });
      
      console.log(`Sent reminder to ${user.email}`);
    }

    console.log("Meditation reminder job completed successfully");
  } catch (error) {
    console.error("Error in meditation reminder job:", error);
  }
});

// Handle OPTIONS request for CORS
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  
  return new Response('Meditation reminder function is running', { 
    headers: { 'Content-Type': 'text/plain' } 
  });
});
