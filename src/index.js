const express = require('express');
require('dotenv').config();
const cors = require('cors'); // Import the cors package
const fs = require('fs');
const path = require('path');
const Bull = require('bull');
const { v4: uuidv4 } = require('uuid');
const { addJobToQueue } = require('./queue'); 
const { initWebSocket, broadcastJobUpdate } = require('./broadcast');
const http = require('http');
const Helper = require('./helper');

const app = express();
// Use CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL, // Replace with the URL of your frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Use JSON middleware
app.use(express.json());

// Paths to JSON files assuming they're in the root of the project
const ROOT_DIR = path.resolve(__dirname, '..'); // Adjust based on where `index.js` is located
const JOBS_FILE = path.join(ROOT_DIR, 'jobs.json');
const CLIENT_FILE = path.join(ROOT_DIR, 'client.json');

// Ensure JSON files exist
const ensureFileExists = (filePath, initialContent = '[]') => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, initialContent, 'utf8');
  }
};

// Create JSON files if they don't exist
ensureFileExists(JOBS_FILE, '[]');
ensureFileExists(CLIENT_FILE, '{}');

const jobQueue = new Bull('jobQueue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Read or create client data
const getClient = () => {
  if (fs.existsSync(CLIENT_FILE)) {
    return JSON.parse(fs.readFileSync(CLIENT_FILE, 'utf8'));
  }
  return null;
};

const createClient = (client) => {
  fs.writeFileSync(CLIENT_FILE, JSON.stringify(client, null, 2));
};

// Endpoint to get or create a client
app.get('/client', (req, res) => {
  const client = getClient();
  
  if (!Helper.isNullOrEmpty(client)) {
    res.json({client});
  } else {
    res.status(200).json({ client: null, message: 'Client not found' });
  }
});

app.post('/clients', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  const client = { id: uuidv4(), name, email };
  createClient(client);
  res.json(client);
});

// Job endpoints
app.post('/client/:email/jobs', async (req, res) => {
  const { email } = req.params;
  const jobId = uuidv4();
  const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  let newJob = {
    clientEmail: email,
    id: jobId,
    status: 'pending',
    createdAt
  };

  // Read existing jobs
  let jobs = [];
  if (fs.existsSync(JOBS_FILE)) {
    try {
      jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')) || [];
    } catch (error) {
      console.error('Error reading jobs file:', error);
    }
  }

  // Add new job to jobs array
  jobs.push(newJob);

  // Write updated jobs back to file
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error('Error writing jobs file:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  await addJobToQueue(jobId);
  res.json({ id: jobId });
});

app.get('/client/:email/jobs', (req, res) => {
  let jobs = [];
  if (fs.existsSync(JOBS_FILE)) {
    jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')) || [];
  }
    // Filter jobs by clientEmail
    let filteredJobs = jobs.filter(job => job.clientEmail === req.params.email);
    // Sort filtered jobs by createdAt field
    filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(filteredJobs);
});

app.get('/jobs/:jobId', (req, res) => {
  let results = {};
  if (fs.existsSync(JOBS_FILE)) {
    try {
      results = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')) || {};
    } catch (err) {
      console.error('Error parsing results JSON:', err);
    }
  }
  const jobResult = results[req.params.jobId];
  if (jobResult) {
    res.json(jobResult);
  } else {
    res.status(404).json({ status: 'Pending' });
  }
});

// Start server
const PORT = process.env.PORT;
const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
