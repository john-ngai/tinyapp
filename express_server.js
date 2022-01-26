const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8080;

const { hexNumGenerator } = require('./exports/hexNumGenerator');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
}

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    username: req.cookies['username'],
  };
  res.render("urls_show", templateVars);
});

app.post('/urls/:url/delete', (req, res) => {
  const shortURL = req.params.url;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get('/urls/:url/edit', (req, res) => {
  const shortURL = req.params.url;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    username: req.cookies['username'],
  };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const signinID = req.body.username;
  res.cookie('username', signinID);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.post('/register', (req, res) => {
  const newUserID = hexNumGenerator(6);
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  users.newUserID = {
    id: newUserID,
    email: newEmail,
    password: newPassword,
  }
  res.cookie('user_id', newUserID);
  res.redirect('/urls');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
