const fs = require('fs');
const path = require('path');

// Configuration
const downloadReportPath = path.join(__dirname, 'download_report.json');
const datasourcePath = path.join(__dirname, 'Datasource.txt');
const dataDir = path.join(__dirname, 'data');

// Category folder mapping
const categoryFolders = {
  'Energi Terbarukan': 'energi_terbarukan',
  'Mineral & Batubara': 'mineral_batubara',
  'Minyak & Gas Bumi': 'minyak_gas_bumi',
  'Ketenagalistrikan': 'ketenagalistrikan',
  'Batas Wilayah': 'batas_wilayah'
};

// Read the download report
const downloadReport = JSON.parse(fs.readFileSync(downloadReportPath, 'utf8'));

// Parse Datasource.txt to get all MapServers
function parseDataSource() {
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

  return mapServers;
}

// Get all existing geojson files
function getExistingFiles() {
  const files = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.name.endsWith('.geojson')) {
        const stats = fs.statSync(fullPath);
        files.push({
          name: entry.name,
          path: fullPath,
          size: stats.size,
          category: path.basename(path.dirname(fullPath))
        });
      }
    }
  }

  scanDirectory(dataDir);
  return files;
}

// Main analysis
function analyzeData() {
  console.log('='.repeat(80));
  console.log('MISSING FILES ANALYSIS');
  console.log('='.repeat(80));

  const allMapServers = parseDataSource();
  const existingFiles = getExistingFiles();
  const { successful, failed } = downloadReport;

  console.log(`\n📊 OVERVIEW:`);
  console.log(`Total MapServers in Datasource.txt: ${allMapServers.length}`);
  console.log(`Successful downloads (from report): ${successful.length}`);
  console.log(`Failed downloads (from report): ${failed.length}`);
  console.log(`Existing files in data folder: ${existingFiles.length}`);

  // Analyze by category
  console.log(`\n\n📁 BREAKDOWN BY CATEGORY:`);
  console.log('='.repeat(80));

  const categories = Object.keys(categoryFolders);
  const categoryAnalysis = {};

  for (const category of categories) {
    const mapServersInCategory = allMapServers.filter(m => m.category === category);
    const successfulInCategory = successful.filter(s => s.category === category);
    const failedInCategory = failed.filter(f => f.category === category);
    const filesInCategory = existingFiles.filter(f => {
      const folder = categoryFolders[category];
      return f.category === folder || f.category === category;
    });

    categoryAnalysis[category] = {
      totalMapServers: mapServersInCategory.length,
      successful: successfulInCategory.length,
      failed: failedInCategory.length,
      existingFiles: filesInCategory.length
    };

    console.log(`\n${category}:`);
    console.log(`  MapServers: ${mapServersInCategory.length}`);
    console.log(`  Successful downloads: ${successfulInCategory.length}`);
    console.log(`  Failed downloads: ${failedInCategory.length}`);
    console.log(`  Files in folder: ${filesInCategory.length}`);
  }

  // Detailed failure analysis
  console.log(`\n\n❌ FAILED DOWNLOADS ANALYSIS:`);
  console.log('='.repeat(80));

  // Group failures by error type
  const errorTypes = {};
  for (const failure of failed) {
    const errorKey = failure.error || 'Unknown error';
    if (!errorTypes[errorKey]) {
      errorTypes[errorKey] = [];
    }
    errorTypes[errorKey].push(failure);
  }

  console.log(`\nTotal failed items: ${failed.length}`);
  console.log(`\nFailure reasons breakdown:`);

  for (const [errorType, items] of Object.entries(errorTypes)) {
    console.log(`\n  ${errorType}: ${items.length} items`);
    for (const item of items) {
      console.log(`    - ${item.url}`);
      console.log(`      Category: ${item.category}`);
      if (item.layerName) {
        console.log(`      Layer: ${item.layerName} (ID: ${item.layerId})`);
      }
    }
  }

  // List all successful downloads
  console.log(`\n\n✅ SUCCESSFUL DOWNLOADS:`);
  console.log('='.repeat(80));

  const successByCategory = {};
  for (const item of successful) {
    if (!successByCategory[item.category]) {
      successByCategory[item.category] = [];
    }
    successByCategory[item.category].push(item);
  }

  for (const [category, items] of Object.entries(successByCategory)) {
    console.log(`\n${category} (${items.length} files):`);
    for (const item of items) {
      console.log(`  ✓ ${item.filename}`);
      console.log(`    Layer: ${item.layerName}`);
      console.log(`    Size: ${(item.size / 1024).toFixed(2)} KB`);
    }
  }

  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    analysis: {
      totalMapServers: allMapServers.length,
      successfulDownloads: successful.length,
      failedDownloads: failed.length,
      existingFiles: existingFiles.length
    },
    byCategory: categoryAnalysis,
    failureReasons: Object.entries(errorTypes).map(([reason, items]) => ({
      reason,
      count: items.length,
      items: items.map(i => ({
        url: i.url,
        category: i.category,
        layerName: i.layerName,
        layerId: i.layerId
      }))
    })),
    recommendations: generateRecommendations(errorTypes)
  };

  // Save analysis report
  const analysisReportPath = path.join(__dirname, 'missing_files_analysis.json');
  fs.writeFileSync(analysisReportPath, JSON.stringify(summary, null, 2));

  console.log(`\n\n📋 RECOMMENDATIONS:`);
  console.log('='.repeat(80));
  for (const rec of summary.recommendations) {
    console.log(`\n${rec.issue}:`);
    console.log(`  → ${rec.recommendation}`);
  }

  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`Analysis report saved to: ${analysisReportPath}`);
  console.log('='.repeat(80));
}

function generateRecommendations(errorTypes) {
  const recommendations = [];

  if (errorTypes['No layers found']) {
    recommendations.push({
      issue: 'No layers found',
      count: errorTypes['No layers found'].length,
      recommendation: 'These MapServers appear to be empty or not properly configured. Check the ESDM geoportal directly to verify if these services have been deprecated or moved.'
    });
  }

  if (errorTypes['Download timeout']) {
    recommendations.push({
      issue: 'Download timeout',
      count: errorTypes['Download timeout'].length,
      recommendation: 'These layers are too large or the server is slow. Use the retry_downloads.js script with extended timeout (5 minutes) to download these files.'
    });
  }

  if (errorTypes['Downloaded file is empty']) {
    recommendations.push({
      issue: 'Empty files',
      count: errorTypes['Downloaded file is empty'].length,
      recommendation: 'The server returned empty data. This could indicate the layer has no features or the query needs to be adjusted.'
    });
  }

  const networkErrors = Object.keys(errorTypes).filter(k =>
    k.includes('ETIMEDOUT') || k.includes('ENOTFOUND') || k.includes('ECONNABORTED')
  );

  if (networkErrors.length > 0) {
    const total = networkErrors.reduce((sum, k) => sum + errorTypes[k].length, 0);
    recommendations.push({
      issue: 'Network errors',
      count: total,
      recommendation: 'Network connectivity issues. Retry downloading these files when network connection is stable.'
    });
  }

  return recommendations;
}

// Run the analysis
analyzeData();
