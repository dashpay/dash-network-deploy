#!/usr/bin/env python3

import subprocess
import sys
import json

COIN = 100000000

rpcargs = sys.argv[1]
mn_address = sys.argv[2]

blockchaininfo_s = subprocess.run("dash-cli %s getblockchaininfo" % (rpcargs), shell=True, check=True, stdout=subprocess.PIPE).stdout.decode("utf-8")
unspent_s = subprocess.run("dash-cli %s listunspent 0 9999999 \'[\"%s\"]\'" % (rpcargs, mn_address), shell=True, check=True, stdout=subprocess.PIPE).stdout.decode("utf-8")
addressutxos_s = subprocess.run("dash-cli %s getaddressutxos \'{\"addresses\":[\"%s\"]}\'" % (rpcargs, mn_address), shell=True, check=True, stdout=subprocess.PIPE).stdout.decode("utf-8")

# print("blockchaininfo_s: %s" % blockchaininfo_s, file=sys.stderr)
# print("unspent_s: %s" % unspent_s, file=sys.stderr)
# print("addressutxos_s: %s" % addressutxos_s, file=sys.stderr)

blockchaininfo = json.loads(blockchaininfo_s)
unspent = json.loads(unspent_s)
addressutxos = json.loads(addressutxos_s)

tipHeight = blockchaininfo.get('blocks') - 1

# We have to look at both results from listunspent and getaddressutxos
# listunspent will not include already locked masternode UTXOs
# getaddressutxos will not include unconfirmed UTXOs
utxos = unspent
for u in addressutxos:
    e = {
        "txid": u.get('txid'),
        "amount": u.get('satoshis') / COIN,
        "vout": u.get('outputIndex'),
        "confirmations": tipHeight - u.get('height')
    }
    # We might end up with duplicate entries, but who cares
    utxos.append(e)

best_txid = None
best_vout = None
best_conf = -1

for u in utxos:
    if u.get('amount') == 1000:
        better = best_txid is None

        if not better:
            t1 = "%s-%d" % (u.get('txid'), u.get('vout'))
            t2 = "%s-%d" % (best_txid, best_vout)

            c = u.get('confirmations')
            if best_conf == c:
                better = t1 < t2
            else:
                better = c < best_conf

        if better:
            best_txid = u.get('txid')
            best_vout = u.get('vout')
            best_conf = u.get('confirmations')

if best_vout is None:
    sys.exit(1)

print(best_txid)
print(best_vout)

