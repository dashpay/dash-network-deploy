const fs = require('fs');
const merge = require('lodash.merge');
const yaml = require('js-yaml');

/**
 * Read and merge YAML files
 * @param files
 */
module.exports = function readYamlFiles(...files) {
  const objectsArray = files.map((file) => {
    const fileString = fs.readFileSync(file, 'utf8');
    return yaml.load(fileString);
  });

  return merge(...objectsArray);
};
