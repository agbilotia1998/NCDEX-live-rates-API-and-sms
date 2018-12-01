var express = require('express');
var config = require('./config');
var request = require('request').defaults({'proxy': config.proxy});
var cheerio = require('cheerio');
var app     = express();

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
};

function rates() {
    console.log('INn');
    var opts = {
        url: 'https://www.ncdex.com/MarketData/LiveFuturesQuotes.aspx',
        strictSSL: false
    };

    request(opts, function (error, response, html) {
        if (!error) {
            console.log('INNN');
            var $ = cheerio.load(html);
            var jsonData = [];
            var headerMap = new Map();
            var data = new Array( $('#ctl00_ContentPlaceHolder3_dgLiveFuturesQuotes tr').length - 1);
            var result = "";
            var content = "";
            var row = 0;
            var column = 0;
            var items = data.length;
            var values = $('#dummyHeader tr th').length - 1;
            var requiredItems = ['Barley', 'CottonSeedOilcake', 'GuarSeed10MT', 'Kapas', 'Mustardseed', 'SoyBean'];

            for(var i = 0; i < items; i++) {
                data[i] = new Array(values);
            }

            $('#ctl00_ContentPlaceHolder3_dgLiveFuturesQuotes tr td').each(function (count, element) {
                content = $(element).text();
                data[row][column] = content.replace(/\s/g, '');

                if(data[row][column] === ''){
                    column = 0;
                    row++;
                }
                else {
                    column += 1;
                }
            });

            $('#dummyHeader tr th').each(function(count, element) {
               content = $(element).text();
               content = content.replace(/\s/g, '');
               headerMap.set(content, count);
            });

            for (var count = 0; count < items; count++) {
                var itemName = data[count][headerMap.get('ProductName')];
                var expiryDate = data[count][headerMap.get('ExpDT')];
                var highValue = data[count][headerMap.get('High')];
                var lowValue = data[count][headerMap.get('Low')];
                var price = data[count][headerMap.get('LTP')];
                jsonData[count] = {
                                Name: itemName,
                                Expiry: expiryDate,
                                High: highValue,
                                Low: lowValue,
                                Price: price
                              };

                if (requiredItems.contains(jsonData[count].Name))
                    result = result + jsonData[count].Name + ' ' + jsonData[count].Expiry + ' ' + jsonData[count].Price + '\n';
            }

            console.log(result);
            var accountSid = process.env.id;
            var authToken = process.env.token;
            var client = require('twilio')(accountSid, authToken);

            client.messages.create({
                to: "+917705894165",
                from: "+12488094534",
                body: result

                //mediaUrl: "https://c1.staticflickr.com/3/2899/14341091933_1e92e62d12_b.jpg",
            }, function (err, message) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(message.sid);
                }
            });


        } else{
            console.log(error);
        }
    });
}

app.listen('5000'||process.env.PORT, function () {
    console.log("App running on port 5000");
    //rates();
    setInterval(rates, 30*60*1000);
});
