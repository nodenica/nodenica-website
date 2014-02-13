var S = require( 'string' );

exports.parseTitle = function( title ){
    var result = '';
    if(title.length >= 53){
        result = S(title).left(53).s + '...';
    }
    else{
        result = title;
    }

    return result;
}