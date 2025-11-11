#!/bin/bash

echo "Downloading Batas Administrasi Provinsi (38 provinces)..."

# Create data/tmp_provinsi directory
mkdir -p data/tmp_provinsi

# Function to download a single province
download_province() {
  local id=$1
  local attempt=$2
  local output_file="data/tmp_provinsi/province_$id.json"

  echo -n "Downloading province OBJECTID=$id (attempt $attempt)... "

  curl -s --max-time 120 \
    "https://geoportal.esdm.go.id/gis1/rest/services/SJN/Batas_Administrasi_KSP_Area/MapServer/0/query?where=OBJECTID%3D$id&outFields=*&f=geojson" \
    -o "$output_file"

  # Check if download was successful and valid JSON
  if [ -s "$output_file" ] && grep -q "FeatureCollection" "$output_file" 2>/dev/null; then
    if jq empty "$output_file" 2>/dev/null; then
      echo "✓"
      return 0
    else
      echo "✗ Invalid JSON"
      rm "$output_file"
      return 1
    fi
  else
    echo "✗ Failed"
    rm -f "$output_file"
    return 1
  fi
}

# Download all provinces (first attempt)
echo "=== First download attempt for all provinces ==="
for i in {1..38}; do
  download_province $i 1
  sleep 1
done

echo ""
echo "=== Checking for failed downloads ==="

# Identify failed provinces
FAILED_PROVINCES=()
for i in {1..38}; do
  if [ ! -f "data/tmp_provinsi/province_$i.json" ]; then
    FAILED_PROVINCES+=($i)
    echo "Province $i missing"
  fi
done

# Retry failed provinces
if [ ${#FAILED_PROVINCES[@]} -gt 0 ]; then
  echo ""
  echo "=== Retrying ${#FAILED_PROVINCES[@]} failed provinces ==="

  for id in "${FAILED_PROVINCES[@]}"; do
    # Try up to 2 more times
    for attempt in 2 3; do
      if [ -f "data/tmp_provinsi/province_$id.json" ]; then
        break
      fi
      download_province $id $attempt
      sleep 2
    done
  done
fi

echo ""
echo "=== Combining valid provinces ==="

# Count valid files
VALID_COUNT=$(ls data/tmp_provinsi/province_*.json 2>/dev/null | wc -l | tr -d ' ')
echo "Found $VALID_COUNT valid province files"

if [ "$VALID_COUNT" -gt 0 ]; then
  # Combine only valid files
  jq -s '[.[] | .features[]] | {type: "FeatureCollection", features: .}' data/tmp_provinsi/province_*.json > data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson

  if [ $? -eq 0 ]; then
    FILE_SIZE=$(ls -lh data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson | awk '{print $5}')
    FEATURE_COUNT=$(jq '.features | length' data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson 2>/dev/null || echo "0")

    echo ""
    echo "✓ Download complete!"
    echo "  File: sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson"
    echo "  Size: $FILE_SIZE"
    echo "  Features: $FEATURE_COUNT provinces"
    echo ""
    echo "Intermediate files kept in data/tmp_provinsi/ for debugging"
  else
    echo ""
    echo "✗ Failed to combine files with jq"
    echo "Intermediate files kept in data/tmp_provinsi/ for debugging"

    # Show which files might be problematic
    echo ""
    echo "Checking each file individually:"
    for f in data/tmp_provinsi/province_*.json; do
      if ! jq empty "$f" 2>/dev/null; then
        echo "  ✗ $f has invalid JSON"
      fi
    done
  fi
else
  echo "✗ No valid provinces downloaded"
fi

echo ""
echo "Summary:"
echo "  Valid files: $VALID_COUNT / 38"
echo "  Location: data/tmp_provinsi/"
