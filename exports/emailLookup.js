/* Example obj:
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

Example email: 'user@example.com'*/

// Receives an obj and email. Return true if the email matches the value of any of the email keys within the obj.
const emailLookup = (obj, email) => {
  const users = Object.keys(obj);
  for (const user of users) {
    if (obj[user]['email'] === email) {
      return true;
    }
  }
  return false;
};

module.exports = { emailLookup };