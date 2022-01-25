const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get("/urls/:shortURL", (req, res) => {
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  // res.render("urls_show", templateVars);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  const templateVars = { shortURL: shortURL, longURL: longURL };
  // res.redirect(`/urls/${shortURL}`);
  res.render("urls_show", templateVars);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});