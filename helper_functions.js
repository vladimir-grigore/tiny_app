var crypto = require('crypto');  //Used for generating random numbers
var bcrypt = require('bcrypt');  //Used for password encryption
var databases = require('./databases'); //Import the databases objects
var moment = require('moment'); //Used to get timestamps in local timezone

//Store the user ID globally
//When checkExistingEmail finds a user, it will also store the userId
var userId;

//Generate a random 6 character hex string
function generateRandomString(){
  return crypto.randomBytes(3).toString('hex');
}

//Check if the user email is already stored in the users DB
function checkExistingEmail(email) {
  var flag = false;
  for (let item in databases.users) {
    if(databases.users[item].email === email){
      flag = true;
      userId = databases.users[item].id;
    }
  }
  return flag;
}

//Used in the registration form
function createUser(userId, email, password){
  databases.users[userId] = {
    'id': userId,
    'email': email,
    'password': bcrypt.hashSync(password, 5)
  }
  databases.urlDatabase[userId] = {};
};

//Used for creating a new url in the urlDatabase
function createNewUrlForUser(user_id, longURL) {
  //If there are no entries in the urlDatabase,
  //create an empty object for the current user
  if(!urlsForUser(user_id)) {
    databases.urlDatabase[user_id] = {};
  }

  //Create a random string for the shortURL
  let shortURL = generateRandomString();
  databases.urlDatabase[user_id][shortURL] = longURL;

  //Create a new entry in the urlVisits to keep track of visitors
  databases.urlVisits[shortURL] = {};
  databases.urlVisits[shortURL].visits = 0;

  return shortURL;
}

//Retrieve the userId
function getUserId() {
  return userId;
}

//Clear the userId
function clearUserId(){
  userId = '';
}

//Check if the user password is already stored in the users DB
function checkExistingPassword(password) {
  if (bcrypt.compareSync(password, databases.users[userId].password)){
    return true;
  }else{
    return false;
  }
}

//Check to see if the long url is in the DB
function databaseHasUrl(short_url) {
  let flag = false;
  for(let item in databases.urlDatabase){
    if(databases.urlDatabase[item].hasOwnProperty(short_url)){
      flag = true;
    }
  }
  return flag;
}

//Check to see if a user is authorized to view a specific url
function userOwnsUrl(user_id, short_url) {
  if(databases.urlDatabase[user_id].hasOwnProperty(short_url)){
    return true;
  } else {
    return false;
  }
}

//Retrieve only the urls of the currently logged in user
function urlsForUser(id) {
  return databases.urlDatabase[id];
}

//Create entry in urlVisits DB object
//If entry already exists, increment by one
function increaseCounterForUrl(short_url) {
  if(!databases.urlVisits[short_url]){
    databases.urlVisits[short_url] = {};
    databases.urlVisits[short_url].visits = 0;
  }
  databases.urlVisits[short_url].visits += 1;
}

//Add a visit timestamp per each url and user_id combinaton
function addVisitTimestampForUser(user_id, short_url) {
  let formatted = moment().subtract(7, 'hours').format('MMMM Do YYYY, h:mm:ss a');

  if(!databases.urlVisits[short_url][user_id]){
    databases.urlVisits[short_url][user_id] = [];
  }
  databases.urlVisits[short_url][user_id].push(formatted);
}

module.exports = {
  getUserId: getUserId,
  clearUserId: clearUserId,
  createUser: createUser,
  createNewUrlForUser: createNewUrlForUser,
  databaseHasUrl: databaseHasUrl,
  userOwnsUrl: userOwnsUrl,
  increaseCounterForUrl: increaseCounterForUrl,
  addVisitTimestampForUser: addVisitTimestampForUser,
  generateRandomString: generateRandomString,
  checkExistingEmail: checkExistingEmail,
  checkExistingPassword: checkExistingPassword,
  urlsForUser: urlsForUser
}