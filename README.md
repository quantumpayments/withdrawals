## Introduction

Integration with testnet3

## Components

The demo contains 7 components

* /balance  -- shows your balance
* /deposit  -- shows deposit status
* /clear    -- clears funds
* /toledger -- sends to ledger
* /sweep    -- sweeps from ledger to your URI
* /balance  -- shows your balance
* /home     -- navigation and instructions

Each was deployed as a custom route with its own handler.  

## Installation

Installation is via

    git clone https://github.com/quantumpayments/testnet.git

Then run

    npm install


```bash
$ bin/server.js  --port 8443 --ssl-key path/to/ssl-key.pem --ssl-cert path/to/ssl-cert.pem
# server running on https://localhost:8443/
```

##### How do I get the --ssl-key and the --ssl-cert?
You need an SSL certificate you get this from your domain provider or for free from [Let's Encrypt!](https://letsencrypt.org/getting-started/).

If you don't have one yet, or you just want to test `solid`, generate a certificate
```
$ openssl genrsa 2048 > ../localhost.key
$ openssl req -new -x509 -nodes -sha256 -days 3650 -key ../localhost.key -subj '/CN=*.localhost' > ../localhost.cert
```

## HD Public keys

Requires an HD public key to generate addresses.  Currently this is hard coded in the routes, so you need some programming skills to create the system (probably not a bad thing!).  It would be more convenient to add as a command line parameter.

HD Public Keys can be obtained at:
[https://dcpos.github.io/bip39/](https://dcpos.github.io/bip39/)
