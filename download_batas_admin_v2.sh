#!/bin/bash

echo "Downloading Batas Administrasi Provinsi (38 provinces)..."

# Create temp directory
mkdir -p /tmp/provinces

# Download each province individually  
for i in {1..38}; do
  echo -n "Downloading province OBJECTID=$i... "
  
  curl -s --max-time 120 \
    "https://geoportal.esdm.go.id/gis1/rest/services/SJN/Batas_Administrasi_KSP_Area/MapServer/0/query?where=OBJECTID%3D$i&outFields=*&f=geojson" \
    -o "/tmp/provinces/province_$i.json"
  
  # Check if download was successful
  if [ -s "/tmp/provinces/province_$i.json" ] && grep -q "FeatureCollection" "/tmp/provinces/province_$i.json" 2>/dev/null; then
    # Validate JSON
    if jq empty "/tmp/provinces/province_$i.json" 2>/dev/null; then
      echo "✓"
    else
      echo "✗ Invalid JSON"
      rm "/tmp/provinces/province_$i.json"
    fi
  else
    echo "✗ Failed"
    rm -f "/tmp/provinces/province_$i.json"
  fi
  
  # Small delay
  sleep 1
done

echo ""
echo "Combining valid provinces..."

# Count valid files
VALID_COUNT=$(ls /tmp/provinces/*.json 2>/dev/null | wc -l | tr -d ' ')
echo "Found $VALID_COUNT valid province files"

if [ "$VALID_COUNT" -gt 0 ]; then
  # Combine only valid files
  jq -s '[.[] | .features[]] | {type: "FeatureCollection", features: .}' /tmp/provinces/province_*.json > data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson
  
  FILE_SIZE=$(ls -lh data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson | awk '{print $5}')
  FEATURE_COUNT=$(jq '.features | length' data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson 2>/dev/null || echo "0")
  
  echo ""
  echo "✓ Download complete!"
  echo "  File: sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson"
  echo "  Size: $FILE_SIZE"
  echo "  Features: $FEATURE_COUNT provinces"
else
  echo "✗ No valid provinces downloaded"
fi

# Cleanup
rm -rf /tmp/provinces
