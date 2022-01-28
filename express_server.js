// Dependencies
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key'],
  maxAge: 24 * 60 * 60 * 1000,
}));
const bcrypt = require('bcryptjs');

// Modules
const { hexNumGenerator } = require('./function_modules/hexNumGenerator');
const { emailLookup, passwordLookup, getUserByEmail, urlsForUser, urlOwner } = require('./function_modules/helpers');
const { response } = require('express');

// Users database
const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10),
  },
};

// URL Database
const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID',
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user2RandomID',
  },
};

// GET /
app.get('/', (req, res) => {
  const sessionID = req.session.user_id
  // Req. #5 & #6
  sessionID ? res.redirect('/urls') : res.redirect('/login');
});

// GET /urls
app.get('/urls', (req, res) => {
  const sessionID = req.session.user_id
  const myURLs = urlsForUser(urlDatabase, sessionID);
  // Req. #7
  if (!sessionID) {
    return res.status(404).send('Please login to view this page.');
  } else {
    // Req. #8
    return res.render('urls_index', { 
      user: users[sessionID]['email'],
      urls: myURLs,
     });
  }
});

// GET /urls/new
app.get('/urls/new', (req, res) => {
  const sessionID = req.session.user_id;
  // #13
  sessionID ? res.render('urls_new', {user: users[sessionID]['email']}) : res.redirect('/login');
});

// GET /urls/:id
app.get('/urls/:id', (req, res) => {
  const sessionID = req.session.user_id;
  // #19
  if (!sessionID) {
    return res.status(404).send('Please login to view this page.');
  }
  const shortURL = req.params.id;
  // #18
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`This short URL (/urls/${shortURL}) does not exist.`);
  }
  const myURLS = urlsForUser(urlDatabase, sessionID);
  const checkURLOwner = urlOwner(shortURL, myURLS);
  // #20
  if (!checkURLOwner) {
    return res.status(404).send(`Access Denied: This short URL belongs to someone else.`);
  }
  const longURL = urlDatabase[shortURL]['longURL'];
  res.render('urls_show', {
    user: users[sessionID]['email'],
    shortURL,
    longURL,
  });
});

// GET /u/:id
app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  // #21 & #22
  urlDatabase[shortURL] ? res.redirect(urlDatabase[shortURL]['longURL']) : res.status(404).send(`This page (/u/${shortURL}) does not exist.`);
});

// POST /urls
app.post('/urls', (req, res) => {
  const sessionID = req.session.user_id
  // #23
  if (!sessionID) {
    return res.status(403).send(`You must be signed-in to use this feature.`);
  }
  // #24.1
  const shortURL = hexNumGenerator(6);
  const longURL = req.body.longURL;
  // #24.2
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: sessionID,
  };
  // #25
  res.redirect(`/urls/${shortURL}`);
});

// POST /urls/:id
app.post('/urls/:id', (req, res) => {
  const sessionID = req.session.user_id
  // #26
  if (!sessionID) {
    return res.status(403).send(`You must be signed-in to use this feature.`);
  }
  const shortURL = req.params.id;
  const myURLS = urlsForUser(urlDatabase, sessionID);
  // #27
  if (!urlOwner(shortURL, myURLS)) {
    return res.status(404).send(`Access Denied: This short URL belongs to someone else.`);
  }
  const newLongURL = req.body.newLongURL;
  // #28
  urlDatabase[shortURL]['longURL'] = newLongURL;
  // 29
  res.redirect('/urls');
});

// POST /urls/:id/delete
app.post('/urls/:id/delete', (req, res) => {
  const sessionID = req.session.user_id
  // #30
  if (!sessionID) {
    return res.status(403).send(`You must be signed-in to use this feature.`);
  }
  const shortURL = req.params.id;
  const myURLs = urlsForUser(urlDatabase, sessionID);
  // #31
  if (!urlOwner(shortURL, myURLs)) {
    return res.status(404).send(`Access Denied: This short URL belongs to someone else.`);
  }
  // #32
  delete urlDatabase[shortURL];
  // #33
  res.redirect('/urls');
});

// GET /login
app.get('/login', (req, res) => {
  const sessionID = req.session.user_id;
  // #36
  sessionID ? res.redirect('/urls') : res.render('urls_login', { user: undefined });
});

// GET /register
app.get('/register', (req, res) => {
  const sessionID = req.session.user_id;
  // #37
  sessionID ? res.redirect('/urls') : res.render('urls_register', { user: undefined });
});

// POST /login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // #40.1
  if (!emailLookup(users, email)) {
    return res.status(403).send(`${email} is not a registered email.`);
  }
  // #40.2
  if (!passwordLookup(users, email, password)) {
    return res.status(403).send('Incorrect password. Please try again.');
  }
  const id = getUserByEmail(email, users);
  // #41
  req.session.user_id = id;
  // #42
  res.redirect('/urls');
});

// POST /register
app.post('/register', (req, res) => {
  const newUserID = hexNumGenerator(6);
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  // #45
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  // #43
  if (newEmail === '' || newPassword === '') {
    return res.status(400).send('Empty email and/or password field.');
  }
  // #44
  if (emailLookup(users, newEmail)) {
    return res.status(400).send(`${newEmail} has already been registered.`);
  }
  // #46
  users[newUserID] = {
    id: newUserID,
    email: newEmail,
    password: hashedPassword,
  };
  // #47
  req.session.user_id = newUserID;
  // #48
  res.redirect('/urls');
});

// POST /logout
app.post('/logout', (req, res) => {
  // #48
  req.session = null;
  // #49
  res.redirect('/urls');
});

const port = 8080;
app.listen(port, () => {
  console.log(`mrjohnming's TinyApp is listening on http://localhost:${port}/`);
});
