const period = 1; // in minutes

chrome.runtime.onInstalled.addListener(function(){
    runAlertSystem();
})

chrome.runtime.onStartup.addListener(function(){
    runAlertSystem();
})

// chrome.action.onClicked.addListener(function(){
//     runAlertSystem();
// })

function runNotification(notify_id, price_a, symbol){
    // fetch all alerts from chrome sync storage
    chrome.notifications.create(notify_id, {
        type: 'basic',
        iconUrl: '../images/tr128.png',
        title: 'Sympto: Crypto Price Alert',
        message: symbol.toUpperCase() + " has fallen below $" + price_a + " USD",
        priority: 2,
        
    }, function() {})
}


function runAlertSystem(){
    console.log("background started!")
    const apiKey = "6dcd4f6925dee5654c6d1d564d97d4a922721b8258e5490e0dfc34fcb70c3606";
    const urlFirst = "https://min-api.cryptocompare.com/data/price?fsym=";
    const urlSecond = "&tsyms=";
    // run this script in an interval, constantly
    chrome.alarms.create("myAlarm", {delayInMinutes: 0.1, periodInMinutes: period} );
    let price_map = new Map();
    let alerts_map = new Map();
    chrome.alarms.onAlarm.addListener(() => {
        console.log("alarm fired")
        // fetch from chrome sync storage all price alerts (symbol, price_a, notify_id)
        chrome.storage.sync.get(['alerts'], function(result) {
            alerts = []
            if(result['alerts']==undefined){
                chrome.storage.sync.set({'alerts':[]});
            } else{
                alerts = result['alerts']
            }
            
            // in alerts, there are alerts stored in the form of 
            // notify_id: symbol-id-price. Need to parse each item to get price alert items
            for(var i = 0; i < alerts.length; i++){
                // parse the symbol
                notify_id = alerts[i]
                console.log(notify_id)
                var sym_end;
                for(var c=0; c < notify_id.length; c++){
                    if(notify_id.charAt(c) == '_'){
                        sym_end = c;
                        break
                    }
                }
                symbol = notify_id.substring(0,sym_end)
                
                // parse the price
                var price_start
                var x = notify_id.length - 1
                while(x >= 0){
                    if(notify_id.charAt(x)=='_'){
                        price_start = x+1
                        break
                    }
                    x = x-1;   
                }
                price = parseFloat(notify_id.substring(price_start, notify_id.length))
                
                // append alert price to the alerts_map
                if(alerts_map.get(symbol)==undefined){
                    alerts_map.set(symbol, [])
                }
                else {
                    var tmp = alerts_map.get(symbol)
                    if(!tmp.includes(price)){
                       tmp.push(price) 
                    }
                    alerts_map.set(symbol, tmp)
                }
                // console.log(symbol, price)
            }
        })


        // for each symbol, fetch current price. Store in a hashmap {symbol: price}
        // let price_map = new Map();
        var sym_global = [];
        chrome.storage.sync.get(null, (items) => {
            if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
            }
            arr = items['symbols'];
            sym_global = items['symbols'];
            if(arr?.length>0){
                for(var i=0; i<arr.length; i++){
                    let sym1 = arr[i];  
                    var json;
                    const url = urlFirst + sym1 + urlSecond + 'USD&api_key=' + apiKey;
                    fetch(url)
                        .then(r => {
                            return r.text()
                        })
                        .then(response => {
                            json = JSON.parse(response)
                            price = json["USD"]
                            price_map.set(sym1, price)
                            console.log("get in loop", price_map.get(sym1))
                        }) 
                }
            }
        });
        console.log(price_map)
        console.log(alerts_map)

        // for each alert, if current <= price_a, call runNotification()
        for (let [sym, alert_arr] of alerts_map.entries()) {
            console.log("yes")
            var current = price_map.get(sym)
            var closest = 100000
            var end_target = 0
            //for all alerts of a given symbol, find the closest to the 
            //price target that is below the current price and also within 5 dollars range
            alert_arr.forEach(target => {
                if(Math.abs(target-current)<closest){
                    closest = Math.abs(target-current)
                    end_target = target
                }
            })
            console.log(end_target)
            // end_target saves the best price alert that is closest to current price and higher than the current price
            if(closest < 5 && current < end_target){
                console.log("notify!")
                runNotification(String(Date.now()), end_target, sym)
                removeAlert(sym, end_target)
            }
        }

    });
}


function removeAlert(sym, price_target){
    chrome.storage.sync.get(null, (items) => {
        if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
        }
        alerts = items['alerts'];
        for(var i = 0; i < alerts.length; i++){
            // parse the symbol
            notify_id = alerts[i]
            var sym_end;
            for(var c=0; c < notify_id.length; c++){
                if(notify_id.charAt(c) == '_'){
                    sym_end = c;
                    break
                }
            }
            symbol = notify_id.substring(0,sym_end)
            
            // parse the price
            var price_start
            var x = notify_id.length - 1
            while(x >= 0){
                if(notify_id.charAt(x)=='_'){
                    price_start = x+1
                    break
                }
                x = x-1;   
            }
            price = parseFloat(notify_id.substring(price_start, notify_id.length))
            hash = notify_id.substring(sym_end+1, price_start-1)

            if(sym==symbol && price==price_target){
                //remove alert key value pair from storage
                chrome.storage.sync.remove(notify_id, function(item) {
                    console.log("Removed key value pair")
                    // remove alerts on the UI right away
                    // price_alert_id = "price-alert-" + hash
                    // delete_id =  "delete-" + hash
                    // $( price_alert_id ).remove();
                    // $( delete_id ).remove();
                });
                //remove alert from alert array in storage
                index = alerts.indexOf(notify_id)
                if(index>-1){
                    alerts.splice(index,1)
                }
                chrome.storage.sync.set({'alerts':alerts});
            }
        }
    })
}

