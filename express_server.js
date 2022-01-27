const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8080;

const { hexNumGenerator } = require('./exports/hexNumGenerator');
const { emailLookup, passwordLookup, userIDLookup, urlsForUser, urlOwner } = require('./exports/userDataLookup');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
  const userIDCookie = req.cookies.user_id;
  const myURLs = urlsForUser(urlDatabase, userIDCookie);
  const templateVars = {
    user: users[userIDCookie] ? users[userIDCookie].email : '',
    urls: myURLs,
  };
  res.render('urls_index', templateVars);
});


app.get('/urls/new', (req, res) => {
  const userIDCookie = req.cookies.user_id;
  const templateVars = { user: users[userIDCookie] ? users[userIDCookie].email : '' };
  if (!userIDCookie) {
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
  const userIDCookie = req.cookies.user_id;
  if (!userIDCookie) {
    return res.status(403).send(`ERROR (403): You must be signed in to use this feature.`);
  }
  const shortURL = hexNumGenerator(6);
  const longURL = req.body.longURL;
  
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userIDCookie,
  };
  
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[userIDCookie] ? users[userIDCookie].email : '',
  };
  res.render("urls_show", templateVars);
});


app.post('/urls/:url/delete', (req, res) => {
  const shortURL = req.params.url;
  const userIDCookie = req.cookies.user_id;
  if (!userIDCookie) {
    return res.status(403).send(`ERROR (403): You must be signed in to use this feature.`);
  }
  const myURLs = urlsForUser(urlDatabase, userIDCookie);
  if (!urlOwner(shortURL, myURLs)) {
    return res.status(403).send(`ACCESS DENIED (403): /url/${shortURL} belongs to another user.`);
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


app.get('/urls/:url/edit', (req, res) => {
  const shortURL = req.params.url;
  const longURL = urlDatabase[shortURL]['longURL'];
  const userIDCookie = req.cookies.user_id;
  if (!userIDCookie) {
    return res.status(403).send(`ERROR (403): You must be signed in to use this feature.`);
  }

  const myURLs = urlsForUser(urlDatabase, userIDCookie);
  if (!urlOwner(shortURL, myURLs)) {
    return res.status(403).send(`ACCESS DENIED (403): /url/${shortURL} belongs to another user.`);
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[userIDCookie] ? users[userIDCookie].email : '',
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
  const id = userIDLookup(users, email);
  res.cookie('user_id', id);
  res.redirect('/urls');
});


app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


app.get('/register', (req, res) => {
  res.render('urls_register');
});


app.post('/register', (req, res) => {
  const newUserID = hexNumGenerator(6);
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (newEmail === '' || newPassword === '') {
    return res.status(400).send('ERROR (400): Empty email and/or password field.');
  }
  if (emailLookup(users, newEmail)) {
    return res.status(400).send(`ERROR (400): ${newEmail} is already in use.`);
  }
  users[newUserID] = {
    id: newUserID,
    email: newEmail,
    password: newPassword,
  };
  res.cookie('user_id', newUserID);
  res.redirect('/urls');
});


app.get('/login', (req, res) => {
  res.render('urls_login');
});


app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}/`);
});
