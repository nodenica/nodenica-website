'use strict';
module.exports = function() {
  return function(req, res, next) {
    if (req.session.auth) {
      res.locals.auth = req.session.auth.userId;
    }
    next();
  }
};
