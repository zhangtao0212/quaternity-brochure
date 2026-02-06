import { NextResponse } from 'next/server'

const TO_EMAIL = process.env.TO_EMAIL || 'contact@qosmos.one'
const FROM_EMAIL = process.env.FROM_EMAIL || 'newsletter@qosmos.one'

async function sendNotificationEmail(email: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`📧 New subscriber: ${email}`)
    return true
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: '🎉 New Subscriber - Qosmos',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <h1 style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 24px;">🎉 New Subscriber!</h1>
    
    <div style="background: #f0f7ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">New user has subscribed:</p>
      <p style="margin: 0; font-size: 20px; font-weight: 600; color: #5B7FFF;">${email}</p>
    </div>
    
    <p style="color: #999; font-size: 12px; margin: 24px 0 0 0;">
      Submitted at ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
    </p>
  </div>
</body>
</html>
`
      })
    })

    return response.ok
  } catch (error) {
    console.error('Resend error:', error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const sent = await sendNotificationEmail(email)

    if (sent) {
      return NextResponse.json({
        message: 'Thank you! We will be in touch soon.'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to process. Please try again.' },
        { status: 500 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Qosmos subscription service is running'
  })
}
