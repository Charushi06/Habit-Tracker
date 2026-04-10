import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = `testuser${Date.now()}@test.com`;
  const { data: authData } = await supabase.auth.signUp({ email, password: 'password123' });
  const user = authData.user;
  
  // check if profile exists
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  console.log('PROFILE EXISTS?', !!profile);

  const habitPayload = {
        name: 'Drink Water Unique Test',
        frequency: 'daily',
        active_days: [0, 1, 2, 3, 4, 5, 6],
        target_days: 7,
        category: ['Health'],
        category_id: null,
        is_active: true,
        user_id: user.id
  };

  const { error: hError1, status } = await supabase.from('habits').insert([habitPayload]);
  console.log('HABIT INSERT error:', JSON.stringify(hError1));
  console.log('STATUS:', status);
}

test();
