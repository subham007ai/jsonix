export type WaitlistResult =
  | { success: true }
  | { success: false; error: string }

export async function submitToWaitlist(
  email: string,
  source: string
): Promise<WaitlistResult> {
  
  // Client-side validation first
  if (!email || email.trim() === '') {
    return { 
      success: false, 
      error: 'Enter your email first.' 
    }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { 
      success: false, 
      error: "That doesn't look like an email address." 
    }
  }
  
  try {
    const { supabase } = await import('./supabase')
    
    const { error } = await supabase
      .from('waitlist')
      .insert([{
        email: email.trim().toLowerCase(),
        source: source
      }])
    
    if (error) {
      // Postgres unique violation — already signed up
      if (error.code === '23505') {
        return {
          success: false,
          error: "You're already on the list. We'll email you."
        }
      }
      return {
        success: false,
        error: 'Something went wrong. Try again.'
      }
    }
    
    return { success: true }
    
  } catch {
    return {
      success: false,
      error: 'Something went wrong. Try again.'
    }
  }
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const { supabase } = await import('./supabase')
    
    // Uses RPC function — not direct table query
    // Direct query would fail due to RLS SELECT block
    const { data } = await supabase
      .rpc('get_waitlist_count')
    
    return data ?? 0
    
  } catch {
    // Never throws — returns 0 silently on any error
    return 0
  }
}
