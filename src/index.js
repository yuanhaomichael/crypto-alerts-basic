$(document).ready(function(){
    const apiKey = "6dcd4f6925dee5654c6d1d564d97d4a922721b8258e5490e0dfc34fcb70c3606";
    const urlFirst = "https://min-api.cryptocompare.com/data/price?fsym=";
    const urlSecond = "&tsyms=";
    const form = $('#symform');
    
    // update price of all symbols on the watchlist
    $("body").ready(function(){    
        loadSymbols();  
    });

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
                // console.log(price)
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
                    // add a new div with id "watchlist-item-[symbol]"
                    $('.error-watchlist').html("<p></p>")
                    var newId = 'watchlist-item' + "-" + symbol;
                    var newId2 = "#" + newId;
                    if($('body').find(newId2).length==0){
                        $('body').append("<div id=\"sample\"></div>")
                        $('#sample').attr('id', newId);
                    } 
                    
                    // modify template watchlist-item
                    var upperSymbol = symbol.toUpperCase();
                    $("#watchlist-item").find('#symbol-name').html("<span></span>");
                    $("#watchlist-item").find('#symbol-name').append(upperSymbol);
                    $("#watchlist-item").find('#symbol-price').html("<span></span>");
                    $("#watchlist-item").find('#symbol-price').append(price);
                    $("#watchlist-item").find('#symbol-price').append(" USD");
                    
                    
                    // get the html and append it to the "watchlist-item-[symbol]" div
                    var item = $('#watchlist-item-wrapper').html();
                    if($(newId2).find("#watchlist-item").length==0){
                        $(newId2).append(item)
                        $('#tooltip').css("display", "none")

                        idStore = "#watchlist-item-" + symbol;
                        var storeItem = $(idStore).prop('outerHTML');
                        // store user data, the symbol itself, and the code snippet
                        storeSymbol(String(symbol), storeItem);

                        $('.error-watchlist').html("<p>Success!</p>")
                        $('.error-watchlist').css("font-weight", "100")
                        $('.error-watchlist').css("font-size", "12px")
                        $('.error-watchlist').css("display", "inline-block")

                    } else {
                        // user already added this symbol
                        $('.error-watchlist').html("<p>Already exists!</p>")
                        $('.error-watchlist').css("font-weight", "100")
                        $('.error-watchlist').css("font-size", "12px")
                        $('.error-watchlist').css("display", "inline-block")
                    }
                    $(newId2).find('#watchlist-item').css("display", "block")               
                } else {
                    $('.error-watchlist').html("<p>Doesn't exist!</p>")
                    $('.error-watchlist').css("font-weight", "100")
                    $('.error-watchlist').css("font-size", "12px")
                    $('.error-watchlist').css("display", "inline-block")
                }
            })    
    }


    
    // store a key value pair such that the key is "symbols"
    // the value is an array, to keep track of all symbols on the watchlist
    // Uses chrome storage to store the symbols on the watchlist
    function storeSymbol(symbol, item){
        var key = symbol,
        jsonfile = {};
        jsonfile[key] = item;
        chrome.storage.sync.set(jsonfile, function() {
            // console.log('Value is set to ' + symbol + item);
        });

        tmp = [];
        chrome.storage.sync.get(['symbols'], function(result) {
            if(result['symbols']==undefined){
                chrome.storage.sync.set({'symbols':[]});
            } else{
                tmp = result['symbols']
                if(!tmp.includes(symbol)){
                    tmp.push(symbol)
                }
                chrome.storage.sync.set({'symbols': tmp});
            }
            // console.log(result)
        });

    }


    // Get from chrome storage all the symbols on the watchlist
    // format is {symbol: code_snippet}
    function loadSymbols(){
        chrome.storage.sync.get(null, (items) => {
            // Pass any observed errors down the promise chain.
            if (chrome.runtime.lastError) {
              return reject(chrome.runtime.lastError);
            }

            // Pass the data retrieved from storage down the promise chain.
            // get all the symbols from watchlist
            arr = items['symbols'];
            if(arr?.length>0){
                for(var i=0; i<arr.length; i++){
                    // for each symbol on the watchlist, append code snippet to body, and update price
                    let sym1 = arr[i];
                    let code = items[sym1];
                    $('body').append(code);
                    let id_name = "#watchlist-item-" + sym1;
                    $('#tooltip').css("display", "none")
                    // console.log(code)
                    
                    var json;
                    const url = urlFirst + sym1 + urlSecond + 'USD&api_key=' + apiKey;
                    fetch(url)
                        .then(r => {
                            return r.text()
                        })
                        .then(response => {
                            json = JSON.parse(response)
                            price = json["USD"]  
                            // console.log(sym1, ":", price)
                            $(id_name).find('#symbol-price').html("<span></span>"); 
                            $(id_name).find('#symbol-price').append(price);  
                            $(id_name).find('#symbol-price').append(" USD"); 
                            $(id_name).find('#watchlist-item').css("display", "block") 
                        }) 
                }
            }
        });
              
    }

    // CLEAR SYNC STORAGE: 
    chrome.storage.sync.clear(); 

   
    // when "Add New Alert" button is clicked, add an empty alert form
    $('body').on('click', '#add-new-alert', function( e ){
        e.preventDefault();
        // get the symbol name from parent div
        console.log("hi")
        // add the alert form under the symbol name
    })
 



    // when user sets a price alert, store this alert in the sync storage of chrome
    // in the format: {[symbol]_1: alert code snippet}
    // parse the speific alert, use triggerAlert() to trigger notification
    $('body').on('click', '#set-alert', function( e ){
        e.preventDefault();
        // get the symbol name from parent div
        console.log("hey")
        // get price target from the form
        // trigger alert

        // display alert under symbol name

    })

    // trigger a browser notification when an alert condition is met
    function triggerAlert(symbol, target){
        // chrome.notifications.create
    }

})
