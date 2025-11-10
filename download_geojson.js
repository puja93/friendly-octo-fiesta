const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Read the datasource file
const datasourcePath = '/Users/pujaromulus/Code/esdmap/Datasource.txt';
const outputDir = '/Users/pujaromulus/Code/esdmap/';

// Track results
const results = {
  successful: [],
  failed: []
};

// Utility function to sanitize filename
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Utility function to make HTTP/HTTPS requests
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      let data = '';

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Download and save GeoJSON
async function downloadGeoJSON(url, filepath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadGeoJSON(res.headers.location, filepath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

// Extract service name from URL
function getServiceName(url) {
  const parts = url.split('/');
  const servicesIndex = parts.indexOf('services');
  if (servicesIndex >= 0 && servicesIndex < parts.length - 1) {
    // Get the service name (e.g., "DMEW/Wilayah_Kerja_Migas_Konvensional")
    const serviceParts = [];
    for (let i = servicesIndex + 1; i < parts.length; i++) {
      if (parts[i] === 'MapServer') break;
      serviceParts.push(parts[i]);
    }
    return serviceParts.join('_');
  }
  return 'unknown_service';
}

// Process a single MapServer
async function processMapServer(mapServerUrl, category) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Processing: ${mapServerUrl}`);
  console.log(`Category: ${category}`);
  console.log(`${'='.repeat(80)}`);

  try {
    // Get service metadata
    const serviceUrl = `${mapServerUrl}?f=json`;
    console.log(`Fetching service metadata...`);
    const serviceInfo = await fetchJSON(serviceUrl);

    if (!serviceInfo.layers || serviceInfo.layers.length === 0) {
      console.log(`No layers found in this service.`);
      results.failed.push({
        url: mapServerUrl,
        category: category,
        error: 'No layers found'
      });
      return;
    }

    console.log(`Found ${serviceInfo.layers.length} layer(s)`);

    const serviceName = sanitizeFilename(getServiceName(mapServerUrl));

    // Process each layer
    for (const layer of serviceInfo.layers) {
      const layerId = layer.id;
      const layerName = sanitizeFilename(layer.name || `layer${layerId}`);

      console.log(`\n  Layer ${layerId}: ${layer.name}`);

      // Construct GeoJSON query URL
      const queryUrl = `${mapServerUrl}/${layerId}/query?where=1%3D1&outFields=*&f=geojson`;
      const filename = `${serviceName}_${layerName}_layer${layerId}.geojson`;
      const filepath = path.join(outputDir, filename);

      try {
        console.log(`    Downloading GeoJSON...`);
        await downloadGeoJSON(queryUrl, filepath);

        // Verify file was created and has content
        const stats = fs.statSync(filepath);
        if (stats.size === 0) {
          fs.unlinkSync(filepath);
          throw new Error('Downloaded file is empty');
        }

        // Try to parse to verify it's valid JSON
        const content = fs.readFileSync(filepath, 'utf8');
        JSON.parse(content);

        console.log(`    ✓ Success! Saved to: ${filename} (${stats.size} bytes)`);
        results.successful.push({
          url: mapServerUrl,
          category: category,
          layerId: layerId,
          layerName: layer.name,
          filename: filename,
          filepath: filepath,
          size: stats.size
        });
      } catch (error) {
        console.log(`    ✗ Failed: ${error.message}`);
        results.failed.push({
          url: mapServerUrl,
          category: category,
          layerId: layerId,
          layerName: layer.name,
          error: error.message
        });
      }
    }
  } catch (error) {
    console.log(`✗ Failed to process MapServer: ${error.message}`);
    results.failed.push({
      url: mapServerUrl,
      category: category,
      error: error.message
    });
  }
}

// Main function
async function main() {
  console.log('Starting GeoJSON download process...\n');

  // Read datasource file
  const content = fs.readFileSync(datasourcePath, 'utf8');
  const lines = content.split('\n');

  let currentCategory = '';
  const mapServers = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('#')) {
      currentCategory = trimmed.substring(1).trim();
    } else if (trimmed.startsWith('http')) {
      mapServers.push({
        url: trimmed,
        category: currentCategory
      });
    }
  }

  console.log(`Found ${mapServers.length} MapServer URLs to process\n`);

  // Process each MapServer sequentially
  for (const server of mapServers) {
    await processMapServer(server.url, server.category);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generate summary report
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('SUMMARY REPORT');
  console.log('='.repeat(80));

  console.log(`\n✓ SUCCESSFUL DOWNLOADS: ${results.successful.length}`);
  if (results.successful.length > 0) {
    console.log('\nFiles downloaded:');
    for (const item of results.successful) {
      console.log(`  - ${item.filename}`);
      console.log(`    Category: ${item.category}`);
      console.log(`    Layer: ${item.layerName} (ID: ${item.layerId})`);
      console.log(`    Size: ${item.size} bytes`);
      console.log(`    Path: ${item.filepath}`);
      console.log('');
    }
  }

  console.log(`\n✗ FAILED DOWNLOADS: ${results.failed.length}`);
  if (results.failed.length > 0) {
    console.log('\nFailed items:');
    for (const item of results.failed) {
      console.log(`  - URL: ${item.url}`);
      console.log(`    Category: ${item.category}`);
      if (item.layerName) {
        console.log(`    Layer: ${item.layerName} (ID: ${item.layerId})`);
      }
      console.log(`    Error: ${item.error}`);
      console.log('');
    }
  }

  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    totalMapServers: mapServers.length,
    successCount: results.successful.length,
    failureCount: results.failed.length,
    successful: results.successful,
    failed: results.failed
  };

  const reportPath = path.join(outputDir, 'download_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);

  console.log('\n' + '='.repeat(80));
  console.log(`TOTAL: ${results.successful.length} successful, ${results.failed.length} failed`);
  console.log('='.repeat(80));
}

// Run the main function
main().catch(console.error);
