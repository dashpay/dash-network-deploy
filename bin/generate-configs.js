/* eslint-disable no-console */

const fs = require('fs');

const generateAnsibleConfig = require('../lib/configGenerator/generateAnsibleConfig');
const generateTerraformConfig = require('../lib/configGenerator/generateTerraformConfig');

async function main() {
  const [network, networkName, masternodesCount] = process.argv.slice(2);

  await generateAnsibleConfig(network, networkName, masternodesCount);
  await generateTerraformConfig(network, networkName, masternodesCount);

  const env = '# Terraform remote backend configuration https://www.terraform.io/docs/backends/types/s3.html\n'
    + 'TERRAFORM_S3_BUCKET=""\n'
    + 'TERRAFORM_S3_KEY=""\n'
    + 'TERRAFORM_DYNAMODB_TABLE=""\n'
    + '\n'
    + '# Absolute paths to private and public keys for SSH access to an infrastructure\n'
    + 'PRIVATE_KEY_PATH=""\n'
    + 'PUBLIC_KEY_PATH=""\n'
    + '\n'
    + '# AWS credentials are used by Terraform for creating\n'
    + '# infrastructure and by Ansible for fetching images from AWS ECR.\n'
    + '#\n'
    + '# You should specify credentials for both\n'
    + '# Ansible and Terraform or specify a particular\n'
    + '# configuration using "TERRAFORM_" and "ANSIBLE_" prefixes\n'
    + '\n'
    + '# AWS_PROFILE="" # You can use AWS_PROFILE instead of AWS credentials\n'
    + 'AWS_ACCESS_KEY_ID=""\n'
    + 'AWS_SECRET_ACCESS_KEY=""\n'
    + 'AWS_REGION=""\n'
    + '\n'
    + '# TERRAFORM_AWS_PROFILE=""\n'
    + '# TERRAFORM_AWS_ACCESS_KEY_ID=""\n'
    + '# TERRAFORM_AWS_SECRET_ACCESS_KEY=""\n'
    + '# TERRAFORM_AWS_REGION=""\n'
    + '\n'
    + '# ANSIBLE_AWS_PROFILE=""\n'
    + '# ANSIBLE_AWS_ACCESS_KEY_ID=""\n'
    + '# ANSIBLE_AWS_SECRET_ACCESS_KEY=""\n'
    + '# ANSIBLE_AWS_REGION=""\n';

  fs.writeFileSync('.env', env);
}

main().catch(console.error);
