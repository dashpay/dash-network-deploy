const fetch = require('node-fetch');
const parsePrometheusTextFormat = require('parse-prometheus-text-format');

/**
 * @param {string} url
 * @return {Promise<Object[]>}
 */
async function fetchPrometheusMetrics(url) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const response = await fetch(url, { signal: controller.signal });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics from ${url}: ${response.statusText}`);
  }

  const text = await response.text();

  return parsePrometheusTextFormat(text);
}

module.exports = fetchPrometheusMetrics;
