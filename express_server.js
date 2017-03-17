var express = require('express');
var app = express();
var bodyParser = require('body-parser');
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

//Return the user id based on the username and password
function retrieveUserID(email, password) {
  for (let item in users) {
    if (users[item].password === password && users[item].email === email){
      return item;
    }
  }
}

//Holds our instances of shortned urls
//and their reference to their original form
var urlDatabase = {
  "firstUserID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

//Custom middleware
app.use((request, response, next) => {
  const user = users[request.cookies.user_id];
  // If the user is found, add it to the request
  if(user){
    // request.user = user;
    response.locals.user = user;
  } else {
    response.locals.user = 'undefined';
  }
  next();
});

//Store the user ID globally
var userId;

//Check if the user email is already stored in the users DB
function checkExistingEmail(email) {
  var flag = false;
  for (var item in users) {
    if(users[item].email === email){
      flag = true;
      userId = users[item].id;
    }
  }
  return flag;
}

//Check if the user password is already stored in the users DB
function checkExistingPassword(password) {
  if (password === users[userId].password){
    return true;
  }else{
    return false;
  }
}

//Holds user information
var users = {
  "firstUserID": {
    id: "firstUserID",
    email: "a@a.a",
    password: "pass"
  }
};

//Index page
app.get('/', (request, response) => {
  response.redirect('/urls');
});

//Return the urlDatabase object in JSON format
app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

//Display the /urls page - will show all items in urlDatabase object
app.get('/urls', (request, response) => {
  //Check to see if user is logged in
  //If not, redirect to the login page
  if(request.cookies.user_id) {
    let templateVars = {
      urls: urlDatabase[request.cookies.user_id]
       };
    response.render('urls_index', templateVars);
  } else {
    return response.redirect('/login');
  }
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
  //Check to see if user is logged in
  //If not, redirect to the login page
  if(request.cookies.user_id) {
    response.render('urls_new');
  } else {
    return response.redirect('/login');
  }
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

//Login page
app.get('/login', (request, response) => {
  response.render('urls_login');
});

//Login POST action
app.post('/login', (request, response) => {
  //Check if the email exists
  if(checkExistingEmail(request.body.email)) {
    //Check if the password exists
    if(checkExistingPassword(request.body.password)){
      console.log("email and password was true");
      let user_id = retrieveUserID(request.body.email, request.body.password);
      // Set the cookie for the logged in user
      response.cookie('user_id', user_id);
      response.cookie('email', request.body.email);
      response.redirect('/');
    } else {
      response.status(403).send('Password not found.');
    }
  } else {
    response.status(403).send('Email not found.');
  }
});

//Clear user cookie on logout and redirect to index page
app.post('/logout', (request, response) => {
  //Remove the cookie
  response.clearCookie('user_id');
  response.clearCookie('email');

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
      users[userID] = {
        id: userID,
        email: request.body.email,
        password: request.body.password
      }
      response.cookie('user_id', userID);
      response.cookie('email', requestEmail);
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