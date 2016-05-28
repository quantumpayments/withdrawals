module.exports = handler

var debug = require('../debug').insert
var wc = require('webcredits')
var fs = require('fs')

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

  var faucetURI = 'https://w3id.org/cc#faucet'

  var config = require('../../config/dbconfig.js');

  var sequelize = wc.setupDB(config);
  wc.getBalance(faucetURI, sequelize, config, function(err, ret){
    if (err) {
      console.error(err);
    } else {
      console.log(ret);
      if (ret === null) {
        ret = 0
      }

      var payout = Math.floor(ret / 100.0)

      res.header('Content-Type', 'text/html')
      res.status(200)
      res.write('Balance : ' + ret.toString());
      res.write('<br>\n')
      res.write('you chose year : ' + req.body.year);
      res.write('<br>\n')

      if (req.body.year === '1989') {
        res.write('Correct!')

        var credit = {};

        credit["https://w3id.org/cc#source"] = faucetURI
        credit["https://w3id.org/cc#amount"] = payout
        credit["https://w3id.org/cc#currency"] = 'https://w3id.org/cc#bit'
        credit["https://w3id.org/cc#destination"] = req.session.userId


        wc.insert(credit, res.locals.sequelize, res.locals.config, function(err, ret) {
          if (err) {
            res.write(err);
          } else {
            res.write('<br>\n')
            res.write(payout + ' has been added to your <a href="/balance">balance</a>')
            res.write('<br>\n')
          }
          res.write('<br>\n')

          res.end()

        });

      } else {
        res.write('Wrong answer.  Please go back and try again.')
      }
    }
    sequelize.close();
  });


}
