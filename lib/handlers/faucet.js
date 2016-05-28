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
      res.status(200)
      res.header('Content-Type', 'text/html');
      res.write('Faucet Balance : ' + Math.round(ret).toString());
      res.write('<br>\n');
      res.write('Next payout : ' + payout)
      res.write('<br>\n');
      res.write('<form method=post action=addcredits>Which year was the web invented?')
      res.write('<br>\n');
      res.write('<input name=year> ')
      res.write('<br>\n');
      res.write('<input type="submit" value="Submit"> </form> ')
      res.end()
    }
    sequelize.close();
  });


}
