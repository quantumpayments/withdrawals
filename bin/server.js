#!/usr/bin/env node

// requires
var createApp  = require('../lib/create-app')
var debug      = require('debug')('qpm_testcoin:server.js')
var express    = require('express')
var program    = require('commander')
var wc_express = require('wc_express')

function bin(argv) {

  program
  .option('-c, --currency <currency>', 'Currency')
  .option('-p, --port <n>', 'Port', parseInt)
  .option('-d, --database <database>', 'Database')
  .option('-w, --wallet <wallet>', 'Wallet')
  .option('--key <key>', 'Key')
  .option('--cert <cert>', 'Cert')
  .parse(argv)

  var app
  try {
    app = wc_express.createServer(program, createApp)
  } catch (e) {
    if (e.code === 'EACCES') {
      console.error('You need root privileges to start on this port')
      return 1
    }
    if (e.code === 'EADDRINUSE') {
      console.error('The port ' + argv.port + ' is already in use')
      return 1
    }
    console.error(e.message)
    console.error(e.stack)
    return 1
  }

  try {
    app.listen(program.port, function () {
      console.log('Server started on port ' + program.port)
    })
  } catch (e) {
    throw new Error(e)
  }

}

// If one import this file, this is a module, otherwise a library
if (require.main === module) {
  bin(process.argv)
}

module.exports = bin
