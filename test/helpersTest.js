const { assert } = require('chai');
const bcrypt = require('bcryptjs');

const { eqObjects } = require('./eqObj');
const { hexNumGenerator } = require('../function_modules/hexNumGenerator');
const { emailLookup, passwordLookup, getUserByEmail, urlsForUser, urlOwner } = require('../function_modules/helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync('dishwasher-funk', 10),
  },
  "v354pb": {
    id: "v354pb", 
    email: "jeff@amazon.com", 
    password: bcrypt.hashSync('Sanchez8942(I$];', 10),
  },
};


describe('function hexNumGenerator(digits)', () => {
  it('should return a random 6 digit hexadecimal number', () => {
    const actual = hexNumGenerator(6).length;
    const expected = 6;
    assert.strictEqual(actual, expected);
  });
});

describe('function emailLookup(database, email)', () => {
  it('should return true if the email is found inside the database', () => {
    const actual = emailLookup(testUsers, 'user@example.com');
    const expected = true;
    assert.strictEqual(actual, expected);
  });
  it('should return false if the email is not found inside the database', () => {
    const actual = emailLookup(testUsers, 'john@gmail.com');
    const expected = false;
    assert.strictEqual(actual, expected);
  });
});

describe('function passwordLookup(database, email, password)', () => {
  it('should return true if the email and password combination matches the values found inside the database for a specific user id', () => {
    const actual = passwordLookup(testUsers, 'user2@example.com', 'dishwasher-funk');
    const expected = true;
    assert.strictEqual(actual, expected);
  });
  it('should return false if the email and password combination does not match the values found inside the database for any of the user ids', () => {
    const actual = passwordLookup(testUsers, 'user2@example.com', 'veryDifficultPassword');
    const expected = false;
    assert.strictEqual(actual, expected);
  });
});

describe('function getUserByEmail(email, database)', () => {
  it('should return the matching user id if the email is found inside the database', () => {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(expectedUserID, user);
  });
  it('should return undefined if the email is not found inside the database', () => {
    const user = getUserByEmail("john@gmail.com", testUsers)
    assert.strictEqual(undefined, user);
  });
});

describe('function urlsForUser(database, userID)', () => {
  it('should return an object containing the urls created by the the user id', () => {
    const testDatabase = {
      'b2xVn2': {
        longURL: 'http://www.lighthouselabs.ca',
        userID: 'userRandomID',
      },
      '9sm5xK': {
        longURL: 'http://www.google.com',
        userID: 'user2RandomID',
      },
      'mcevax': {
        longURL: 'https://www.amazon.com',
        userID: 'v354pb',
      },
      'a18hbw': {
        longURL: 'https://www.blueorigin.com/',
        userID: 'v354pb',
      },
    };
    const obj1 = urlsForUser(testDatabase, 'v354pb');
    const obj2 = {
      mcevax: { longURL: 'https://www.amazon.com' },
      a18hbw: { longURL: 'https://www.blueorigin.com/' }
    };
    const actual = eqObjects(obj1, obj2);
    assert.strictEqual(actual, true);
  });
});

describe('function urlOwner(shortURL, myURLs)', () => {
  it('should return true if the short url belongs to the specified user id.', () => {
    const myURLs = {
      mcevax: { longURL: 'https://www.amazon.com' },
      a18hbw: { longURL: 'https://www.blueorigin.com/' }
    };
    const actual = urlOwner('mcevax', myURLs);
    const expected = true;
    assert.strictEqual(actual, expected);
  });
  it('should return false if the short url does not belongs to the specified user id.', () => {
    const myURLs = {
      mcevax: { longURL: 'https://www.amazon.com' },
      a18hbw: { longURL: 'https://www.blueorigin.com/' }
    };
    const actual = urlOwner('b2xVn2', myURLs);
    const expected = false;
    assert.strictEqual(actual, expected);
  });
});