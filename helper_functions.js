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

function getUserId() {
  return userId;
}

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

//Retrieve only the urls of the currently logged in user
function urlsForUser(id) {
  return databases.urlDatabase[id];
}

module.exports = {
  getUserId: getUserId,
  clearUserId: clearUserId,
  generateRandomString: generateRandomString,
  checkExistingEmail: checkExistingEmail,
  checkExistingPassword: checkExistingPassword,
  urlsForUser: urlsForUser
}