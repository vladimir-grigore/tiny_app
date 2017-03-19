var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieSession = require('cookie-session');
var helper = require('./helper_functions'); //Import helper functions
var databases = require('./databases'); //Import the databases objects
var PORT = process.env.PORT || 3000;
var app = express();

//Configuration
//Enable ejs to use templates in the views folder
app.set('view engine', 'ejs');

//Middleware
//Use body parser - used in app.post('/urls')
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET || "lighthouse",
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Custom middleware
app.use((request, response, next) => {
  const user = databases.users[request.session.user_id];
  // If the user is found, add it to the request
  if(user){
    response.locals.user = user;
  } else {
    response.locals.user = undefined;
  }
  next();
});

//Check to see if the user is logged in
//if not, redirect to the login page
function require_auth(request, response, next) {
  if(request.session.user_id) {
    next()
  } else {
    response.status(401).render('not_logged_in');
  }
}

//Index page
app.get('/', (request, response) => {
  //Not logged in users are automatically redirected to /login page
  if(request.session.user_id) {
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }
});

//Return the urlDatabase object in JSON format
app.get('/urls.json', require_auth, (request, response) => {
  //Check to see if the user is logged in
  response.json(databases.urlDatabase[request.session.user_id]);
});

//Display the /urls page - will show all items in urlDatabase object
app.get('/urls', require_auth, (request, response) => {
  let templateVars = { urls: helper.urlsForUser(request.session.user_id)};
  response.render('urls_index', templateVars);
});

//Post action after submitting the form on /urls/new
//Creates a new entry in urlDatabase with a random key
//and the longURL passed in the request as a value
app.post('/urls', require_auth, (request, response) => {
  //If there are no entries in the urlDatabase,
  //create an empty object for the current user
  if(!helper.urlsForUser(request.session.user_id)) {
    databases.urlDatabase[request.session.user_id] = {};
  }

  //Create a random string for the shortURL
  let shortURL = helper.generateRandomString();
  databases.urlDatabase[request.session.user_id][shortURL] = request.body.longURL;

  //After the entry is created in urlDatabase, redirect to its details page
  response.redirect(`/urls/${shortURL}`);
});

//Display the /urls/new page
app.get('/urls/new', require_auth, (request, response) => {
  response.render('urls_new');
});

//Display details page for a specific key in urlDatabase object
app.get('/urls/:id', require_auth, (request, response) => {
  let currentUserID = request.session.user_id;
  let requestShortUrl = request.params.id;
  let longUrl = databases.urlDatabase[currentUserID][requestShortUrl];

  if(helper.databaseHasUrl(requestShortUrl)) {
    if(helper.userOwnsUrl(currentUserID, requestShortUrl)) {
      //If the urls has no visits yet, set it to 0
      let timesVisited = databases.urlVisits[requestShortUrl] ?
      databases.urlVisits[requestShortUrl].visits : 0;

      let templateVars = {
        shortURL: requestShortUrl,
        url: longUrl,
        visits: timesVisited
      };
      response.render('urls_show', templateVars);
    } else {
      response.status(403).send("Not authorized to view this url.");
    }
  } else {
    response.status(404).render('404');
  }
});

//Handle updating a longUrl on /urls/:id page
app.put('/urls/:id', require_auth, (request, response) => {
  //Set the value in the DB to the new longURL
  databases.urlDatabase[request.session.user_id][request.params.id] = request.body.longURL;

  //Refresh page so that the new longURL is displayed
  response.redirect(`/urls/${request.params.id}`);
});

//Handle deletion of a url and redirect to /urls page
app.delete('/urls/:id/delete', require_auth, (request, response) => {
    //Set the value in the DB to the new longURL
    delete databases.urlDatabase[request.session.user_id][request.params.id];
    //Return to the urls page
    response.redirect('/urls');
});

//Handle url redirection when hitting a short url
app.get('/u/:shortURL', (request, response) => {
  for (let item in databases.urlDatabase) {
    //If the short url is in the DB, redirect to the longURL page
    if(databases.urlDatabase[item].hasOwnProperty(request.params.shortURL)){
      let longURL = databases.urlDatabase[item][request.params.shortURL];
      helper.increaseCounterForUrl(request.params.shortURL);
      response.redirect(longURL);
      return;
    }
  }
  response.status(404).render('404');
});

//Login page
app.get('/login', (request, response) => {
  //If the user is already logged in do not show the page
  if(request.session.user_id) {
    response.redirect('/');
    return;
  }
  response.render('urls_login');
});

//Login POST action
app.post('/login', (request, response) => {
  //Check if the email exists
  if(helper.checkExistingEmail(request.body.email)) {
    //Check if the password exists
    if(helper.checkExistingPassword(request.body.password)){
      // Set the cookie for the logged in user
      request.session.user_id = helper.getUserId();
      request.session.email = request.body.email;
      response.redirect('/');
    } else {
      response.status(401).send('Password not found.');
    }
  } else {
    response.status(401).send('Email not found.');
  }
});

//Clear user cookie on logout and redirect to index page
app.post('/logout', (request, response) => {
  //Remove the cookie and clear the userId
  request.session = null;
  helper.clearUserId();
  response.redirect('/');
});

//User registration page
app.get('/register', (request, response) => {
  //If the user is already logged in do not show the page
  if(request.session.user_id) {
    response.redirect('/');
    return;
  }
  response.render('urls_register');
});

//Store the user in the "DB" and set a cookie
app.post('/register', (request, response) => {
  let requestUserID = helper.generateRandomString();
  let requestEmail = request.body.email;
  let requestPassword = request.body.password;

  //Check to see if the email and password fields are empty
  if (requestEmail && requestPassword) {
    //Check to see if the email is already taken
    if(!helper.checkExistingEmail(requestEmail)){
      //Create new user
      helper.createUser(requestUserID, requestEmail, requestPassword);
      //Set the cookies
      request.session.user_id = requestUserID;
      request.session.email = requestEmail;
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