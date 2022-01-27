// Helper functions for express_server.js


// Return true if the email param matches an email inside the users object.
const emailLookup = (users, email) => {
  const userIDs = Object.keys(users);
  for (const user of userIDs) {
    if (users[user]['email'] === email) {
      return true;
    }
  }
  return false;
};

// Return true if an email & password combo matches a the values for a specific user inside the users object.
const passwordLookup = (users, email, password) => {
  const userIDs = Object.keys(users);
  for (const user of userIDs) {
    if (users[user]['email'] === email && users[user]['password'] === password) {
      return true;
    }
  }
  return false;
};

// Return the matching user id for an email inside the users object.
const userIDLookup = (users, email) => {
  const userIDs = Object.keys(users);
  for (const user of userIDs) {
    if (users[user]['email'] === email) {
      return user;
    }
  }
};

// Return an object containing the urls for a specific user id.
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
// Return true if the shortURL param matches any of the short urls belonging to the target user id.
const urlOwner = (shortURL, myURLs) => {
  for (const url in myURLs) {
    if (url === shortURL) {
      return true;
    }
  }
  return false;
};

module.exports = { emailLookup, passwordLookup, userIDLookup, urlsForUser, urlOwner };
