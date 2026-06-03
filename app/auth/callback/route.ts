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

  // Flow 1: PKCE (?code=...) — standard OAuth + signUp() with emailRedirectTo
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[v0] exchangeCodeForSession failed:', error.message)
  }

  // Flow 2: Email OTP / token_hash — used by admin.generateLink and the
  // built-in confirmation email template
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[v0] verifyOtp failed:', error.message)
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
