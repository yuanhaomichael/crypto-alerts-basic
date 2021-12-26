

$(document).ready(function(){
    const apiKey = "6dcd4f6925dee5654c6d1d564d97d4a922721b8258e5490e0dfc34fcb70c3606";
    const urlFirst = "https://min-api.cryptocompare.com/data/price?fsym=";
    const urlSecond = "&tsyms=";

    const form = $('#symform');
  
    $('#symform').on('submit', function( e ){ 
        e.preventDefault();
        var sym = $("input").first().val()
        getSym(sym);
         
        // console.log(sym);
    });

    function getSym(a){
        symbol = a;
        console.log(symbol)
        const url = urlFirst + symbol + urlSecond + 'USD&api_key=' + apiKey;
        console.log(url)
        var ok = 0;
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
                } else {
                    $('.error').html("<p>No such symbol exists</p>")
                }
         
        }) 
        
      
    }
})
