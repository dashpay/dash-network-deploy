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
#echo "$HOSTNAME $CORE_BUILD_VERSION $BLOCK_COUNT $BLOCK_HASH"
echo "$HOSTNAME $CORE_BUILD_VERSION $MN_STATE $MN_POSE_PENALTY"

# write template file for j2cli
TEMPLATE_FILE_NAME="report.json.j2"
J2TEMPLATE=$(cat<<EOF
{
    "dashcore_version": "{{ CORE_BUILD_VERSION }}",
    "mn_state": "{{ MN_STATE }}",
    "pose_penalty": {{ MN_POSE_PENALTY }}
}
EOF
)
echo "$J2TEMPLATE" > "$TEMPLATE_FILE_NAME"
#j2 --format env "$TEMPLATE_FILE_NAME"
