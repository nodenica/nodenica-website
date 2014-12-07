'use strict';
var mandrill = require('mandrill-api/mandrill');
var mandrillClient = new mandrill.Mandrill(process.env.MANDRILL_APIKEY);
module.exports = function() {
  return function(req, res, next) {
    req.sendMail = function(toName, toEmail, subject, text, cb) {
      var to = [
      {
        'email': toEmail,
        'name': toName,
        'type': 'to'
      }
      ]

      var message = {
        'html': null,
        'text': text,
        'subject': subject,
        'from_email': 'no-reply@nodenica.com',
        'from_name': 'NodeNica',
        'to': to,
        'headers': {
          'Reply-To': 'no-reply@nodenica.com'
        },
        'important': false,
        'track_opens': null,
        'track_clicks': null,
        'auto_text': null,
        'auto_html': null,
        'inline_css': null,
        'url_strip_qs': null,
        'preserve_recipients': null,
        'bcc_address': null,
        'tracking_domain': null,
        'signing_domain': null,
        'merge': true,
        'global_merge_vars': [],
        'merge_vars': [],
        'tags': ['nodenica'],
        'google_analytics_domains': [],
        'google_analytics_campaign': null,
        'metadata': null,
        'recipient_metadata': [],
        'attachments': [],
        'images': []
      };
      var async = false;
      var ipPool = null;
      var sendAt = null;

      mandrillClient.messages.send({
        'message': message,
        'async': async,
        'ip_pool': ipPool,
        'send_at': sendAt
      }, function(result) {
        cb(result);
      }, function(e) {
        console.error('Mandill error occurred: ' + e.name + ' - ' + e.message);
      });
    }
    next();
  }
};
