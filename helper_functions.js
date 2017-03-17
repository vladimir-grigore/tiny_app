var crypto = require('crypto');  //Used for generating random numbers
var bcrypt = require('bcrypt');  //Used for password encryption

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

//Store the user ID globally
//When checkExistingEmail finds a user, it will also store the userID
var userId;

//Check if the user email is already stored in the users DB
function checkExistingEmail(email) {
  var flag = false;
  for (let item in users) {
    if(users[item].email === email){
      flag = true;
      userId = users[item].id;
    }
  }
  return flag;
}

//Check if the user password is already stored in the users DB
function checkExistingPassword(password) {
  if (bcrypt.compareSync(password, users[userId].password)){
    return true;
  }else{
    return false;
  }
}

//Retrieve only the urls of the currently logged in user
function urlsForUser(id) {
  return urlDatabase[id];
}

module.exports = {
  generateRandomString: generateRandomString,
  retrieveUserID: retrieveUserID,
  checkExistingEmail: checkExistingEmail,
  checkExistingPassword: checkExistingPassword,
  urlsForUser: urlsForUser
}