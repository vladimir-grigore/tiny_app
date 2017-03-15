var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var crypto = require('crypto');  //Used for generating random numbers
var PORT = process.env.PORT || 8080;

//Enable ejs to use templates in the views folder
app.set('view engine', 'ejs');

//Use body parser - used in app.post('/urls')
app.use(bodyParser.urlencoded({extended: true}));

//Generate a random 6 character hex string
function generateRandomString(){
  return crypto.randomBytes(3).toString('hex');
}

//Holds our instances of shortned urls
//and their reference to their original form
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//index page
app.get('/', (request, response) => {
  response.send('Hello');
});

//return the urlDatabase object in JSON format
app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

//display the /urls page - will show all items in urlDatabase object
app.get('/urls', (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

//post action after submitting the form on /urls/new
//create a new entry in urlDatabase with a random key
//and the longURL passed in the request as a value
app.post('/urls', (request, response) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  return response.redirect(`/urls/${shortURL}`);
});

//display the /urls/new page
app.get('/urls/new', (request, response) => {
  response.render('urls_new');
});

//display details page for a specific key in urlDatabase object
app.get('/urls/:id', (request, response) => {
  var templateVars = { shortURL: request.params.id };
  templateVars['url'] = urlDatabase[request.params.id];
  response.render('urls_show', templateVars);
});

//display the /hello page
app.get('/hello', (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

//open port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});