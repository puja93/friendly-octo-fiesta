const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Files to retry - ALL missing/failed sources (12 total)
const retryList = [
  // Energi Terbarukan (3 missing)
  {
    url: 'https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Sumber_Daya_dan_Cadangan_Panas_Bumi/MapServer',
    category: 'Energi Terbarukan',
    layerId: null,
    layerName: null
  },
  {
    url: 'https://geoportal.esdm.go.id/gis2/rest/services/DBP/Potensi_Biogas/MapServer',
    category: 'Energi Terbarukan',
    layerId: null,
    layerName: null
  },
  {
    url: 'https://geoportal.esdm.go.id/gis2/rest/services/DBP/Potensi_Biomassa/MapServer',
    category: 'Energi Terbarukan',
    layerId: null,
    layerName: null
  },
  // Mineral & Batubara (4 missing)
  {
    url: 'https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Sumber_Daya_dan_Cadangan_Mineral_Logam/MapServer',
    category: 'Mineral & Batubara',
    layerId: null,
    layerName: null
  },
  {
    url: 'https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Batubara/MapServer',
    category: 'Mineral & Batubara',
    layerId: null,
    layerName: null
  },
  {
    url: 'https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Mineral_Bukan_Logam_dan_Batuan/MapServer',
    category: 'Mineral & Batubara',
    layerId: null,
    layerName: null
  },
  {
    url: 'https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Gas_Metana_Batubara/MapServer',
    category: 'Mineral & Batubara',
    layerId: null,
    layerName: null
  },
  // Minyak & Gas Bumi (3 failed/missing)
  {
    url: 'https://geoportal.esdm.go.id/gis4/rest/services/BGS_MG/Cekungan_Sedimen/MapServer',
    category: 'Minyak & Gas Bumi',
    layerId: null,
    layerName: null
  },
  {
    url: 'https://geoportal.esdm.go.id/gis3/rest/services/DMOS/Terminal_LNG/MapServer',
    category: 'Minyak & Gas Bumi',
    layerId: null,
    layerName: null
  },
  {
    url: 'https://geoportal.esdm.go.id/gis3/rest/services/DMOS/Terminal_LPG/MapServer',
    category: 'Minyak & Gas Bumi',
    layerId: null,
    layerName: null
  },
  // Ketenagalistrikan (1 missing)
  {
    url: 'https://geoportal.esdm.go.id/gis2/rest/services/SDL1/Rasio_Elektrifikasi/MapServer',
    category: 'Ketenagalistrikan',
    layerId: null,
    layerName: null
  },
  // Batas Wilayah (1 missing)
  {
    url: 'https://geoportal.esdm.go.id/gis1/rest/services/SJN/Batas_Administrasi_KSP_Area/MapServer',
    category: 'Batas Wilayah',
    layerId: null,
    layerName: null
  }
];

const results = {
  timestamp: new Date().toISOString(),
  totalRetries: retryList.length,
  successCount: 0,
  failureCount: 0,
  successful: [],
  failed: []
};

// Create data directories
const dataDir = '/Users/pujaromulus/Code/esdmap/data';
const categoryFolders = {
  'Energi Terbarukan': 'energi_terbarukan',
  'Mineral & Batubara': 'mineral_batubara',
  'Minyak & Gas Bumi': 'minyak_gas_bumi',
  'Ketenagalistrikan': 'ketenagalistrikan',
  'Batas Wilayah': 'batas_wilayah'
};

Object.values(categoryFolders).forEach(folder => {
  const categoryDir = path.join(dataDir, folder);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
});

// Generate filename from URL and layer name
function generateFilename(url, layerName, layerId) {
  const urlParts = url.split('/');
  const serviceName = urlParts[urlParts.length - 2];
  const folder = urlParts[urlParts.length - 3];

  const safeName = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const safeLayerName = layerName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const safeFolder = folder.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  return `${safeFolder}_${safeName}_${safeLayerName}_layer${layerId}.geojson`;
}

// Fetch layer info if not available
async function fetchLayerInfo(url) {
  try {
    const response = await axios.get(`${url}?f=json`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.data.layers && response.data.layers.length > 0) {
      return response.data.layers.map(layer => ({
        id: layer.id,
        name: layer.name
      }));
    }
    return null;
  } catch (error) {
    console.error(`Error fetching layer info for ${url}:`, error.message);
    return null;
  }
}

// Download GeoJSON with retry capability
async function downloadGeoJSON(url, layerId, layerName, category, retryCount = 0) {
  const maxRetries = 1;
  const downloadUrl = `${url}/${layerId}/query?where=1%3D1&outFields=*&f=geojson`;

  try {
    console.log(`\nDownloading: ${layerName} (Layer ${layerId})`);
    console.log(`URL: ${downloadUrl}`);
    console.log(`Timeout: 1 minute (60000ms)`);

    const response = await axios.get(downloadUrl, {
      timeout: 60000, // 1 minute
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const filename = generateFilename(url, layerName, layerId);
    const folderName = categoryFolders[category];
    const filepath = path.join(dataDir, folderName, filename);

    fs.writeFileSync(filepath, JSON.stringify(response.data, null, 2));

    const fileSize = fs.statSync(filepath).size;
    console.log(`✓ Downloaded successfully: ${filename} (${fileSize} bytes)`);

    results.successful.push({
      url,
      category,
      layerId,
      layerName,
      filename,
      filepath,
      size: fileSize
    });

    results.successCount++;
    return true;

  } catch (error) {
    const errorMsg = error.code === 'ECONNABORTED' ? 'Download timeout' : error.message;
    console.error(`✗ Failed: ${layerName} - ${errorMsg}`);

    // Retry on network errors
    if (retryCount < maxRetries && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND')) {
      console.log(`  Retrying... (Attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
      return downloadGeoJSON(url, layerId, layerName, category, retryCount + 1);
    }

    results.failed.push({
      url,
      category,
      layerId,
      layerName,
      error: errorMsg
    });

    results.failureCount++;
    return false;
  }
}

// Process retry list
async function processRetries() {
  console.log('=== Starting Retry Downloads ===');
  console.log(`Total files to retry: ${retryList.length}\n`);

  for (const item of retryList) {
    let layerId = item.layerId;
    let layerName = item.layerName;

    // If layer info is missing, fetch it
    if (layerId === null || layerName === null) {
      console.log(`\nFetching layer info for: ${item.url}`);
      const layers = await fetchLayerInfo(item.url);

      if (layers && layers.length > 0) {
        layerId = layers[0].id;
        layerName = layers[0].name;
        console.log(`Found layer: ${layerName} (ID: ${layerId})`);
      } else {
        console.error(`No layers found for: ${item.url}`);
        results.failed.push({
          url: item.url,
          category: item.category,
          error: 'No layers found'
        });
        results.failureCount++;
        continue;
      }
    }

    await downloadGeoJSON(item.url, layerId, layerName, item.category);

    // Add delay between downloads to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save retry report
  const reportPath = '/Users/pujaromulus/Code/esdmap/retry_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\n=== Retry Download Summary ===');
  console.log(`Total retries: ${results.totalRetries}`);
  console.log(`Successful: ${results.successCount}`);
  console.log(`Failed: ${results.failureCount}`);
  console.log(`\nReport saved to: ${reportPath}`);
}

processRetries().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
