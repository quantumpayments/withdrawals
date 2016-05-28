module.exports = handler

var debug = require('../debug').insert
var wc = require('webcredits')
var fs = require('fs')
var hdwallet = require('qpm_hdwallet');
var http = require('http');

function handler(req, res) {

  var origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  var defaultCurrency = res.locals.config.currency || 'https://w3id.org/cc#bit';

  var source      = req.body.source;
  var destination = req.body.destination;
  var currency    = req.body.currency || defaultCurrency;
  var amount      = req.body.amount;
  var timestamp   = null;
  var description = req.body.description;
  var context     = req.body.context;


  var source      = req.session.userId

  if (!req.session.userId) {
    res.send('must be authenticated')
    return
  }


  var config = require('../../config/dbconfig.js');
  var sequelize = wc.setupDB(config);

  var address = config.HDPublicKey || 'xpub661MyMwAqRbcH4Jage4yavGhxdhv48gniC2S4irQG3Rj78t9pbTQch3PpqKvwunq7cuYeLEQ6VA1C3wcyk8MKspGqAtU9agfNcn2KBDvM6U'

  var dep = hdwallet.webidAndPubKeyToAddress(source, address, true)
  var depURI = 'bitcoin:' + dep
  var swept = 0

  http.get('http://tbtc.blockr.io/api/v1/address/balance/' + dep, function(json){
      var body = '';

      json.on('data', function(chunk){
          body += chunk;
      });

      json.on('end', function(){
          var j = JSON.parse(body);
          var bal = 0
          if (j && j.data && j.data.balance) {
            bal = j.data.balance
          }
          console.log("Address balance: ", bal);

          wc.getDeposit(depURI, sequelize, config, function(err, deposit) {

            if (err) {
              console.log('error')
              return
            } else {

              var credit = {};

              credit["https://w3id.org/cc#source"] = depURI
              credit["https://w3id.org/cc#amount"] = bal * 1000000
              credit["https://w3id.org/cc#currency"] = 'https://w3id.org/cc#bit'

              wc.deposit(credit, sequelize, config, function(err, cleared) {


                if (err) {
                  res.header('Content-Type', 'text/html');
                  res.write('Could not clear funds, or funds are already cleared' );
                  res.write('<br>\n');
                  res.write('<a href="/">Home</a> | <a href="/deposit">Deposit</a> | <a href="/clear">Clear</a> | <a href="/toledger">To Ledger</a> | <a href="/sweep">Sweep</a>')
                  res.end()
                  return

                } else {

                  res.header('Content-Type', 'text/html');
                  res.write('Cleared funds : ' + bal*1000000 );
                  res.write('<br>\n');
                  res.write('<a href="/">Home</a> | <a href="/deposit">Deposit</a> | <a href="/clear">Clear</a> | <a href="/sweep">Sweep</a>')
                  res.end()


                  credit["https://w3id.org/cc#source"] = depURI
                  credit["https://w3id.org/cc#amount"] = bal * 1000000
                  credit["https://w3id.org/cc#currency"] = 'https://w3id.org/cc#bit'
                  credit["https://w3id.org/cc#destination"] = source

                  /*
                  wc.insert(credit, sequelize, config, function(err, res) {
                    if (err) {
                    } else {
                      console.log('done');
                    }
                  })
                  */
                }
              })
            }


          })



      });
  }).on('error', function(e){
        console.log("Got an error: ", e);
  });



}
