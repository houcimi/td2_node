const express = require('express')
const app = express()
const port = 3003
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const os = require('os'); 


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));


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

