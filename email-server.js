/**
 * Simple email collection server
 * Run this separately to collect and store subscriber emails
 * 
 * Usage: node email-server.js
 * Then update your form to POST to http://localhost:3001/api/subscribe
 */

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3001
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json')

// Initialize subscribers file if it doesn't exist
if (!fs.existsSync(SUBSCRIBERS_FILE)) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2))
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Subscribe endpoint
  if (req.url === '/api/subscribe' && req.method === 'POST') {
    let body = ''
    
    req.on('data', chunk => {
      body += chunk.toString()
    })
    
    req.on('end', () => {
      try {
        const { email } = JSON.parse(body)
        
        if (!email || !email.includes('@')) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid email' }))
          return
        }
        
        // Read existing subscribers
        let subscribers = []
        try {
          subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8'))
        } catch {}
        
        // Check for duplicates
        const exists = subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())
        if (exists) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Email already subscribed' }))
          return
        }
        
        // Add new subscriber
        subscribers.push({
          email,
          timestamp: new Date().toISOString(),
          source: 'website'
        })
        
        fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2))
        
        console.log(`📧 New subscriber: ${email}`)
        
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Subscribed successfully!' }))
      } catch (error) {
        console.error('Error:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Server error' }))
      }
    })
    return
  }

  // Get subscribers list (protected in production!)
  if (req.url === '/api/subscribers' && req.method === 'GET') {
    try {
      const subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8'))
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ count: subscribers.length, subscribers }))
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to read subscribers' }))
    }
    return
  }

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`\n📧 Email Collection Server`)
  console.log(`   Running at: http://localhost:${PORT}`)
  console.log(`   Subscribers file: ${SUBSCRIBERS_FILE}\n`)
  console.log(`   Endpoints:`)
  console.log(`   POST /api/subscribe - Submit email`)
  console.log(`   GET  /api/subscribers - View all subscribers`)
  console.log(`   GET  /health - Health check\n`)
})
