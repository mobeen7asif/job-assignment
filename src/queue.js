require('dotenv').config();
const Bull = require('bull');
const Redis = require('ioredis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { broadcastJobUpdate } = require('./broadcast');

// Paths to JSON files assuming they're in the root of the project
const ROOT_DIR = path.resolve(__dirname, '..'); // Adjust based on where `index.js` is located
const JOBS_FILE = path.join(ROOT_DIR, 'jobs.json');
const RESULTS_FILE = path.join(ROOT_DIR, 'results.json');

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

// Initialize Redis client
const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
});

// Check Redis connection
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

const jobQueue = new Bull('jobQueue', {
  redis: {
    host: redisHost,
    port: redisPort,
  },
});

const getRandomDelay = () => Math.floor(Math.random() * 55 + 5) * 1000;

const fetchImage = async () => {
  const response = await axios.get(`${process.env.UNSPLASH_URL}/photos/random?client_id=${process.env.UNSPLASH_CLIENT_ID}`);
  return response.data.urls.regular;
};

const updateJobStatus = (id, status, imageUrl) => {
  let jobs;
  try {
    jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')) || [];
  } catch (error) {
    console.error('Error reading jobs file:', error);
    jobs = [];
  }
  const jobIndex = jobs.findIndex(job => job.id === id);
  if (jobIndex !== -1) {
    jobs[jobIndex].status = status;
    jobs[jobIndex].imageUrl = imageUrl;
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    broadcastJobUpdate(jobs[jobIndex]); // Notify clients about the job update
  }
};

jobQueue.process(async (job) => {
  const { id } = job.data;
  const delay = getRandomDelay();
  await new Promise(resolve => setTimeout(resolve, delay));
  const imageUrl = await fetchImage();
  updateJobStatus(id, 'resolved', imageUrl);
});

const addJobToQueue = async (id) => {
  await jobQueue.add({ id });
};

module.exports = { addJobToQueue };
