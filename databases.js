//Holds our instances of shortned urls
//and their reference to their original form
var urlDatabase = {
  "firstUserID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

//Holds user information
var users = {
  "firstUserID": {
    id: "firstUserID",
    email: "a@a.a",
    password: "$2a$05$7.i.tolIwhRACirAlePQaegQlnsvpQRp4.GzcQnFO/RQvj9Y.ORN."
  }
};

module.exports = {
  users: users,
  urlDatabase: urlDatabase
}