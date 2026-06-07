import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // After confirming, talents who haven't completed an AI interview yet are
  // sent into the interview flow; everyone else honors `next`.
  async function destinationAfterAuth(): Promise<string> {
    if (next !== '/dashboard') return next
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return next
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()
    const role = profile?.role
    if (role === 'admin') return '/admin'
    if (role === 'company') return '/dashboard'
    // Talent: route to interview unless one is already completed.
    const { data: interview } = await supabase
      .from('talent_interviews')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle()
    return interview ? '/dashboard' : '/interview'
  }

  // Flow 1: PKCE (?code=...) — standard OAuth + signUp() with emailRedirectTo
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${await destinationAfterAuth()}`)
    }
    console.error('[v0] exchangeCodeForSession failed:', error.message)
  }

  // Flow 2: Email OTP / token_hash — used by admin.generateLink and the
  // built-in confirmation email template
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(`${origin}${await destinationAfterAuth()}`)
    }
    console.error('[v0] verifyOtp failed:', error.message)
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
