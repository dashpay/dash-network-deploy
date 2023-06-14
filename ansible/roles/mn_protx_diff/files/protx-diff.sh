#! /bin/bash

BLOCKCOUNT=$(dash-cli getblockcount)
DIP3BLOCK=$(dash-cli getblockchaininfo | jq .bip9_softforks.dip0003.since)
BASEBLOCK=$(shuf -i $DIP3BLOCK-$BLOCKCOUNT -n 1)
ENDBLOCK=$(shuf -i $BASEBLOCK-$BLOCKCOUNT -n 1)
dash-cli protx diff $BASEBLOCK $ENDBLOCK
