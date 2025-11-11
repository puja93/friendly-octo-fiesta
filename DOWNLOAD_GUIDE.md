# Data Download Guide - MapServer API with Pagination

## Overview

This guide documents the process of downloading large datasets from ArcGIS MapServer endpoints that have record count limitations and/or contain multiple layers/features.

## Problem: MaxRecordCount Limitation

MapServer endpoints often implement a `maxRecordCount` parameter that limits the number of features returned per request. For large datasets (100+ records), you need to use **pagination** with the `resultOffset` parameter.

### Example Issue

**WIUP (Wilayah Izin Usaha Pertambangan) Dataset:**
- Endpoint: `https://geoportal.esdm.go.id/monaresia/sharing/servers/48852a855c014a63acfd78bf06c2689a/rest/services/Pusat/WIUP_Publish/MapServer/0/query`
- `maxRecordCount`: 100
- **Total Features**: 8,461
- **Problem**: Only 100 features returned in first request
- **Solution**: Paginate through all 8,461 records using `resultOffset`

## Solution: Batch Download with Pagination

### Step 1: Determine Total Record Count

Query with `returnCountOnly=true` to get total features without downloading:

```bash
curl -s "https://geoportal.esdm.go.id/monaresia/sharing/servers/48852a855c014a63acfd78bf06c2689a/rest/services/Pusat/WIUP_Publish/MapServer/0/query?where=1%3D1&returnCountOnly=true&f=json" | jq '.count'
```

Result: `8461` total features

### Step 2: Create Paginated Download Script

Use a loop to download all batches:

```bash
BATCH_SIZE=100
TOTAL_FEATURES=8461
BATCH_COUNT=$(( (TOTAL_FEATURES + BATCH_SIZE - 1) / BATCH_SIZE ))  # Results in 85 batches

for ((i=0; i<BATCH_COUNT; i++)); do
  OFFSET=$((i * BATCH_SIZE))

  curl -s --max-time 120 \
    "https://endpoint.com/MapServer/0/query?where=1%3D1&outFields=*&resultOffset=${OFFSET}&f=geojson" \
    -o "batch_${OFFSET}.json"

  sleep 0.5  # Be nice to the server
done
```

### Step 3: Combine All Batches

Use `jq` to merge all GeoJSON files:

```bash
jq -s '[.[] | .features[]] | {type: "FeatureCollection", features: .}' batch_*.json > combined.geojson
```

## Key Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `resultOffset` | Skip first N records | `resultOffset=100` (skip first 100) |
| `returnCountOnly` | Get count without data | `returnCountOnly=true` |
| `outFields` | Specify fields to return | `outFields=*` (all fields) |
| `f` | Response format | `f=geojson` (GeoJSON) or `f=json` |

## Download Scripts in This Repository

### Located in: `scripts/`

1. **download_batas_admin_v3.sh** - Downloads 36 provinces (individual OBJECTID queries)
2. **download_batas_admin_kabkota.sh** - Downloads 548 kabupaten/kota (individual OBJECTID queries)
3. **download_potensi_biogas.sh** - Downloads 34 biogas features (split by OBJECTID)
4. **download_potensi_biomassa.sh** - Downloads 37 biomassa features (split by OBJECTID)
5. **download_rasio_elektrifikasi.sh** - Downloads 38 elektrifikasi features (split by OBJECTID)
6. **download_wiup_complete.sh** - Downloads 8,461 WIUP features using `resultOffset` pagination

## Pagination vs. Individual Feature Download

### When to Use `resultOffset` (Pagination)
- ✓ Single layer, many features (1000+)
- ✓ Simple WHERE clause
- ✓ Better performance for large batches
- Example: WIUP (8,461 features in 85 batches)

### When to Use Individual OBJECTID Queries
- ✓ Complex geometries causing timeouts
- ✓ When individual features are large
- ✓ Multiple layers in same endpoint
- Example: Batas Administrasi (36 provinces + 548 kabupaten/kota across 2 layers)

## Error Handling

### Timeout Issues

If downloads timeout:

1. **Increase timeout:**
   ```bash
   curl -s --max-time 300 ...  # 5 minutes instead of 2 minutes
   ```

2. **Use smaller batch sizes:**
   ```bash
   BATCH_SIZE=50  # Instead of 100
   ```

3. **Add retry logic:**
   ```bash
   curl -s --max-time 120 --retry 3 --retry-delay 5 ...
   ```

### Validation

Always validate downloaded JSON:

```bash
if jq empty "file.json" 2>/dev/null; then
  echo "Valid JSON"
else
  echo "Invalid JSON - retry download"
  rm "file.json"
fi
```

## Processing Steps

1. **Download** → Save to temporary folder
2. **Validate** → Check JSON validity, file size
3. **Combine** → Merge all batches with jq
4. **Copy** → Move to final data folder
5. **Update** → Reference in app.js

## File Organization

```
esdmap/
├── data/
│   ├── mineral_batubara/
│   │   └── wiup_wilayah_izin_usaha_pertambangan.geojson (36M, 8,461 features)
│   ├── batas_wilayah/
│   │   ├── batas_administrasi_provinsi.geojson (874M)
│   │   └── batas_administrasi_kabupaten_kota.geojson (1.3G)
│   └── tmp_wiup/  # Temporary storage during download
│       └── wiup_wilayah_izin_usaha_pertambangan.geojson
├── scripts/
│   ├── download_wiup_complete.sh
│   ├── download_batas_admin_v3.sh
│   └── ... (other download scripts)
└── data_sources.json  # Records all 42 sources and their status
```

## Future Enhancements

- [ ] Create generic pagination script template
- [ ] Add automatic retry mechanism
- [ ] Implement parallel batch downloads
- [ ] Add progress monitoring
- [ ] Create bash function library for common operations

## References

- ArcGIS REST API Documentation: https://resources.arcgis.com/en/help/rest/apiref/query.html
- MapServer Query Parameters: https://resources.arcgis.com/en/help/rest/apiref/query.html
