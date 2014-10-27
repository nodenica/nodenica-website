'use strict';

var request = require('request');
var deasync = require('deasync');
var qs = require('querystring');
var postSync = deasync(request.post);
var putSync = deasync(request.put);
var getSync = deasync(request.get);
var deleteSync = deasync(request.del);

module.exports = function ApiModel() {

  var apiUrl = process.env.NODENICA_API_URL || 'http://localhost:5000/api/';

  return {
    post: function(resource, params, accessToken) {
      var options = {
        url: apiUrl + resource
      };
      if (params) {
        options.form = params
      }
      if (accessToken) {
        options.headers = {
          authorization: accessToken
        }
      }
      var response = postSync(options);
      return JSON.parse(response.body);
    },
    put: function(resource, params, accessToken) {
      var options = {
        url: apiUrl + resource
      };
      if (params) {
        options.form = params
      }
      if (accessToken) {
        options.headers = {
          authorization: accessToken
        }
      }
      var response = putSync(options);
      return JSON.parse(response.body);
    },
    get: function(resource, query, accessToken) {
      if (query) {
        resource = resource + '?' + qs.stringify(query);
      }
      var options = {
        url: apiUrl + resource
      };
      if (accessToken) {
        options.headers = {
          authorization: accessToken
        }
      }
      var response = getSync(options);
      return JSON.parse(response.body);
    },
    del: function(resource, accessToken) {
      var options = {
        url: apiUrl + resource
      };
      if (accessToken) {
        options.headers = {
          authorization: accessToken
        }
      }
      var response = deleteSync(options);
      return JSON.parse(response.body);
    }
  };
};
