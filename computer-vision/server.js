const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 3004;

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/event-images/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
});
const upload = multer({ storage: storage });

// Create event-images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public/event-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files from public directory

// CORS middleware to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  next();
});

// Initialize events storage
const EVENTS_FILE = path.join(__dirname, 'events.json');
if (!fs.existsSync(EVENTS_FILE)) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify([]));
}

// Load events from file
let events = [];
try {
  events = JSON.parse(fs.readFileSync(EVENTS_FILE));
} catch (error) {
  console.error('Error loading events file:', error);
}

// Save events to file
const saveEvents = () => {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
};

// Webhook endpoint for receiving events with images
app.post('/webhook', upload.single('screenshot'), (req, res) => {
  const eventData = req.body.event ? JSON.parse(req.body.event) : req.body;
  
  const event = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...eventData,
    screenshot: req.file ? `/event-images/${req.file.filename}` : null
  };
  
  events.unshift(event); // Add to beginning of array
  if (events.length > 500) events.pop(); // Limit to 500 events
  saveEvents();
  
  console.log('Event received:', event);
  res.status(200).json({ success: true, eventId: event.id });
});

// Get all events endpoint
app.get('/events', (req, res) => {
  res.json(events);
});

// Get events filtered by type
app.get('/events/type/:type', (req, res) => {
  const { type } = req.params;
  const filteredEvents = events.filter(event => event.type === type);
  res.json(filteredEvents);
});

// Clear all events
app.delete('/events', (req, res) => {
  events = [];
  saveEvents();
  res.json({ success: true, message: 'All events cleared' });
});

// Server status endpoint
app.get('/', (req, res) => {
  // Serve the HTML file if accept type is text/html
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  } else {
    // Return API info for programmatic access
    res.json({
      status: 'running',
      eventsCount: events.length,
      endpoints: {
        'POST /webhook': 'Send events from Tello drone',
        'GET /events': 'Get all events',
        'GET /events/type/:type': 'Get events by type',
        'DELETE /events': 'Clear all events'
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to view the dashboard`);
});
