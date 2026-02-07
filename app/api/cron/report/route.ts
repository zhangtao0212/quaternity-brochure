import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const DOMAIN = process.env.DOMAIN || 'qosmos.one'
const REPORT_EMAIL = process.env.REPORT_EMAIL || 'contact@qosmos.one'

interface Subscriber {
  email: string
  timestamp: string
  source: string
  domain: string
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  // Using Resend for email sending (recommended for Vercel)
  // You can also use SendGrid, Mailgun, etc.
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `Qosmos <newsletter@${DOMAIN}>`,
          to: [to],
          subject: subject,
          html: body
        })
      })
      return response.ok
    } catch (error) {
      console.error('Resend error:', error)
      return false
    }
  }
  
  // Fallback: Just log the report (for testing without email service)
  console.log('========================================')
  console.log(`📧 EMAIL REPORT (would be sent to: ${to})`)
  console.log('========================================')
  console.log(`Subject: ${subject}`)
  console.log(body)
  console.log('========================================')
  return true
}

export async function POST() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    // Get all subscriber emails
    const allEmails = await kv.smembers('subscribers:emails') || []
    const todayEmails = await kv.smembers(`subscribers:today:${today}`) || []
    
    const totalCount = allEmails.length
    const todayCount = todayEmails.length
    
    // Get subscriber details
    const subscribers: Subscriber[] = []
    for (const email of todayEmails) {
      const data = await kv.hgetall(`subscriber:${email}`) as unknown as Subscriber | undefined
      if (data) {
        subscribers.push(data)
      }
    }
    
    // Build email content
    const subject = `📊 Qosmos Daily Report - ${today}`
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <h1 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 24px;">📊 Qosmos Daily Report</h1>
    <p style="color: #666; margin: 0 0 24px 0;">${today}</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
      <div style="background: #f0f7ff; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #5B7FFF;">${totalCount}</div>
        <div style="color: #666; font-size: 14px;">Total Subscribers</div>
      </div>
      <div style="background: #f0fff4; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #22c55e;">${todayCount}</div>
        <div style="color: #666; font-size: 14px;">New Today</div>
      </div>
    </div>
    
    ${subscribers.length > 0 ? `
    <h2 style="font-size: 16px; color: #1a1a2e; margin: 24px 0 12px 0;">🆕 New Subscribers Today</h2>
    <ul style="margin: 0; padding: 0 0 0 20px; color: #444; line-height: 1.8;">
      ${subscribers.map(s => `<li>${s.email} <span style="color: #999; font-size: 12px;">(${s.timestamp.split('T')[1].split('.')[0]})</span></li>`).join('')}
    </ul>
    ` : '<p style="color: #999;">No new subscribers today</p>'}
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #999; font-size: 12px; margin: 0;">
      This is an automated report from <a href="https://${DOMAIN}" style="color: #5B7FFF;">${DOMAIN}</a><br>
      Generated at ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>
`
    
    // Send email
    const sent = await sendEmail(REPORT_EMAIL, subject, htmlBody)
    
    if (sent) {
      // Update last sent timestamp
      await kv.set('reports:lastSent', today)
      
      return NextResponse.json({
        success: true,
        message: 'Daily report sent',
        stats: { total: totalCount, today: todayCount }
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Daily report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
