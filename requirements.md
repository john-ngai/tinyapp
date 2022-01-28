# Functional Requirements

## User Stories

As an avid twitter poster,
I want to be able to shorten links
so that I can fit more non-link text in my tweets.

As a twitter reader,
I want to be able to visit sites via shortened links,
so that I can read interesting content.

(Stretch) As an avid twitter poster,
I want to be able to see how many times my subscribers visit my links
so that I can learn what content they like.

## Display Requirements

- Site Header:
  - if a user is logged in, the header shows:
    - #1 the user's email
    - #2 a logout button which makes a POST request to /logout
  - if a user is not logged in, the header shows:
    - #3 a link to the login page (/login)
    - #4 a link to the registration page (/register)

## Behaviour Requirements

### GET /

- if user is logged in:
  - #5 (Minor) redirect to /urls

- if user is not logged in:
  - #6 (Minor) redirect to /login

### GET /urls

- if user is logged in:
  - returns HTML with:
  - the site header (see Display Requirements above)
  - #8 a list (or table) of URLs the user has created, each list item containing:
    - a short URL
    - the short URL's matching long URL
    - #9 an edit button which makes a GET request to /urls/:id
    - #10 a delete button which makes a POST request to /urls/:id/delete
    - (Stretch) the date the short URL was created
    - (Stretch) the number of times the short URL was visited
    - (Stretch) the number number of unique visits for the short URL
  - #10 (Minor) a link to "Create a New Short Link" which makes a GET request to /urls/new

- #7 if user is not logged in:
  - returns HTML with a relevant error message

### GET /urls/new

- if user is logged in:
  - returns HTML with:
  - the site header (see Display Requirements above)
  - a form which contains:
   - #11 a text input field for the original (long) URL
   - #12 a submit button which makes a POST request to /urls

- if user is not logged in:
   - #13 redirects to the /login page

### GET /urls/:id

- if user is logged in and owns the URL for the given ID:
  - returns HTML with:
  - #14 the site header (see Display Requirements above)
  - #15 the short URL (for the given ID)
  - a form which contains:
   - #16 the corresponding long URL
   - #17 an update button which makes a POST request to /urls/:id
  - (Stretch) the date the short URL was created
  - (Stretch) the number of times the short URL was visited
  - (Stretch) the number of unique visits for the short URL

- if a URL for the given ID does not exist:
  - #18 (Minor) returns HTML with a relevant error message

- if user is not logged in:
  - #19 returns HTML with a relevant error message

- if user is logged it but does not own the URL with the given ID:
  - #20 returns HTML with a relevant error message

### GET /u/:id

- if URL for the given ID exists:
  - #21 redirects to the corresponding long URL
- if URL for the given ID does not exist:
  - #22 (Minor) returns HTML with a relevant error message

### POST /urls

- if user is logged in:
  - #24 generates a short URL, saves it, and associates it with the user
  - #25 redirects to /urls/:id, where :id matches the ID of the newly saved URL
- if user is not logged in:
  - #23 (Minor) returns HTML with a relevant error message

### POST /urls/:id

- if user is logged in and owns the URL for the given ID:
    - #28 updates the URL
    - #29 redirects to /urls
- if user is not logged in:
    - #26 (Minor) returns HTML with a relevant error message
- if user is logged in but does not own the URL for the given ID:
    - #27 (Minor) returns HTML with a relevant error message

### POST /urls/:id/delete

- if user is logged in and owns the URL for the given ID:
    - #32 deletes the URL
    - #33 redirects to /urls
- if user is not logged in:
    - #30 (Minor) returns HTML with a relevant error message
- if user is logged it but does not own the URL for the given ID:
    - #31 (Minor) returns HTML with a relevant error message

### GET /login

- if user is logged in:
    - #36 (Minor) redirects to /urls
- if user is not logged in:
    - returns HTML with:
    - a form which contains:
      - #34 input fields for email and password
      - #35 submit button that makes a POST request to /login

### GET /register

- if user is logged in:
  - #37 (Minor) redirects to /urls
- if user is not logged in:
  - returns HTML with:
  - a form which contains:
    - #38 input fields for email and password
    - #39 a register button that makes a POST request to /register

## POST /login

- if email and password params match an existing user:
    - #41 sets a cookie
    - $42 redirects to /urls
- if email and password params don't match an existing user:
  - #40 returns HTML with a relevant error message

## POST /register

- if email or password are empty:
    - #43 returns HTML with a relevant error message
- if email already exists:
    - #44 returns HTML with a relevant error message
    - otherwise:
      - #46 creates a new user
      - #45 encrypts the new user's password with bcrypt
      - #47 sets a cookie
      - redirects to /urls

### POST /logout

- #48 deletes cookie
- #49 redirects to /urls