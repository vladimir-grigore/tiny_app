var crypto = require('crypto');  //Used for generating random numbers
var bcrypt = require('bcrypt');  //Used for password encryption
var databases = require('./databases'); //Import the databases objects

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
};

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
  if(databases.urlVisits[short_url]) {
    databases.urlVisits[short_url] += 1;
  } else {
    databases.urlVisits[short_url] = 1;
  }
}

module.exports = {
  getUserId: getUserId,
  clearUserId: clearUserId,
  createUser: createUser,
  databaseHasUrl: databaseHasUrl,
  userOwnsUrl: userOwnsUrl,
  increaseCounterForUrl: increaseCounterForUrl,
  generateRandomString: generateRandomString,
  checkExistingEmail: checkExistingEmail,
  checkExistingPassword: checkExistingPassword,
  urlsForUser: urlsForUser
}