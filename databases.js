//Holds our instances of shortned urls
//and their reference to their original form
var urlDatabase = {
  "firstUserID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

//For analytics purposes
//Keep track how many times each url has been visited
var urlVisits = {
  "b2xVn2": {
    "visits": 0
  },
  "9sm5xK": {
    "visits": 0
  }
};

//Holds user information
//First user has password "pass" - for testing purposes
var users = {
  "firstUserID": {
    id: "firstUserID",
    email: "AwesomePerson@lighthouselabs.ca",
    password: "$2a$05$7.i.tolIwhRACirAlePQaegQlnsvpQRp4.GzcQnFO/RQvj9Y.ORN."
  }
};

module.exports = {
  users: users,
  urlVisits: urlVisits,
  urlDatabase: urlDatabase
}