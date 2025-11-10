#!/bin/bash

echo "Downloading Batas Administrasi Kabupaten/Kota (548 regencies/cities)..."

# Create data/tmp_kabkota directory
mkdir -p data/tmp_kabkota

# Function to download a single kabupaten/kota
download_kabkota() {
  local id=$1
  local attempt=$2
  local output_file="data/tmp_kabkota/kabkota_$id.json"

  echo -n "Downloading kabkota OBJECTID=$id (attempt $attempt)... "

  curl -s --max-time 120 \
    "https://geoportal.esdm.go.id/gis1/rest/services/SJN/Batas_Administrasi_KSP_Area/MapServer/1/query?where=OBJECTID%3D$id&outFields=*&f=geojson" \
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

# Download all kabupaten/kota (first attempt)
echo "=== First download attempt for all kabupaten/kota ==="
for i in {1..548}; do
  download_kabkota $i 1
  sleep 1
done

echo ""
echo "=== Checking for failed downloads ==="

# Identify failed kabupaten/kota
FAILED_KABKOTA=()
for i in {1..548}; do
  if [ ! -f "data/tmp_kabkota/kabkota_$i.json" ]; then
    FAILED_KABKOTA+=($i)
    echo "Kabkota $i missing"
  fi
done

# Retry failed kabupaten/kota
if [ ${#FAILED_KABKOTA[@]} -gt 0 ]; then
  echo ""
  echo "=== Retrying ${#FAILED_KABKOTA[@]} failed kabupaten/kota ==="

  for id in "${FAILED_KABKOTA[@]}"; do
    # Try up to 2 more times
    for attempt in 2 3; do
      if [ -f "data/tmp_kabkota/kabkota_$id.json" ]; then
        break
      fi
      download_kabkota $id $attempt
      sleep 2
    done
  done
fi

echo ""
echo "=== Combining valid kabupaten/kota ==="

# Count valid files
VALID_COUNT=$(ls data/tmp_kabkota/kabkota_*.json 2>/dev/null | wc -l | tr -d ' ')
echo "Found $VALID_COUNT valid kabupaten/kota files"

if [ "$VALID_COUNT" -gt 0 ]; then
  # Combine only valid files
  jq -s '[.[] | .features[]] | {type: "FeatureCollection", features: .}' data/tmp_kabkota/kabkota_*.json > data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_kabupaten_kota_layer1.geojson

  if [ $? -eq 0 ]; then
    FILE_SIZE=$(ls -lh data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_kabupaten_kota_layer1.geojson | awk '{print $5}')
    FEATURE_COUNT=$(jq '.features | length' data/batas_wilayah/sjn_batas_administrasi_ksp_area_batas_administrasi_kabupaten_kota_layer1.geojson 2>/dev/null || echo "0")

    echo ""
    echo "✓ Download complete!"
    echo "  File: sjn_batas_administrasi_ksp_area_batas_administrasi_kabupaten_kota_layer1.geojson"
    echo "  Size: $FILE_SIZE"
    echo "  Features: $FEATURE_COUNT kabupaten/kota"
    echo ""
    echo "Intermediate files kept in data/tmp_kabkota/ for debugging"
  else
    echo ""
    echo "✗ Failed to combine files with jq"
    echo "Intermediate files kept in data/tmp_kabkota/ for debugging"

    # Show which files might be problematic
    echo ""
    echo "Checking each file individually:"
    for f in data/tmp_kabkota/kabkota_*.json; do
      if ! jq empty "$f" 2>/dev/null; then
        echo "  ✗ $f has invalid JSON"
      fi
    done
  fi
else
  echo "✗ No valid kabupaten/kota downloaded"
fi

echo ""
echo "Summary:"
echo "  Valid files: $VALID_COUNT / 548"
echo "  Location: data/tmp_kabkota/"
