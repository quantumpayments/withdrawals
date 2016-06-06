module.exports = handler

var debug = require('../debug').insert
var wc = require('webcredits')
var fs = require('fs')
var wc_db = require('wc_db')

function handler(req, res) {

  var origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  var defaultCurrency = res.locals.config.currency || 'https://w3id.org/cc#bit'

  var source      = req.body.source
  var destination = req.body.destination
  var currency    = req.body.currency || defaultCurrency
  var amount      = req.body.amount
  var timestamp   = null
  var description = req.body.description
  var context     = req.body.context


  var source      = req.session.userId

  if (!req.session.userId) {
    res.send('Must be authenticated via WebID.  Get a webid <a href="https://databox.me/">NOW</a>!')
    return
  }

  var faucetURI = 'https://w3id.org/cc#faucet'

  var config = res.locals.config

  var sequelize = wc_db.getConnection(config.db)
  wc.getBalance(faucetURI, sequelize, config, function(err, ret){
    if (err) {
      console.error(err)
    } else {
      console.log(ret)
      if (ret === null) {
        ret = 0
      }
      var payout = Math.abs(ret / 100.0)
      config.ui.wallet = config.wallet
      res.status(200)
      res.header('Content-Type', 'text/html')

      res.render('pages/home', { ui: config.ui })

    }
    sequelize.close()
  })


}
