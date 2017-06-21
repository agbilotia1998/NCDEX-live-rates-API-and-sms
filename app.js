var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

function rates() {


    url = 'https://www.ncdex.com/MarketData/LiveFuturesQuotes.aspx';

    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var json = [];
            var arr = [];
            var result = "";

            $('#ctl00_ContentPlaceHolder3_dgLiveFuturesQuotes tr td').each(function (i, elem) {
                arr[i] = $(this).text();
                arr[i] = arr[i].replace(/\s/g, '');
            });

            var length = $('#ctl00_ContentPlaceHolder3_dgLiveFuturesQuotes tr').length;


            for (var count = 0; count < length - 1; count++) {
                var Name = arr[count * 15];
                var Expiry = arr[1 + count * 15];
                var High = arr[3 + count * 15];
                var Low = arr[4 + count * 15];
                var Price = arr[6 + count * 15];
                json[count] = {Name: Name, Expiry: Expiry, High: High, Low: Low, Price: Price};

                if (json[count].Name == 'Barley' || json[count].Name == 'CottonSeedOilcake' || json[count].Name == 'GuarSeed10MT' || json[count].Name == 'Kapas'
                    || json[count].Name == 'Mustardseed' || json[count].Name == 'SoyBean')
                    result = result + json[count].Name + ' ' + json[count].Expiry + ' ' + json[count].Price + '\n';
            }

            console.log(result);

//require the Twilio module and create a REST client
            var client = require('twilio')(accountSid, authToken);

            client.messages.create({
                to: "+91",
                from: "+12488094534 ",
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


        }


    });


}

app.listen('5000', function () {
    console.log("App running on port 5000");
});
setInterval(rates,30*60*1000);