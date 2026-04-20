import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://tjikwxkmsfmyjkssvyoh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaWt3eGttc2ZteWprc3N2eW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTkwODQsImV4cCI6MjA4OTA5NTA4NH0.Fj9aTAcYIP4HTuirEAox4E1z8Y707k1c2JPf6dl5l88'
);
const { data, error } = await supabase.from('pairs')
  .select('from_ticker,to_ticker').eq('is_valid', true)
  .eq('from_ticker', 'btc').limit(20);
console.log('err:', error);
console.log('btc rows:', data?.length, data?.map(x => x.to_ticker));
