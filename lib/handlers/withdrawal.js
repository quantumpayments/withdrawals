module.exports = handler

var debug    = require('debug')('qpm_withdrawal:withdrawal')
var hdwallet = require('qpm_hdwallet')
var http     = require('http')
var fs       = require('fs')
var qpm_ui   = require('qpm_ui')
var wc       = require('webcredits')
var wc_db    = require('wc_db')
var $rdf     = require('rdflib')


function $r(subject, predicate, callback) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  var store   = $rdf.graph()
  var timeout = 5000 // 5000 ms timeout
  var fetcher = new $rdf.Fetcher(store, timeout)

  var url     = subject.split('#')[0]

  fetcher.nowOrWhenFetched(url, function(ok, body, xhr) {

    if (ok) {
      if (predicate) {
        var st = store.statementsMatching($rdf.sym(subject), $rdf.sym(predicate))
        callback(null, st)
      } else {
        var st = store.statementsMatching($rdf.sym(subject))
        callback(null, st)
      }
    } else {
      callback(new Error('fetch failed'))
    }
  })
}


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
    res.send('must be authenticated')
    return
  }


  var config = res.locals.config
  var sequelize = wc_db.getConnection(config.db)

  var address = config.HDPublicKey || 'xpub661MyMwAqRbcH4Jage4yavGhxdhv48gniC2S4irQG3Rj78t9pbTQch3PpqKvwunq7cuYeLEQ6VA1C3wcyk8MKspGqAtU9agfNcn2KBDvM6U'

  var dep = hdwallet.webidAndPubKeyToAddress(source, address, true)
  var depURI = 'bitcoin:' + dep
  var swept = 0
  var inledger = 0


  $r(config.wallet, 'http://xmlns.com/foaf/0.1/maker', function(err, statements1) {
    console.log(statements1)
    if (!statements1 || statements1.length === 0) {
      res.status(200)
      res.header('Content-Type', 'text/html')

      config.ui.deposit = dep
      res.render('pages/withdrawal_error', { ui: config.ui })

      res.end()
      return
    }
    $r(statements1[0].object.uri,  'http://www.w3.org/ns/solid/terms#inbox', function(err, statements2) {
      if (!statements2 || statements2.length === 0) {
        res.status(200)
        res.header('Content-Type', 'text/html')

        config.ui.deposit = dep
        res.render('pages/withdrawal_error', { ui: config.ui })

        res.end()
        return
      }

      var inbox = statements2[0].object.uri



      http.get('http://tbtc.blockr.io/api/v1/address/balance/' + dep, function(json){
        var body = ''

        json.on('data', function(chunk){
          body += chunk
        })

        json.on('end', function(){



          var j = JSON.parse(body)
          var bal = 0
          if (j && j.data && j.data.balance) {
            bal = j.data.balance
          }
          console.log("Address balance: ", bal)

          wc.getDeposit(depURI, sequelize, config, function(err, cleared) {

            if (err) {
              console.log('error')
            } else {

              wc.getSpent(depURI, sequelize, config, function(err, swept) {
                if (err) {
                  console.log('error')
                } else {

                  wc.getBalance(depURI, sequelize, config, function(err, inledger) {
                    if (err) {
                      console.log('error')
                    } else {

                      res.status(200)
                      res.header('Content-Type', 'text/html')

                      config.ui.deposit = dep
                      config.ui.balance = bal*1000000
                      config.ui.cleared = cleared
                      config.ui.inledger = inledger
                      config.ui.swept = swept
                      config.ui.inbox = inbox

                      res.render('pages/withdrawal', { ui: config.ui })


                    }
                  })

                }

              })



            }


          })



        })
      }).on('error', function(e){
        console.log("Got an error: ", e)
      })



    })
  })





}
