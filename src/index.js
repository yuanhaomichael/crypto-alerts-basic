

$(document).ready(function(){
    const apiKey = "6dcd4f6925dee5654c6d1d564d97d4a922721b8258e5490e0dfc34fcb70c3606";
    const urlFirst = "https://min-api.cryptocompare.com/data/price?fsym=";
    const urlSecond = "&tsyms=";
    const form = $('#symform');
    

    // event triggered when "Check Price" is clicked, to check price of a symbol
    $('#symform').on('submit', function( e ){ 
        e.preventDefault();
        var sym = $("input").first().val()
        getPrice(sym);
    });
 
    // event triggered when "Add to Watchlist" is clicked, to add a symbol to watchlist
    $('#add-to-watchlist').on('click', function( e ){
        e.preventDefault();
        var sym = $("input").first().val()
        addToList(sym);
    })

    // call API to get the price of a symbol
    function getPrice(a){
        symbol = a;
        // console.log(symbol)
        const url = urlFirst + symbol + urlSecond + 'USD&api_key=' + apiKey;
        fetch(url)
            .then(r => {
                return r.text()
            })
            .then(response => {
                var json = JSON.parse(response)
                var price = json["USD"] 
                console.log(price)
                if(price!=undefined){   
                    $('.error').html("")
                    $('#price').html("<p></p>")
                    $('#price').append(price)
                    $('#price').append(" USD")
                    $('#price').css("font-weight", "100")
                    $('#price').css("font-size", "12px")
                } else {
                    $('#price').html("<p></p>")
                    $('.error').html("<p>Doesn't exist!</p>")
                    $('.error').css("font-weight", "100")
                    $('.error').css("font-size", "12px")
                    $('.error').css("display", "inline-block")
                }
         
        })    
    }
    var alreadyExist = 0;
    // add a symbol to watchlist and call API to display its price
    // update the price every hour
    function addToList(a){
        
        symbol = a;
        const url = urlFirst + symbol + urlSecond + 'USD&api_key=' + apiKey;
        fetch(url)
            .then(r => {
                return r.text()
            })
            .then(response => {
                var json = JSON.parse(response)
                var price = json["USD"] 
                if(price!=undefined){   
                    // price and symbol are inserted into the item block
                    var newId = 'watchlist-item' + "-" + symbol;
                    var newId2 = "#" + newId;
                    if($('body').find(newId2).length==0){
                        $('body').append("<div id=\"sample\"></div>")
                        $('#sample').attr('id', newId);
                    } 
                    
                    // $('#watchlist-item').attr('id', newId);
                    var upperSymbol = symbol.toUpperCase();
                    $("#watchlist-item").find('#symbol-name').html("<span></span>");
                    $("#watchlist-item").find('#symbol-name').append(upperSymbol);
                    $("#watchlist-item").find('#symbol-price').html("<span></span>");
                    $("#watchlist-item").find('#symbol-price').append(price);
                    $("#watchlist-item").find('#symbol-price').append(" USD");
                    
                    
                    // append item to body 
                    var item = $('#watchlist-item-wrapper').html();
                    console.log(item)
                    if($(newId2).find("#watchlist-item").length==0){
                        $(newId2).append(item)
                        $('#tooltip').css("display", "none")
                    }
                    $(newId2).find('#watchlist-item').css("display", "block")
                    
                    
                    
                    
                } else {
                    $('.error-watchlist').html("<p>Error!</p>")
                    $('.error-watchlist').css("font-weight", "100")
                    $('.error-watchlist').css("font-size", "12px")
                    $('.error-watchlist').css("display", "inline-block")
                }
            })    
    }
})
