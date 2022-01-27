const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const port = 8080;

const { hexNumGenerator } = require('./function_modules/hexNumGenerator');
const { emailLookup, passwordLookup, getUserByEmail, urlsForUser, urlOwner } = require('./function_modules/userDataLookup');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['testKey'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

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


app.get('/', (req, res) => {
  res.redirect('/urls');
});


app.get('/urls', (req, res) => {
  const userIDSession = req.session.user_id // cookie-session
  const myURLs = urlsForUser(urlDatabase, userIDSession);
  const templateVars = {
    user: users[userIDSession] ? users[userIDSession].email : '',
    urls: myURLs,
  };
  res.render('urls_index', templateVars);
});


app.get('/urls/new', (req, res) => {
  const userIDSession = req.session.user_id // cookie-session
  const templateVars = { user: users[userIDSession] ? users[userIDSession].email : '' };
  if (!userIDSession) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`ERROR (404): /url/${shortURL} does not exist.`);
  }
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});


app.post('/urls', (req, res) => {
  const userIDSession = req.session.user_id // cookie-session
  if (!userIDSession) {
    return res.status(403).send(`ERROR (403): You must be signed in to use this feature.`);
  }
  const shortURL = hexNumGenerator(6);
  const longURL = req.body.longURL;
  
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userIDSession,
  };
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[userIDSession] ? users[userIDSession].email : '',
  };
  res.render("urls_show", templateVars);
});


app.post('/urls/:url/delete', (req, res) => {
  const shortURL = req.params.url;
  const userIDSession = req.session.user_id // cookie-session
  if (!userIDSession) {
    return res.status(403).send(`ERROR (403): You must be signed in to use this feature.`);
  }
  const myURLs = urlsForUser(urlDatabase, userIDSession);
  if (!urlOwner(shortURL, myURLs)) {
    return res.status(403).send(`ACCESS DENIED (403): /url/${shortURL} belongs to another user.`);
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


app.get('/urls/:url/edit', (req, res) => {
  const shortURL = req.params.url;
  const longURL = urlDatabase[shortURL]['longURL'];
  const userIDSession = req.session.user_id // cookie-session
  if (!userIDSession) {
    return res.status(403).send(`ERROR (403): You must be signed in to use this feature.`);
  }

  const myURLs = urlsForUser(urlDatabase, userIDSession);
  if (!urlOwner(shortURL, myURLs)) {
    return res.status(403).send(`ACCESS DENIED (403): /url/${shortURL} belongs to another user.`);
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[userIDSession] ? users[userIDSession].email : '',
  };
  res.render("urls_show", templateVars);
});


app.post('/urls/:shortURL', (req, res) => {
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]['longURL'] = newLongURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!emailLookup(users, email)) {
    return res.status(403).send(`ERROR (403): ${email} is not a registered email.`);
  }
  if (!passwordLookup(users, email, password)) {
    return res.status(403).send('ERROR (403): Incorrect password. Please try again.');
  }
  const id = getUserByEmail(email, users);
  req.session.user_id = id; // cookie-session
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null; // cookie-session
  res.redirect('/urls');
});


app.get('/register', (req, res) => {
  res.render('urls_register');
});


app.post('/register', (req, res) => {
  const newUserID = hexNumGenerator(6);
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  if (newEmail === '' || newPassword === '') {
    return res.status(400).send('ERROR (400): Empty email and/or password field.');
  }
  if (emailLookup(users, newEmail)) {
    return res.status(400).send(`ERROR (400): ${newEmail} is already in use.`);
  }
  users[newUserID] = {
    id: newUserID,
    email: newEmail,
    password: hashedPassword,
  };
  req.session.user_id = newUserID; // cookie-session
  res.redirect('/urls');
});


app.get('/login', (req, res) => {
  res.render('urls_login');
});


app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}/`);
});
