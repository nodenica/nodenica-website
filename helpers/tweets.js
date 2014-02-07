var Twit = require('twit');
var models = require('../models');
var config = require('../config');

exports.enable = function( socketio ){

    var twit = new Twit(config.twitter.twit);

    var stream = twit.stream('statuses/filter', { track: config.twitter.hashtag });

    stream.on('tweet', function (tweet) {

        var row = new models.tweets;

        row.id_str = tweet.id_str;
        row.text = tweet.text;
        row.screen_name = tweet.user.screen_name;
        row.save(function(err){
            if( !err ){
                socketio.send({type:'tweet', id_str: row.id_str, text: autoLink(row.text), screen_name: row.screen_name  });
            }
        });

    });

}
var autoLink = function(text)
{
    var base_url = 'http://twitter.com/';   // identica: 'http://identi.ca/'
    var hashtag_part = 'search?q=#';        // identica: 'tag/'
    // convert URLs into links
    text = text.replace(
        /(>|<a[^<>]+href=['"])?(https?:\/\/([-a-z0-9]+\.)+[a-z]{2,5}(\/[-a-z0-9!#()\/?&.,]*[^ !#?().,])?)/gi,
        function($0, $1, $2) {
            return ($1 ? $0 : '<a href="' + $2 + '" target="_blank">' + $2 + '</a>');
        });
    // convert protocol-less URLs into links
    text = text.replace(
        /(:\/\/|>)?\b(([-a-z0-9]+\.)+[a-z]{2,5}(\/[-a-z0-9!#()\/?&.]*[^ !#?().,])?)/gi,
        function($0, $1, $2) {
            return ($1 ? $0 : '<a href="http://' + $2 + '">' + $2 + '</a>');
        });
    // convert @mentions into follow links
    text = text.replace(
        /(:\/\/|>)?(@([_a-z0-9\-]+))/gi,
        function($0, $1, $2, $3) {
            return ($1 ? $0 : '<a href="' + base_url + $3
                + '" title="Follow ' + $3 + '" target="_blank">@' + $3
                + '</a>');
        });
    // convert #hashtags into tag search links
    text = text.replace(
        /(:\/\/[^ <]*|>)?(\#([_a-z0-9\-]+))/gi,
        function($0, $1, $2, $3) {
            return ($1 ? $0 : '<a href="' + base_url + hashtag_part + $3
                + '" title="Search tag: ' + $3 + '" target="_blank">#' + $3
                + '</a>');
        });
    return text;
}

module.exports.autoLink = autoLink;