const fs = require('fs');
const path = require('path');

// Scan all GeoJSON files
function getAllGeojsonFiles() {
  const files = [];

  function scanDirectory(dir, category = '') {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectory(fullPath, entry.name);
      } else if (entry.name.endsWith('.geojson')) {
        const stats = fs.statSync(fullPath);
        files.push({
          name: entry.name,
          path: fullPath,
          size: stats.size,
          category: category || path.basename(path.dirname(fullPath)),
          sizeKB: (stats.size / 1024).toFixed(2),
          sizeMB: (stats.size / 1024 / 1024).toFixed(2)
        });
      }
    }
  }

  const dataDir = path.join(__dirname, 'data');
  scanDirectory(dataDir);
  return files;
}

// Read Datasource.txt
function parseDataSource() {
  const datasourcePath = path.join(__dirname, 'Datasource.txt');
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

// Read download report
const downloadReportPath = path.join(__dirname, 'download_report.json');
const downloadReport = JSON.parse(fs.readFileSync(downloadReportPath, 'utf8'));

// Main analysis
console.log('='.repeat(80));
console.log('CURRENT DATA STATUS REPORT');
console.log('='.repeat(80));

const allFiles = getAllGeojsonFiles();
const allMapServers = parseDataSource();

console.log(`\n📊 SUMMARY:`);
console.log(`Total MapServers in Datasource.txt: ${allMapServers.length}`);
console.log(`Total GeoJSON files downloaded: ${allFiles.length}`);
console.log(`Original successful downloads: ${downloadReport.successful.length}`);
console.log(`Additional files found: ${allFiles.length - downloadReport.successful.length}`);

// Calculate total size
const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
console.log(`\nTotal data size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

// Breakdown by category
console.log(`\n\n📁 FILES BY CATEGORY:`);
console.log('='.repeat(80));

const categoryMapping = {
  'Energi Terbarukan': 'energi_terbarukan',
  'Mineral & Batubara': 'mineral_batubara',
  'Minyak & Gas Bumi': 'minyak_gas_bumi',
  'Ketenagalistrikan': 'ketenagalistrikan',
  'Batas Wilayah': 'batas_wilayah'
};

for (const [displayName, folderName] of Object.entries(categoryMapping)) {
  const filesInCategory = allFiles.filter(f =>
    f.category === folderName || f.category === displayName
  );

  const categorySize = filesInCategory.reduce((sum, f) => sum + f.size, 0);

  console.log(`\n${displayName}:`);
  console.log(`  Files: ${filesInCategory.length}`);
  console.log(`  Total size: ${(categorySize / 1024 / 1024).toFixed(2)} MB`);

  for (const file of filesInCategory.sort((a, b) => b.size - a.size)) {
    console.log(`    - ${file.name} (${file.sizeMB} MB)`);
  }
}

// Check what's still missing
console.log(`\n\n❌ STILL MISSING (from download_report.json):`);
console.log('='.repeat(80));

const fileNames = new Set(allFiles.map(f => f.name));
const stillMissing = downloadReport.failed.filter(f => {
  if (!f.layerName) return true; // MapServer level failure

  // Generate expected filename
  const serviceParts = f.url.split('/');
  const serviceIdx = serviceParts.indexOf('services');
  let serviceName = '';
  if (serviceIdx >= 0) {
    const parts = [];
    for (let i = serviceIdx + 1; i < serviceParts.length; i++) {
      if (serviceParts[i] === 'MapServer') break;
      parts.push(serviceParts[i]);
    }
    serviceName = parts.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  }

  const layerName = f.layerName.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  const expectedFilename = `${serviceName}_${layerName}_layer${f.layerId}.geojson`;

  return !fileNames.has(expectedFilename);
});

console.log(`\nStill missing: ${stillMissing.length} items\n`);

const missingByReason = {};
for (const item of stillMissing) {
  const reason = item.error || 'Unknown';
  if (!missingByReason[reason]) {
    missingByReason[reason] = [];
  }
  missingByReason[reason].push(item);
}

for (const [reason, items] of Object.entries(missingByReason)) {
  console.log(`\n${reason} (${items.length} items):`);
  for (const item of items) {
    console.log(`  - ${item.url}`);
    console.log(`    Category: ${item.category}`);
    if (item.layerName) {
      console.log(`    Layer: ${item.layerName}`);
    }
  }
}

// Save updated report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalMapServers: allMapServers.length,
    totalFiles: allFiles.length,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    stillMissing: stillMissing.length
  },
  filesByCategory: {},
  stillMissingDetails: stillMissing
};

for (const [displayName, folderName] of Object.entries(categoryMapping)) {
  const filesInCategory = allFiles.filter(f =>
    f.category === folderName || f.category === displayName
  );
  report.filesByCategory[displayName] = {
    count: filesInCategory.length,
    files: filesInCategory.map(f => ({
      name: f.name,
      sizeMB: f.sizeMB
    }))
  };
}

const reportPath = path.join(__dirname, 'current_data_status.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n\n${'='.repeat(80)}`);
console.log(`Report saved to: ${reportPath}`);
console.log('='.repeat(80));
