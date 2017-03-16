var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var crypto = require('crypto');  //Used for generating random numbers
var cookieParser = require('cookie-parser');
var PORT = process.env.PORT || 8080;

//Configuration
//Enable ejs to use templates in the views folder
app.set('view engine', 'ejs');

//Middleware
//Use body parser - used in app.post('/urls')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//Generate a random 6 character hex string
function generateRandomString(){
  return crypto.randomBytes(3).toString('hex');
}

//Check if the user email is already stored in the users DB
function checkExistingEmail(email) {
  for (var item in users) {
    if(users[item].email === email){
      return true;
    } else {
      return false;
    }
  }
}

//Holds our instances of shortned urls
//and their reference to their original form
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Holds user information
const users = {};

//Custom middleware - store the username from the cookie in res.locals obj
app.use((request, response, next) => {
  response.locals.username = request.cookies.username;
  next();
});

//Index page
app.get('/', (request, response) => {
  response.send('Hello');
});

//Return the urlDatabase object in JSON format
app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

//Display the /urls page - will show all items in urlDatabase object
app.get('/urls', (request, response) => {
  let templateVars = {
    urls: urlDatabase,
     };
  response.render('urls_index', templateVars);
});

//Post action after submitting the form on /urls/new
//Creates a new entry in urlDatabase with a random key
//and the longURL passed in the request as a value
app.post('/urls', (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;

  //After the entry is created in urlDatabase, redirect to its details page
  return response.redirect(`/urls/${shortURL}`);
});

//Display the /urls/new page
app.get('/urls/new', (request, response) => {
  response.render('urls_new');
});

//Display details page for a specific key in urlDatabase object
app.get('/urls/:id', (request, response) => {
  let templateVars = {
    shortURL: request.params.id,
    url: urlDatabase[request.params.id]
     };
  response.render('urls_show', templateVars);
});

//Handle updating a longUrl on /urls/:id page
app.post('/urls/:id', (request, response) => {
  //Set the value in the DB to the new longURL
  urlDatabase[request.params.id] = request.body.longURL;

  //Refresh page so that the new longURL is displayed
  return response.redirect(`/urls/${request.params.id}`);
});

//Handle deletion of a url and redirect to /urls page
app.post('/urls/:id/delete', (request, response) => {
  delete urlDatabase[request.params.id];
  response.redirect('/urls');
});

//Handle url redirection when hitting a short url
app.get('/u/:shortURL', (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

//Handle setting the cookie for the username
app.post('/login', (request, response) => {
  //Set the cookie with the username provided in the POST action
  response.cookie('username', request.body.username);
  response.redirect('/');
});

//Clear user cookie on logout and redirect to index page
app.post('/logout', (request, response) => {
  //Remove the cookie
  response.clearCookie('username');
  response.redirect('/');
});

//User registration page
app.get('/register', (request, response) => {
  response.render('urls_register');
});

//Store the user in the "DB" and set a cookie
app.post('/register', (request, response) => {
  let userID = generateRandomString();
  let requestEmail = request.body.email;
  let requestPassword = request.body.password;

  //Check to see if the email and password fields are empty
  if (requestEmail && requestPassword) {
    //Check to see if the email is already taken
    if(!checkExistingEmail(requestEmail)){
      console.log("Email", request.body.email);
      console.log("Pass", request.body.password);
      console.log("Success");
      users[userID] = {
        id: userID,
        email: request.body.email,
        password: request.body.password
      }
      response.cookie('user_id', userID);
      response.redirect('/');
    } else {
      response.status(400).send('Bad Request. Email aready taken.');
    }
  } else {
    response.status(400).send('Bad Request. Empty email or password fields.');
  }
});

//Open port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});