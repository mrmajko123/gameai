const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const staticRoot = path.join(__dirname);
app.use(express.static(staticRoot, { index: 'index.html' }));
app.use('/gameai', express.static(staticRoot, { index: 'index.html' }));
app.use(bodyParser.json());

// Basic /api/ping
app.get('/api/ping', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// POST /api/contact
// Expects JSON: { name, email, message }
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ ok: false, error: 'Missing fields' });

  // Transport config from env variables
  const host = process.env.SMTP_HOST;
  const portNum = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // Default recipient for contact form messages. Falls back to env var if provided.
  const to = process.env.CONTACT_TO || 'info-gameai@prootn.me';

  if (!host || !user || !pass) {
    return res.status(500).json({ ok: false, error: 'SMTP not configured on server. Set SMTP_HOST/SMTP_USER/SMTP_PASS.' });
  }

  const transporter = nodemailer.createTransport({
    host,
    port: portNum,
    secure: portNum === 465, // true for 465, false for other ports
    auth: { user, pass },
  });

  const mailOptions = {
    from: `${name} <${email}>`,
    to,
    subject: `Website contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g,'<br>')}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to send email', err);
    return res.status(500).json({ ok: false, error: err.message || 'Failed to send email' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

app.listen(port, () => console.log(`Server listening http://localhost:${port}`));
