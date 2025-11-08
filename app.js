// Data source configuration
const DATA_SOURCES = {
    konvensional: {
        name: 'Konvensional',
        dataFile: 'data_konvensional.geojson',
        color: '#3388ff'
    },
    nonKonvensional: {
        name: 'Non Konvensional',
        dataFile: 'data_non_konvensional.geojson',
        color: '#ff6b6b'
    }
};

// Indonesia center coordinates
const INDONESIA_CENTER = [-0.7893, 113.9213];
const INITIAL_ZOOM = 5;

let map;
let geoJsonLayers = {
    konvensional: null,
    nonKonvensional: null
};

/**
 * Initialize the map
 */
function initMap() {
    map = L.map('map').setView(INDONESIA_CENTER, INITIAL_ZOOM);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
}

/**
 * Load data from local GeoJSON files
 */
async function fetchData(source) {
    const config = DATA_SOURCES[source];

    try {
        console.log(`Loading ${source} data from local file...`);
        const response = await fetch(config.dataFile);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const geojsonData = await response.json();
        console.log(`Successfully loaded ${source} data`);
        return geojsonData;
    } catch (error) {
        console.error(`Error loading ${source} data:`, error);
        throw error;
    }
}

/**
 * Color mapping by status
 */
const STATUS_COLORS = {
    'EXPLORATION': '#FFD700',    // Yellow/Gold
    'DEVELOPMENT': '#ff6b6b',     // Red
    'PRODUCTION': '#3388ff'        // Blue
};

/**
 * Get color based on status
 */
function getColorByStatus(status) {
    return STATUS_COLORS[status] || '#888888'; // Gray fallback
}

/**
 * Style function for GeoJSON features
 */
function getFeatureStyle(feature) {
    const status = feature.properties.status;
    return {
        color: getColorByStatus(status),
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.4
    };
}

/**
 * Property label mapping for better display
 */
const PROPERTY_LABELS = {
    'objectid': 'Object ID',
    'namobj': 'Nama Wilayah Kerja',
    'oprblk': 'Operator Wilayah Kerja',
    'effdat': 'Tanggal Efektif Kontrak Kerja Sama',
    'expdat': 'Tanggal Berakhir Kontrak Kerja Sama',
    'status': 'Status Wilayah Kerja',
    'srs_id': 'Spatial Reference System Identifier',
    'metadata': 'Metadata'
};

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    if (!timestamp || isNaN(timestamp)) return timestamp;
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Create popup content from feature properties
 */
function createPopupContent(feature, source) {
    const props = feature.properties;
    const title = props.namobj || 'Area Info';

    let content = `<div class="popup-wrapper">
        <div class="popup-header">${title}</div>
        <div class="popup-table">`;

    // Display all properties with formatted labels (skip objectid, namobj, and srs_id)
    for (const [key, value] of Object.entries(props)) {
        if (value !== null && value !== undefined && key !== 'namobj' && key !== 'objectid' && key !== 'srs_id') {
            const label = PROPERTY_LABELS[key] || key;
            const displayValue = (key === 'effdat' || key === 'expdat') ? formatDate(value) : value;

            content += `<div class="popup-row">
                <div class="popup-label">${label}</div>
                <div class="popup-value">${displayValue}</div>
            </div>`;
        }
    }

    content += `</div></div>`;
    return content;
}

/**
 * Add GeoJSON layer to map
 */
function addGeoJsonLayer(source, geojsonData) {
    // Remove existing layer if any
    if (geoJsonLayers[source]) {
        map.removeLayer(geoJsonLayers[source]);
    }

    const layer = L.geoJSON(geojsonData, {
        style: (feature) => getFeatureStyle(feature),
        onEachFeature: (feature, layer) => {
            const popupContent = createPopupContent(feature, source);
            layer.bindPopup(popupContent);
        }
    });

    layer.addTo(map);
    geoJsonLayers[source] = layer;
}

/**
 * Update the last updated timestamp display
 */
function updateLastUpdatedTime() {
    const date = new Date();
    const formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = `Loaded: ${formattedDate}`;
}

/**
 * Load all data and display on map
 */
async function loadAllData() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.disabled = true;
    refreshBtn.classList.add('loading');
    refreshBtn.textContent = 'Loading...';

    try {
        // Fetch both data sources in parallel
        const [konvensionalData, nonKonvensionalData] = await Promise.all([
            fetchData('konvensional'),
            fetchData('nonKonvensional')
        ]);

        // Add layers to map
        addGeoJsonLayer('konvensional', konvensionalData);
        addGeoJsonLayer('nonKonvensional', nonKonvensionalData);

        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading map data. Please try again.');
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.classList.remove('loading');
        refreshBtn.textContent = 'Refresh Data';
    }
}

/**
 * Initialize the application
 */
function init() {
    initMap();
    loadAllData();

    // Add refresh button event listener
    document.getElementById('refreshBtn').addEventListener('click', () => {
        // Reload data from local files
        loadAllData();
    });

    // Update last updated time on page load
    updateLastUpdatedTime();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
