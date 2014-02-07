var nav = {
    select: function(id){
        $("#"+id).addClass('selected');
    }
}

var streaming = {
    ajax: function(){
        $.ajax({
            type: "get",
            url: "/streaming",
            dataType: "JSON",
            success: function( a ){
                if( a.length > 0 ){
                    $.each(a,function(i,item){
                        streaming.append( item, "#streamingBody" );
                    });
                }

            }
        })
    },
    append: function( string, container ){
        var tr = $('<tr></tr>');
        var td = $('<td></td>').html( string ).fadeIn("slow");

        tr.append( td );

        $(container).append( tr );

    }
}

var download = function(){
    (function(d,n) {
        var os = n.platform.match(/(Win|Mac|Linux)/);
        var x = n.userAgent.match(/x86_64|Win64|WOW64/) ||
            n.cpuClass === 'x64' ? 'x64' : 'x86';
        var base = 'http://nodejs.org/dist/v0.10.25/';
        var href = 'node-v0.10.25.tar.gz';
        var db = d.getElementById('downloadbutton');
        var d2;
        switch (os && os[1]) {
            case 'Mac':
                href = 'node-v0.10.25.pkg';
                break;
            case 'Win':
                href = 'node-v0.10.25-' + x + '.msi';
                if (x === 'x64') href = 'x64/' + href;
                break;
        }

        db.href = base + href;
        // if there's one download option, then download it at #download
        if (location.hash === '#download' && !d2)
            location.replace(b.href);
    })(document,navigator);
}

var socket = {
    get: function( data ){
        socket[data.type](data);
    },
    tweet: function(tweet){
        var html = '<tr><td><strong><a href="https://twitter.com/'+tweet.screen_name+'" target="_blank">'+tweet.screen_name+'</a></strong>: '+tweet.text+' &nbsp;<a href="https://twitter.com/nodenica/status/'+tweet.id_str+'" target="_blank">Abrir</a></td></tr>';
        $(".tweet-box table tbody").prepend(html);
    },
    activity: function( activity ){
        $("#streamingBody").prepend('<tr><td style="display: table-cell;">'+activity.html+'</td></tr>');
    }

}