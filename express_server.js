var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString(){

}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (request, response) => {
  response.send('Hello');
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.get('/urls', (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.post('/urls', (request, response) => {
  console.log(request.body);
  response.send('OK');
});

app.get('/urls/new', (request, response) => {
  response.render('urls_new');
});

app.get('/urls/:id', (request, response) => {
  var templateVars = { shortURL: request.params.id };
  templateVars['url'] = urlDatabase[request.params.id];
  response.render('urls_show', templateVars);
});

app.get('/hello', (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});