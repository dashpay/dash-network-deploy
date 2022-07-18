#! /bin/bash

# dash masternode reporter script

set -a

JQ_CMD="jq --raw-output"

CORE_BUILD_VERSION=$(dash-cli getnetworkinfo | $JQ_CMD '.buildversion')
MN_STATUS_JSON=$(dash-cli masternode status)

MN_STATE=$(echo $MN_STATUS_JSON | $JQ_CMD '.state')
MN_IP_PORT=$(echo $MN_STATUS_JSON | $JQ_CMD '.service')
MN_STATUS_JSON=$(dash-cli masternodelist json $MN_IP_PORT)
MN_PROTX_ID=$(echo $MN_STATUS_JSON | $JQ_CMD '.[].proTxHash')
MN_PROTX_INFO=$(dash-cli protx info $MN_PROTX_ID)
MN_POSE_PENALTY=$(echo $MN_PROTX_INFO | $JQ_CMD '.state.PoSePenalty')

BLOCK_COUNT=$(dash-cli getblockcount)
BLOCK_HASH=$(dash-cli getblockhash $BLOCK_COUNT)

HOSTNAME=$(hostname)
echo "$HOSTNAME $CORE_BUILD_VERSION $MN_STATE $MN_POSE_PENALTY"
