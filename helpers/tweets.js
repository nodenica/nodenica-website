var Twit = require('twit');
var models = require('../models');
var config = require('../config');

exports.enable = function(){

    var twit = new Twit(config.twitter.twit);

    var stream = twit.stream('statuses/filter', { track: config.twitter.hashtag });

    stream.on('tweet', function (tweet) {

        var row = new models.tweets;

        row.id_str = tweet.id_str;
        row.text = tweet.text;
        row.screen_name = tweet.user.screen_name;
        row.save(function(err){});

    });

}

exports.parse = function(tweet){
    var new_tweet = tweet;

    new_tweet.text = new_tweet.text.replace(/#(\S*)/g,'<a href="http://twitter.com/#!/search/$1" target="_blank">#$1</a>');
    new_tweet.text = new_tweet.text.replace(/@(\S*)/g,'<a href="http://twitter.com/$1" target="_blank">@$1</a>');

    return new_tweet;
}