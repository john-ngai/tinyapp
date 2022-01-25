const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  const templateVars = { shortURL: shortURL, longURL: longURL };
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
  res.render("urls_show", { shortURL: shortURL, longURL: longURL });
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
  console.log(req.cookies);
  res.redirect('/urls');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// _header.ejs
// <form action="/login" method="POST" class="form-inline" >
// <input type="text" name="username" class="form-control mr-sm-2" placeholder="username">