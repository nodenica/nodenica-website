'use strict';

var ArticleModel = require('../../models/article');

module.exports = function(router) {

  var articleModel = new ArticleModel();

  router.get('/', function(req, res) {

    var model = {
      articles: articleModel.getByType(1, 10)
    };

    res.render('blog/index', model);

  });
};
