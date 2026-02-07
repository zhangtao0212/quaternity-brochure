import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const DOMAIN = process.env.DOMAIN || 'qosmos.one'
const REPORT_EMAIL = process.env.REPORT_EMAIL || 'contact@qosmos.one'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString()
    const subscriberKey = `subscriber:${email.toLowerCase()}`
    const subscriberData = {
      email,
      timestamp,
      source: 'website',
      domain: DOMAIN
    }

    // Save to Vercel KV
    await kv.hset(subscriberKey, subscriberData)
    
    // Add to set of all subscriber emails
    await kv.sadd('subscribers:emails', email.toLowerCase())
    
    // Add to today's subscribers set
    const today = timestamp.split('T')[0]
    await kv.sadd(`subscribers:today:${today}`, email.toLowerCase())

    // Store last update timestamp
    await kv.set('subscribers:lastUpdate', timestamp)

    console.log(`✅ New subscriber: ${email}`)

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get total count from set
    const totalEmails = await kv.smembers('subscribers:emails')
    const count = totalEmails.length || 0

    return NextResponse.json({ 
      count,
      domain: DOMAIN
    }, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
