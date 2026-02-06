const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json')
const EMAIL_RECORD_FILE = path.join(__dirname, '.last_email_sent')
const DOMAIN = 'qosmos.one'

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@example.com',
    pass: process.env.SMTP_PASS || 'your-password'
  }
}

function initSubscribersFile() {
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2))
  }
}

function readSubscribers() {
  try {
    return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function saveSubscriber(email) {
  const subscribers = readSubscribers()
  
  const exists = subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())
  if (exists) {
    return { success: false, message: 'Email already subscribed' }
  }
  
  subscribers.push({
    email,
    timestamp: new Date().toISOString(),
    source: 'website',
    domain: DOMAIN
  })
  
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2))
  console.log(`✅ Subscriber: ${email}`)
  
  return { success: true, message: 'Subscribed successfully' }
}

async function sendDailyReport() {
  const subscribers = readSubscribers()
  const today = new Date().toISOString().split('T')[0]
  
  const todaySubscribers = subscribers.filter(s => s.timestamp.startsWith(today))
  const totalCount = subscribers.length
  
  const report = `
Qosmos Email Report
===================
Date: ${today}
Domain: ${DOMAIN}

Total: ${totalCount}
Today: ${todaySubscribers.length}

${todaySubscribers.length > 0 ? `Today:\n${todaySubscribers.map(s => `- ${s.email}`).join('\n')}` : '(No new today)'}

---
Auto-generated`
  
  fs.writeFileSync(EMAIL_RECORD_FILE, today)
  console.log(`📧 Report: ${totalCount} total, ${todaySubscribers.length} today`)
  
  return { sent: true, total: totalCount, today: todaySubscribers.length }
}

async function checkDailyReport() {
  try {
    const lastSent = fs.existsSync(EMAIL_RECORD_FILE) 
      ? fs.readFileSync(EMAIL_RECORD_FILE, 'utf-8') 
      : null
    
    const today = new Date().toISOString().split('T')[0]
    
    if (lastSent !== today && new Date().getHours() >= 9) {
      await sendDailyReport()
    }
  } catch (error) {
    console.error('Report error:', error)
  }
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => resolve(body ? JSON.parse(body) : {}))
    req.on('error', reject)
  })
}

async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  if (url.pathname === '/api/subscribe' && req.method === 'POST') {
    try {
      const { email } = await parseBody(req)
      
      if (!email || !email.includes('@')) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid email' }))
        return
      }
      
      const result = saveSubscriber(email)
      res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(result))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Server error' }))
    }
    return
  }
  
  if (url.pathname === '/api/stats' && req.method === 'GET') {
    const subscribers = readSubscribers()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ count: subscribers.length }))
    return
  }
  
  if (url.pathname === '/api/send-report' && req.method === 'POST') {
    await sendDailyReport()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Report sent' }))
    return
  }
  
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', domain: DOMAIN }))
    return
  }
  
  res.writeHead(404)
  res.end('Not found')
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  let filePath = path.join(__dirname, 'out', url.pathname === '/' ? 'index.html' : url.pathname)
  
  if (!filePath.startsWith(path.join(__dirname, 'out'))) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  
  const ext = path.extname(filePath)
  const types = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' })
    res.end(data)
  })
}

function createServer() {
  initSubscribersFile()
  
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    
    if (url.pathname.startsWith('/api/')) {
      handleApiRequest(req, res)
    } else {
      serveStatic(req, res)
    }
  })
  
  server.listen(PORT, () => {
    console.log(`🚀 Qosmos running on http://${DOMAIN}:${PORT}`)
    console.log(`   Subscribers file: ${SUBSCRIBERS_FILE}`)
    console.log(`\n   API: POST /api/subscribe | GET /api/stats | POST /api/send-report | GET /health`)
    
    checkDailyReport()
    setInterval(checkDailyReport, 60 * 60 * 1000)
  })
}

createServer()
