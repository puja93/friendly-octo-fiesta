const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const datasourcePath = path.join(__dirname, 'Datasource.txt');
const dataDir = path.join(__dirname, 'data');

// Track results
const results = {
  timestamp: new Date().toISOString(),
  totalMapServers: 0,
  checkedLayers: 0,
  existingFiles: 0,
  missingFiles: 0,
  details: []
};

// Category folder mapping
const categoryFolders = {
  'Energi Terbarukan': 'energi_terbarukan',
  'Mineral & Batubara': 'mineral_batubara',
  'Minyak & Gas Bumi': 'minyak_gas_bumi',
  'Ketenagalistrikan': 'ketenagalistrikan',
  'Batas Wilayah': 'batas_wilayah'
};

// Utility function to sanitize filename (from download_geojson.js)
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Extract service name from URL (from download_geojson.js)
function getServiceName(url) {
  const parts = url.split('/');
  const servicesIndex = parts.indexOf('services');
  if (servicesIndex >= 0 && servicesIndex < parts.length - 1) {
    const serviceParts = [];
    for (let i = servicesIndex + 1; i < parts.length; i++) {
      if (parts[i] === 'MapServer') break;
      serviceParts.push(parts[i]);
    }
    return serviceParts.join('_');
  }
  return 'unknown_service';
}

// Utility function to make HTTP/HTTPS requests (from download_geojson.js)
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

// Check if file exists in any of the possible locations
function checkFileExists(category, serviceName, layerName, layerId) {
  const filename = `${serviceName}_${layerName}_layer${layerId}.geojson`;
  const folderName = categoryFolders[category];

  // Check in category folder
  const filepath = path.join(dataDir, folderName, filename);
  if (fs.existsSync(filepath)) {
    return { exists: true, path: filepath };
  }

  // Check in old location (root or data folder with spaces)
  const oldPaths = [
    path.join(dataDir, category, filename),
    path.join(dataDir, filename)
  ];

  for (const oldPath of oldPaths) {
    if (fs.existsSync(oldPath)) {
      return { exists: true, path: oldPath };
    }
  }

  return { exists: false, expectedPath: filepath };
}

// Process a single MapServer
async function verifyMapServer(mapServerUrl, category) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Verifying: ${mapServerUrl}`);
  console.log(`Category: ${category}`);
  console.log(`${'='.repeat(80)}`);

  const mapServerResult = {
    url: mapServerUrl,
    category: category,
    status: '',
    error: null,
    layers: []
  };

  try {
    // Get service metadata
    const serviceUrl = `${mapServerUrl}?f=json`;
    console.log(`Fetching service metadata...`);
    const serviceInfo = await fetchJSON(serviceUrl);

    if (!serviceInfo.layers || serviceInfo.layers.length === 0) {
      console.log(`❌ No layers found in this service.`);
      mapServerResult.status = 'no_layers';
      mapServerResult.error = 'No layers found';
      results.details.push(mapServerResult);
      return;
    }

    console.log(`Found ${serviceInfo.layers.length} layer(s)`);
    mapServerResult.status = 'success';

    const serviceName = sanitizeFilename(getServiceName(mapServerUrl));

    // Check each layer
    for (const layer of serviceInfo.layers) {
      const layerId = layer.id;
      const layerName = sanitizeFilename(layer.name || `layer${layerId}`);

      console.log(`\n  Layer ${layerId}: ${layer.name}`);
      results.checkedLayers++;

      const fileCheck = checkFileExists(category, serviceName, layerName, layerId);

      const layerResult = {
        layerId: layerId,
        layerName: layer.name,
        filename: `${serviceName}_${layerName}_layer${layerId}.geojson`,
        exists: fileCheck.exists,
        path: fileCheck.exists ? fileCheck.path : fileCheck.expectedPath
      };

      if (fileCheck.exists) {
        const stats = fs.statSync(fileCheck.path);
        layerResult.size = stats.size;
        console.log(`    ✓ File exists: ${fileCheck.path} (${stats.size} bytes)`);
        results.existingFiles++;
      } else {
        console.log(`    ❌ File missing: ${fileCheck.expectedPath}`);
        layerResult.reason = 'File not downloaded or download failed';
        results.missingFiles++;
      }

      mapServerResult.layers.push(layerResult);
    }

    results.details.push(mapServerResult);

  } catch (error) {
    console.log(`❌ Failed to access MapServer: ${error.message}`);
    mapServerResult.status = 'error';
    mapServerResult.error = error.message;
    results.details.push(mapServerResult);
    results.missingFiles++;
  }
}

// Main function
async function main() {
  console.log('Starting DataSource Verification...\n');

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

  results.totalMapServers = mapServers.length;
  console.log(`Found ${mapServers.length} MapServer URLs to verify\n`);

  // Process each MapServer sequentially
  for (const server of mapServers) {
    await verifyMapServer(server.url, server.category);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generate summary report
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(80));

  console.log(`\nTotal MapServers: ${results.totalMapServers}`);
  console.log(`Total Layers Checked: ${results.checkedLayers}`);
  console.log(`✓ Existing Files: ${results.existingFiles}`);
  console.log(`❌ Missing Files: ${results.missingFiles}`);

  // Breakdown by category
  console.log('\n--- Breakdown by Category ---');
  const categoryStats = {};
  for (const detail of results.details) {
    if (!categoryStats[detail.category]) {
      categoryStats[detail.category] = {
        total: 0,
        existing: 0,
        missing: 0,
        errors: 0
      };
    }

    if (detail.status === 'error' || detail.status === 'no_layers') {
      categoryStats[detail.category].errors++;
    } else {
      for (const layer of detail.layers) {
        categoryStats[detail.category].total++;
        if (layer.exists) {
          categoryStats[detail.category].existing++;
        } else {
          categoryStats[detail.category].missing++;
        }
      }
    }
  }

  for (const [category, stats] of Object.entries(categoryStats)) {
    console.log(`\n${category}:`);
    console.log(`  Total layers: ${stats.total}`);
    console.log(`  Existing: ${stats.existing}`);
    console.log(`  Missing: ${stats.missing}`);
    console.log(`  MapServer errors: ${stats.errors}`);
  }

  // List all missing files with reasons
  console.log('\n--- Missing Files Details ---');
  for (const detail of results.details) {
    if (detail.status === 'error' || detail.status === 'no_layers') {
      console.log(`\n❌ ${detail.url}`);
      console.log(`   Category: ${detail.category}`);
      console.log(`   Error: ${detail.error}`);
    } else {
      const missingLayers = detail.layers.filter(l => !l.exists);
      if (missingLayers.length > 0) {
        console.log(`\n⚠️  ${detail.url}`);
        console.log(`   Category: ${detail.category}`);
        for (const layer of missingLayers) {
          console.log(`   - Layer ${layer.layerId}: ${layer.layerName}`);
          console.log(`     Expected at: ${layer.path}`);
        }
      }
    }
  }

  // Save report to file
  const reportPath = path.join(__dirname, 'verification_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n\nDetailed report saved to: ${reportPath}`);

  console.log('\n' + '='.repeat(80));
  console.log(`SUMMARY: ${results.existingFiles} existing, ${results.missingFiles} missing`);
  console.log('='.repeat(80));
}

// Run the main function
main().catch(console.error);
