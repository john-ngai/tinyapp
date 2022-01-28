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
  const sessionID = req.session.user_id;
  
  // If logged in, redirect to /urls, if not, redirect to /login.
  sessionID ? res.redirect('/urls') : res.redirect('/login');
});

// GET /urls
app.get('/urls', (req, res) => {
  const sessionID = req.session.user_id;
  const myURLs = urlsForUser(urlDatabase, sessionID);
  
  // If NOT logged in, display a 404 error.
  if (!sessionID) {
    return res.status(404).send('Please login to view this page.');
  } else {
    
    // If logged in, display urls_index.ejs
    return res.render('urls_index', {
      user: users[sessionID]['email'],
      urls: myURLs,
    });
  }
});

// GET /urls/new
app.get('/urls/new', (req, res) => {
  const sessionID = req.session.user_id;

  // If NOT logged in, redirect to /login.
  sessionID ? res.render('urls_new', {user: users[sessionID]['email']}) : res.redirect('/login');
});

// GET /urls/:id
app.get('/urls/:id', (req, res) => {
  const sessionID = req.session.user_id;
  
  // If NOT logged in, display a 403 error.
  if (!sessionID) {
    return res.status(403).send('Please login to view this page.');
  }
  const shortURL = req.params.id;
  
  // If the short URL doesn't exist, display a 404 error.
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`This short URL (/urls/${shortURL}) does not exist.`);
  }
  const myURLS = urlsForUser(urlDatabase, sessionID);
  const checkURLOwner = urlOwner(shortURL, myURLS);
  
  // If the user doesn't own the short URL, display a 403 error.
  if (!checkURLOwner) {
    return res.status(403).send(`Access Denied: This short URL belongs to someone else.`);
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
  
  // If the short URL exists, redirect to the long URL, if not, display a 404 error.
  urlDatabase[shortURL] ? res.redirect(urlDatabase[shortURL]['longURL']) : res.status(404).send(`This page (/u/${shortURL}) does not exist.`);
});

// POST /urls
app.post('/urls', (req, res) => {
  const sessionID = req.session.user_id;
  
  // If NOT logged in, return a 403 error.
  if (!sessionID) {
    return res.status(403).send(`You must be signed-in to use this feature.`);
  }
  
  // Generate a new random 6 digit hexadecimal short URL.
  const shortURL = hexNumGenerator(6);
  const longURL = req.body.longURL;
  
  // Save the new short URL onto the database and associate it with the user.
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: sessionID,
  };
  
  // Redirect to /urls/:id, where id matches the new shortURL.
  res.redirect(`/urls/${shortURL}`);
});

// POST /urls/:id
app.post('/urls/:id', (req, res) => {
  const sessionID = req.session.user_id;

  // If NOT logged in, display a 403 error.
  if (!sessionID) {
    return res.status(403).send(`You must be signed-in to use this feature.`);
  }
  const shortURL = req.params.id;
  const myURLS = urlsForUser(urlDatabase, sessionID);
  
  // If the user doesn't own the short URL, display a 403 error.
  if (!urlOwner(shortURL, myURLS)) {
    return res.status(403).send(`Access Denied: This short URL belongs to someone else.`);
  }
  const newLongURL = req.body.newLongURL;
  
  // Update the long URL into the new long URL.
  urlDatabase[shortURL]['longURL'] = newLongURL;
  
  // Redirect to /urls.
  res.redirect('/urls');
});

// POST /urls/:id/delete
app.post('/urls/:id/delete', (req, res) => {
  const sessionID = req.session.user_id;
  
  // If NOT logged in, display a 403 error.
  if (!sessionID) {
    return res.status(403).send(`You must be signed-in to use this feature.`);
  }
  const shortURL = req.params.id;
  const myURLs = urlsForUser(urlDatabase, sessionID);
  
  // // If the user doesn't own the short URL, display a 403 error.
  if (!urlOwner(shortURL, myURLs)) {
    return res.status(403).send(`Access Denied: This short URL belongs to someone else.`);
  }
  
  // Delete the short URL / long URL from the database.
  delete urlDatabase[shortURL];
 
  // Redirect to /urls.
  res.redirect('/urls');
});

// GET /login
app.get('/login', (req, res) => {
  const sessionID = req.session.user_id;
  
  // If logged in, redirect to /urls, if not, display login.ejs
  sessionID ? res.redirect('/urls') : res.render('login', { user: undefined });
});

// GET /register
app.get('/register', (req, res) => {
  const sessionID = req.session.user_id;
  
  // If logged in, redirect to /urls, if not, display register.ejs
  sessionID ? res.redirect('/urls') : res.render('register', { user: undefined });
});

// POST /login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // If the email received from the client isn't found in the database, display a 400 error.
  if (!emailLookup(users, email)) {
    return res.status(400).send(`${email} is not a registered email.`);
  }
  
  // If the password received from the client does not match the one found in the database, display a 400 error.
  if (!passwordLookup(users, email, password)) {
    return res.status(400).send('Incorrect password. Please try again.');
  }
  const id = getUserByEmail(email, users);
  
  // Set the session cookie to the user id.
  req.session.user_id = id;
  
  // Redirect to /urls.
  res.redirect('/urls');
});

// POST /register
app.post('/register', (req, res) => {
  const newUserID = hexNumGenerator(6);
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  
  // Encrypt the password.
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  // If the email or password received from the client is empty, display a 400 error.
  if (newEmail === '' || newPassword === '') {
    return res.status(400).send('Empty email and/or password field.');
  }
  
  // If the email received from the client is already found in the database, display a 400 error.
  if (emailLookup(users, newEmail)) {
    return res.status(400).send(`${newEmail} has already been registered.`);
  }
  
  // Store the new user profile into the database.
  users[newUserID] = {
    id: newUserID,
    email: newEmail,
    password: hashedPassword,
  };
  
  // Set the session cookie to the user id.
  req.session.user_id = newUserID;
  
  // Redirect to /urls.
  res.redirect('/urls');
});

// POST /logout
app.post('/logout', (req, res) => {
  
  // Delete the session cookie.
  req.session = null;
  
  // Redirect to /urls.
  res.redirect('/urls');
});

const port = 8080;
app.listen(port, () => {
  console.log(`mrjohnming's TinyApp is listening on http://localhost:${port}/`);
});
