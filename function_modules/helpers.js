const bcrypt = require('bcryptjs');

// Helper functions for express_server.js


// Receives an email and the users database, and returns true of the email is found inside the database.
const emailLookup = (database, email) => {
  const userIDs = Object.keys(database);
  for (const user of userIDs) {
    if (database[user]['email'] === email) {
      return true;
    }
  }
  return false;
};

// Receieves an email, password, and users database, and returns true if the email and password combination matches the values found inside the database for a specific user id.
const passwordLookup = (database, email, password) => {
  const userIDs = Object.keys(database);
  for (const user of userIDs) {
    const hashedPassword = database[user]['password'];
    if (database[user]['email'] === email && (bcrypt.compareSync(password, hashedPassword))) {
      return true;
    }
  }
  return false;
};

// Receives a user's email and the users database as parameters, and returns the matching user id.
const getUserByEmail = (email, database) => {
  const userIDs = Object.keys(database);
  for (const user of userIDs) {
    if (database[user]['email'] === email) {
      return user;
    }
  }
  return undefined;
};

// Return an object containing the urls for a specific user id.
// Receives a user id and the users database, and returns an object containing the urls created by the user id"
const urlsForUser = (database, userID) => {
  const myURLs = {};
  for (const url in database) {
    if (database[url]['userID'] === userID) {
      myURLs[url] = {longURL: database[url]['longURL']};
    }
  }
  return myURLs;
};

// This function is dependent on the return value of the urlsForUser function.
// Receive a short url and an object of urls (i.e myURLs)), and returns true if the short url matches any of the urls inside the object.
const urlOwner = (shortURL, myURLs) => {
  for (const url in myURLs) {
    if (url === shortURL) {
      return true;
    }
  }
  return false;
};

module.exports = { emailLookup, passwordLookup, getUserByEmail, urlsForUser, urlOwner };
