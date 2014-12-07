var ApiModel = require('./api');
module.exports = function ArticleModel() {

  var apiModel = new ApiModel();

  return {
    getAll: function(limit) {
      var apiResponse = apiModel.get('Articles', {
        filter: JSON.stringify({'limit':limit, 'include': ['User', 'Type']})
      });
      return apiResponse;
    },
    getByType: function(type, limit) {
      var apiResponse = apiModel.get('Articles', {
        filter: JSON.stringify({
          'where': {
            'type_id': type
          },
          'limit': limit,
          'include': [
            'User',
            'Type'
          ]
        })
      });
      return apiResponse;
    }
  }
}
