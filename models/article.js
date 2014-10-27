var ApiModel = require('./api');
module.exports = function ArticleModel() {

  var self = this;

  self.parse = function(article) {
    var newArticle = {};
    newArticle.id = article.id;
    newArticle.title = article.title;
    newArticle.content = article.content;
    newArticle['created_at'] = article['created_at'];
    newArticle['updated_at'] = article['updated_at'];
    newArticle.User = article.User;
    newArticle.Type = article.Type;
    return newArticle;
  }

  var apiModel = new ApiModel();

  return {
    getAll: function(limit) {
      var apiResponse = apiModel.get('Articles', {
        filter: JSON.stringify({'limit':limit, 'include': ['User', 'Type']})
      });
      if (apiResponse.length > 0) {
        var articles = [];
        apiResponse.forEach(function(article) {
          articles.push(self.parse(article))
        });
        return articles;
      }
      else {
        return [];
      }
    }
  }
}
