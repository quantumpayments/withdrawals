module.exports = createServer

// requires
var Sequelize  = require('sequelize')
var express    = require('express')
var bodyParser = require('body-parser')
var https      = require('https')
var fs         = require('fs')

var wc         = require('../')
var createApp  = require('./create-app')
var $rdf       = require('rdflib')


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



/**
* server function
* @param  {Object} config [description]
*/
function createServer(argv) {
  // vars
  var sequelize

  var config = wc.getConfig()

  var defaultCurrency = 'https://w3id.org/cc#bit'
  var defaultDatabase = 'webcredits'
  var defaultWallet   = 'https://localhost/wallet/test#this'

  config.currency = argv.currency || config.currency || defaultCurrency
  config.database = argv.database || config.database || defaultDatabase
  config.wallet   = argv.wallet   || config.wallet   || defaultWallet
  config.key      = argv.key      || null
  config.cert     = argv.cert     || null

  var port = argv.port

  // run main
  sequelize = wc.setupDB(config)

  var app = express()
  wcApp = createApp(null, sequelize, config)
  app.use('/', wcApp)

  var defaultPort = 11077
  port = port || defaultPort

  console.log(config)

  var key
  try {
    key = fs.readFileSync(config.key)
  } catch (e) {
    throw new Error('Can\'t find SSL key in ' + config.key)
  }

  var cert
  try {
    cert = fs.readFileSync(config.cert)
  } catch (e) {
    throw new Error('Can\'t find SSL cert in ' + config.cert)
  }

  var credentials = {
    key: key,
    cert: cert,
    requestCert: true
  }

  $r(config.wallet, 'https://w3id.org/cc#HDPublicKey', function(err, ret) {
    if (!err) {
      console.log('Public key fetched : ' + ret[0].object.value)
      config.HDPublicKey = ret[0].object.value
    }
  })


  server = https.createServer(credentials, app)

  return server

}
