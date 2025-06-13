const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config/config');
const { initializeAdmin } = require('./utils/init');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tournamentRoutes = require('./routes/tournament.routes');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialiser l'administrateur par défaut
    await initializeAdmin();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration avancée de Morgan pour le logging
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :body'));

// Logger middleware personnalisé pour plus de détails
app.use((req, res, next) => {
  const start = new Date();
  
  res.on('finish', () => {
    const end = new Date();
    const duration = end - start;
    
    console.log('\x1b[36m%s\x1b[0m', `Détails de la requête:`);
    console.log('\x1b[33m%s\x1b[0m', `URL: ${req.method} ${req.originalUrl}`);
    console.log('\x1b[33m%s\x1b[0m', `Status: ${res.statusCode}`);
    console.log('\x1b[33m%s\x1b[0m', `Durée: ${duration}ms`);
    
    if (Object.keys(req.body).length > 0) {
      console.log('\x1b[33m%s\x1b[0m', 'Body:', req.body);
    }
    
    if (req.query && Object.keys(req.query).length > 0) {
      console.log('\x1b[33m%s\x1b[0m', 'Query:', req.query);
    }
    
    console.log('\x1b[36m%s\x1b[0m', '------------------------');
  });
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DLS API' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 