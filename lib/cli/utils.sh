function print_error() {
   echo "Error: $1"
   echo ""
   echo "$CMD_USAGE"
   exit 1
}

function override_aws_credentials() {
    AWS_VARS="AWS_PROFILE AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION"

    for VAR_NAME in ${AWS_VARS}; do
        FIRST_VAR_NAME="$1_$VAR_NAME"
        SECOND_VAR_NAME="$2_$VAR_NAME";

        if [[ -n ${!FIRST_VAR_NAME} ]]; then
            if [ -z ${!SECOND_VAR_NAME} ]; then
                print_error "${FIRST_VAR_NAME} is defined. ${SECOND_VAR_NAME} must be defined too"
            fi
            eval "${VAR_NAME}=${!FIRST_VAR_NAME}"
        fi
    done
}
