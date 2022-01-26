/* Sample users object:
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
*/



// Helper function for express_server.js
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

// Helper function for express_server.js
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

module.exports = { emailLookup, passwordLookup };
