#!/bin/bash

echo "Downloading Rasio Elektrifikasi Tahun 2024 (38 features)..."

# Create data/tmp_elektrifikasi directory
mkdir -p data/tmp_elektrifikasi

# Function to download a single feature
download_feature() {
  local id=$1
  local attempt=$2
  local output_file="data/tmp_elektrifikasi/elektrifikasi_$id.json"

  echo -n "Downloading feature OBJECTID=$id (attempt $attempt)... "

  curl -s --max-time 180 \
    "https://geoportal.esdm.go.id/gis2/rest/services/SDL1/Rasio_Elektrifikasi/MapServer/0/query?where=OBJECTID%3D$id&outFields=*&f=geojson" \
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

# Download all features (first attempt)
echo "=== First download attempt for all features ==="
for i in {1..38}; do
  download_feature $i 1
  sleep 1
done

echo ""
echo "=== Checking for failed downloads ==="

# Identify failed features
FAILED_FEATURES=()
for i in {1..38}; do
  if [ ! -f "data/tmp_elektrifikasi/elektrifikasi_$i.json" ]; then
    FAILED_FEATURES+=($i)
    echo "Feature $i missing"
  fi
done

# Retry failed features
if [ ${#FAILED_FEATURES[@]} -gt 0 ]; then
  echo ""
  echo "=== Retrying ${#FAILED_FEATURES[@]} failed features ==="

  for id in "${FAILED_FEATURES[@]}"; do
    # Try up to 2 more times
    for attempt in 2 3; do
      if [ -f "data/tmp_elektrifikasi/elektrifikasi_$id.json" ]; then
        break
      fi
      download_feature $id $attempt
      sleep 2
    done
  done
fi

echo ""
echo "=== Combining valid features ==="

# Count valid files
VALID_COUNT=$(ls data/tmp_elektrifikasi/elektrifikasi_*.json 2>/dev/null | wc -l | tr -d ' ')
echo "Found $VALID_COUNT valid feature files"

if [ "$VALID_COUNT" -gt 0 ]; then
  # Combine only valid files
  jq -s '[.[] | .features[]] | {type: "FeatureCollection", features: .}' data/tmp_elektrifikasi/elektrifikasi_*.json > data/ketenagalistrikan/sdl1_rasio_elektrifikasi_rasio_elektrifikasi_tahun_2024_layer0.geojson

  if [ $? -eq 0 ]; then
    FILE_SIZE=$(ls -lh data/ketenagalistrikan/sdl1_rasio_elektrifikasi_rasio_elektrifikasi_tahun_2024_layer0.geojson | awk '{print $5}')
    FEATURE_COUNT=$(jq '.features | length' data/ketenagalistrikan/sdl1_rasio_elektrifikasi_rasio_elektrifikasi_tahun_2024_layer0.geojson 2>/dev/null || echo "0")

    echo ""
    echo "✓ Download complete!"
    echo "  File: sdl1_rasio_elektrifikasi_rasio_elektrifikasi_tahun_2024_layer0.geojson"
    echo "  Size: $FILE_SIZE"
    echo "  Features: $FEATURE_COUNT"
    echo ""
    echo "Intermediate files kept in data/tmp_elektrifikasi/ for debugging"
  else
    echo ""
    echo "✗ Failed to combine files with jq"
    echo "Intermediate files kept in data/tmp_elektrifikasi/ for debugging"

    # Show which files might be problematic
    echo ""
    echo "Checking each file individually:"
    for f in data/tmp_elektrifikasi/elektrifikasi_*.json; do
      if ! jq empty "$f" 2>/dev/null; then
        echo "  ✗ $f has invalid JSON"
      fi
    done
  fi
else
  echo "✗ No valid features downloaded"
fi

echo ""
echo "Summary:"
echo "  Valid files: $VALID_COUNT / 38"
echo "  Location: data/tmp_elektrifikasi/"
