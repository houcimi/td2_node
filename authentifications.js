const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Redis = require('redis');
const RedisStore = require("connect-redis").default;
const app = express();
const port = 3001; // Different from the Game App

const redisClient = Redis.createClient({
    url: 'redis://localhost:6379', // Default URL, change if different
    legacyMode: true
  });
const redisStore =  new RedisStore({
    client: redisClient,
    prefix: "myapp:",
  })
app.use(session({
  store: redisStore,
  secret: 'momo',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: !true, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/register', async (req, res) => {
  const { login, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Check if user exists
  const userExists = await redisClient.hGet('users', login);
  if (userExists) {
    return res.status(400).send('User already exists');
  }

  // Store user in Redis
  await redisClient.hSet('users', login, passwordHash);
  res.send('User registered successfully');
});

app.post('/login', async (req, res) => {
  const { login, password } = req.body;

  // Retrieve user from Redis
  const passwordHash = await redisClient.hGet('users', login);
  if (passwordHash && await bcrypt.compare(password, passwordHash)) {
    // Create session
    req.session.user = { login };
    res.send('Logged in successfully');
  } else {
    res.status(400).send('Invalid login or password');
  }
});

app.listen(port, () => {
  console.log(`Auth App listening at http://localhost:${port}`);
});
