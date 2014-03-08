var cheerio = require('cheerio');

module.exports.parse = function( md ){

    var self = this;

    self.parse = function( text ){
        text = self.youtube( text );
        self.html = self.imgResponsive( md( text ) );
        return self.html;
    }

    self.imgResponsive = function( html ){
        $ = cheerio.load(html);
        $('img').addClass('img-responsive');
        return $.html();
    }

    self.youtube = function( text ){
        var yturl= /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([\w\-]{10,12})(?:&feature=related)?(?:[\w\-]{0})?/g;
        var ytplayer= '<div class="video-container"><iframe width="640" height="360" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>';
        return text.replace(yturl, ytplayer);
    }
}