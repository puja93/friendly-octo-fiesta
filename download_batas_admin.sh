#!/bin/bash

echo "Downloading Batas Administrasi Provinsi (38 provinces)..."

# Initialize combined GeoJSON
echo '{
  "type": "FeatureCollection",
  "features": []
}' > /tmp/combined_provinsi.json

# Download each province individually
for i in {1..38}; do
  echo -n "Downloading province OBJECTID=$i... "
  
  curl -s --max-time 120 \
    "https://geoportal.esdm.go.id/gis1/rest/services/SJN/Batas_Administrasi_KSP_Area/MapServer/0/query?where=OBJECTID%3D$i&outFields=*&f=geojson" \
    -o "/tmp/province_$i.json"
  
  # Check if download was successful
  if [ -s "/tmp/province_$i.json" ] && grep -q "FeatureCollection" "/tmp/province_$i.json"; then
    echo "✓"
  else
    echo "✗ Failed"
  fi
  
  # Small delay to be nice to the server
  sleep 1
done

echo ""
echo "Combining all provinces into single file..."

# Use jq to combine all features
jq -s '[.[] | .features[]] | {type: "FeatureCollection", features: .}' /tmp/province_*.json > data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson

# Cleanup temp files
rm -f /tmp/province_*.json /tmp/combined_provinsi.json

FILE_SIZE=$(ls -lh data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson | awk '{print $5}')
FEATURE_COUNT=$(jq '.features | length' data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson)

echo ""
echo "✓ Download complete!"
echo "  File: sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson"
echo "  Size: $FILE_SIZE"
echo "  Features: $FEATURE_COUNT provinces"
