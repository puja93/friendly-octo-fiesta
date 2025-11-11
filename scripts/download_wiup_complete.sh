#!/bin/bash

echo "Downloading all WIUP (Wilayah Izin Usaha Pertambangan) features..."
echo "Total features to download: 8461"
echo ""

# Create temp directory for batches
mkdir -p /tmp/wiup_batches

BASE_URL="https://geoportal.esdm.go.id/monaresia/sharing/servers/48852a855c014a63acfd78bf06c2689a/rest/services/Pusat/WIUP_Publish/MapServer/0/query"

# Download in batches of 100 (API limit)
BATCH_SIZE=100
TOTAL_FEATURES=8461
BATCH_COUNT=$(( (TOTAL_FEATURES + BATCH_SIZE - 1) / BATCH_SIZE ))

echo "Downloading $BATCH_COUNT batches of up to $BATCH_SIZE features each..."
echo ""

DOWNLOADED=0
FAILED=0

for ((i=0; i<BATCH_COUNT; i++)); do
  OFFSET=$((i * BATCH_SIZE))
  BATCH_NUM=$((i + 1))
  
  echo -n "Batch $BATCH_NUM/$BATCH_COUNT (offset $OFFSET)... "
  
  curl -s --max-time 120 \
    "${BASE_URL}?where=1%3D1&outFields=*&resultOffset=${OFFSET}&f=geojson" \
    -o "/tmp/wiup_batches/batch_${OFFSET}.json"
  
  # Check if download was successful
  if [ -s "/tmp/wiup_batches/batch_${OFFSET}.json" ] && jq empty "/tmp/wiup_batches/batch_${OFFSET}.json" 2>/dev/null; then
    FEATURE_COUNT=$(jq '.features | length' "/tmp/wiup_batches/batch_${OFFSET}.json")
    DOWNLOADED=$((DOWNLOADED + FEATURE_COUNT))
    echo "✓ ($FEATURE_COUNT features)"
  else
    echo "✗ Failed"
    FAILED=$((FAILED + 1))
    rm -f "/tmp/wiup_batches/batch_${OFFSET}.json"
  fi
  
  # Be nice to the server - small delay between requests
  sleep 0.5
done

echo ""
echo "Combining all batches into single file..."

# Combine all successful batches
if [ "$(ls /tmp/wiup_batches/*.json 2>/dev/null | wc -l)" -gt 0 ]; then
  jq -s '[.[] | .features[]] | {type: "FeatureCollection", features: .}' /tmp/wiup_batches/*.json > /tmp/wiup_wilayah_izin_usaha_pertambangan.geojson
  
  FILE_SIZE=$(ls -lh /tmp/wiup_wilayah_izin_usaha_pertambangan.geojson | awk '{print $5}')
  FEATURE_COUNT=$(jq '.features | length' /tmp/wiup_wilayah_izin_usaha_pertambangan.geojson)
  
  echo ""
  echo "✓ Download complete!"
  echo "  File: /tmp/wiup_wilayah_izin_usaha_pertambangan.geojson"
  echo "  Size: $FILE_SIZE"
  echo "  Features: $FEATURE_COUNT"
  echo "  Failed batches: $FAILED"
  
  if [ "$FAILED" -eq 0 ]; then
    echo ""
    echo "✓ All features downloaded successfully!"
  fi
else
  echo "✗ No batches downloaded successfully"
fi

# Cleanup temp batches
rm -rf /tmp/wiup_batches
