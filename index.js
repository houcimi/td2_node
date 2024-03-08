const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const os = require('os'); 
const axios = require('axios');


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

const session = require('express-session');

app.use(session({
  secret: 'momo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: !true } 
}));

const bcrypt = require('bcrypt');
app.get('/login', checkAuthentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  axios.post('http://localhost:3001/login', req.body)
    .then(authResponse => {
      // Set user info in local session
      req.session.user = { login: req.body.login };
      res.redirect('/'); // Redirect to game main page
    })
    .catch(error => {
      res.status(400).send('Login failed: invalid username or password');
    });
});
function checkAuthentication(req, res, next) {
  if (req.session.user) {
    return res.redirect('/'); // Redirect to main page if already logged in
  }
  next();
}

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.post('/register', (req, res) => {
  axios.post('http://localhost:3001/register', req.body)
    .then(authResponse => {
      res.redirect('/login'); // Redirect to the login page
    })
    .catch(error => {
      res.status(400).send('Registration failed: username already exists');
    });
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})
const filePath = path.join(__dirname,'data', 'liste_francais.txt');
var getWordOfTheDay = (filteredWords) => {
    const date = new Date();
    const day = date.getDate(); 
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return filteredWords[(day + month + year) % filteredWords.length];
}

app.get('/readfile', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur lors de la lecture du fichier');
    }

    const words = data.split(/\r?\n|\s/);

    const filteredWords = words.filter(word => word.length > 0);

    res.json(randomnumber(filteredWords));
  });
});

app.post('/checkword', (req, res) => {
    const userWord = req.body.word.toLowerCase(); // Get the word submitted by the user

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur lors de la lecture du fichier');
        }

        const words = data.split(/\r?\n|\s/);
        const filteredWords = words.filter(word => word.length > 0);
        const wordOfTheDay = getWordOfTheDay(filteredWords).toLowerCase();
        console.log(wordOfTheDay);
        // Compare userWord and wordOfTheDay and construct the result
        let result = [];
        for (let i = 0; i < userWord.length; i++) {
            if (userWord[i] === wordOfTheDay[i]) {
                result.push({ letter: userWord[i], class: 'correct' });
            } else if (wordOfTheDay.includes(userWord[i])) {
                result.push({ letter: userWord[i], class: 'present' });
            } else {
                result.push({ letter: userWord[i], class: 'absent' });
            }
        }

        res.json(result); // Send the result back to the client
    });
});
app.get('/port', (req, res) => {
    const operatingSystem = os.type(); // Get the operating system name
    const responseMessage = `MOTUS APP working on ${operatingSystem} port ${port}`;
    res.send(responseMessage);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

