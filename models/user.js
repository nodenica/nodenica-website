var ApiModel = require('./api');
module.exports = function UserModel() {

  var apiModel = new ApiModel();

  return {
    getById: function(id, accessToken) {
      var apiResponse = apiModel.get('Users/' + id, null, accessToken);
      return apiResponse;
    },
    login: function(email, password) {
      var apiResponse = apiModel.post('Users/login', {
        email: email,
        password: password
      });
      return apiResponse;
    },
    logout: function(accessToken) {
      var apiResponse = apiModel.post('Users/logout', null, accessToken);
      return apiResponse;
    },
    activate: function(id, token) {
      var apiResponse = apiModel.get('Users/confirm', {
        uid: id,
        token: token,
        redirect: 'http://www.nodenica.com'
      });
      return apiResponse;
    },
    create: function(firstName, lastName, username, email, password, verificationToken) {
      var apiResponse = apiModel.post('Users', {
        'first_name': firstName,
        'last_name': lastName,
        username: username,
        email: email,
        password: password,
        created: new Date(),
        lastUpdated: new Date(),
        emailVerified: false,
        verificationToken: verificationToken
      });
      return apiResponse;
    }
  }
}
