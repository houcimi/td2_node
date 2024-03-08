const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Redis = require('redis');
const RedisStore = require("connect-redis").default;
const app = express();
const port = 3001; // Different from the Game App

const redisClient = Redis.createClient({
    url: 'redis://127.0.0.1:6379',
  });
  redisClient.connect().catch(err => console.error('Redis connect error', err));

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
    console.log("Login attempt for: ", login);

    // Retrieve user's password hash from Redis
    const passwordHash = await redisClient.hGet('users',login);
    console.log("Retrieved hash: ", passwordHash);

    if (passwordHash) {
        const match = await bcrypt.compare(password, passwordHash);
        if (match) {
            // Create session
            req.session.user = { login };
            return res.send('Logged in successfully');
        }
    }
    return res.status(400).send('Invalid login or password');
});


app.listen(port, () => {
  console.log(`Auth App listening at http://localhost:${port}`);
});
