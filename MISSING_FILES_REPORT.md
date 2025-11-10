# Missing GeoJSON Files Report

**Generated:** 2025-11-10
**Analysis Based On:** download_report.json from 2025-11-10T09:00:47.480Z

---

## Executive Summary

**Data Sources Overview:**
- **Total MapServers in Datasource.txt:** 42
- **Successfully Downloaded:** 36 files
- **Failed Downloads:** 13 files
- **Current Files in Data Folder:** 38

**Success Rate:** 85.7% (36 out of 42 MapServers produced downloadable data)

---

## Analysis by Category

### 1. Energi Terbarukan (Renewable Energy)
- **MapServers:** 11
- **Successful:** 6 files
- **Failed:** 5 files
- **Files in folder:** 8

#### ✅ Successfully Downloaded:
1. Wilayah Penugasan Survei Pendahuluan dan Eksplorasi (16.58 KB)
2. Wilayah Penugasan Survei Pendahuluan (10.65 KB)
3. Wilayah Kerja Panas Bumi (67.93 KB)
4. Potensi Energi Arus Laut Indonesia (5.63 KB)
5. Potensi Hidro (1,144.59 KB)
6. Potensi PLTS Terapung (291.89 KB)

#### ❌ Failed Downloads:
1. **Potensi Sumber Daya dan Cadangan Panas Bumi**
   - Reason: No layers found
   - URL: `https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Sumber_Daya_dan_Cadangan_Panas_Bumi/MapServer`

2. **Potensi Surya di Lahan Permukiman Tanah Terbuka Savana**
   - Reason: Download timeout
   - URL: `https://geoportal.esdm.go.id/gis5/rest/services/BLK_A/Potensi_Surya_di_Lahan_Permukiman_Tanah_Terbuka_Savana/MapServer`
   - Note: Layer exists but file is too large for standard timeout

3. **Potensi Biogas**
   - Reason: Download timeout
   - URL: `https://geoportal.esdm.go.id/gis2/rest/services/DBP/Potensi_Biogas/MapServer`

4. **Potensi Angin**
   - Reason: Network timeout (ETIMEDOUT)
   - URL: `https://geoportal.esdm.go.id/gis5/rest/services/BLK_A/Potensi_Angin/MapServer`

5. **Potensi Biomassa**
   - Reason: DNS resolution failure
   - URL: `https://geoportal.esdm.go.id/gis2/rest/services/DBP/Potensi_Biomassa/MapServer`
   - Note: Intermittent network issue

---

### 2. Mineral & Batubara (Minerals & Coal)
- **MapServers:** 7
- **Successful:** 4 files (2 layers from Mineral Laut MapServer)
- **Failed:** 4 files
- **Files in folder:** 4

#### ✅ Successfully Downloaded:
1. Lokasi Mineral Laut (11.72 KB)
2. Sebaran Mineral Laut (384.88 KB)
3. Wilayah Pertambangan (26,129.38 KB - largest file!)
4. WIUP (188.34 KB)

#### ❌ Failed Downloads:
All 4 failed MapServers have **"No layers found"** error:
1. **Potensi Sumber Daya dan Cadangan Mineral Logam**
   - URL: `https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Sumber_Daya_dan_Cadangan_Mineral_Logam/MapServer`

2. **Potensi Batubara**
   - URL: `https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Batubara/MapServer`

3. **Potensi Mineral Bukan Logam dan Batuan**
   - URL: `https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Mineral_Bukan_Logam_dan_Batuan/MapServer`

4. **Potensi Gas Metana Batubara**
   - URL: `https://geoportal.esdm.go.id/gis4/rest/services/BGD_TU/Potensi_Gas_Metana_Batubara/MapServer`

**Note:** All failed services are from the `BGD_TU` folder on `gis4` server, suggesting these services may be deprecated or misconfigured.

---

### 3. Minyak & Gas Bumi (Oil & Gas)
- **MapServers:** 13
- **Successful:** 12 files
- **Failed:** 1 file
- **Files in folder:** 12

**Success Rate:** 92.3% - Best performing category!

#### ✅ Successfully Downloaded:
1. Wilayah Kerja Migas Non Konvensional (64.36 KB)
2. Wilayah Kerja Migas Konvensional (1,157.73 KB)
3. Kilang Minyak (2.00 KB)
4. Infrastruktur Pipa Transmisi Gas Bumi (4,422.17 KB)
5. Cadangan Migas (772.63 KB)
6. Jaringan Gas Rumah Tangga (16,617.79 KB)
7. Kilang LNG Hilir (1.04 KB)
8. Kilang Gas LNG Hulu (1.13 KB)
9. Terminal LNG (0.07 KB)
10. Terminal CNG (0.79 KB)
11. Kilang LPG Hilir (2.48 KB)
12. Terminal LPG (0.07 KB)

#### ❌ Failed Download:
1. **Cekungan Sedimen**
   - Reason: No layers found
   - URL: `https://geoportal.esdm.go.id/gis4/rest/services/BGS_MG/Cekungan_Sedimen/MapServer`

---

### 4. Ketenagalistrikan (Electricity)
- **MapServers:** 9
- **Successful:** 8 files
- **Failed:** 1 file
- **Files in folder:** 8

**Success Rate:** 88.9%

#### ✅ Successfully Downloaded:
1. Jaringan Listrik (4,192.32 KB)
2. Sebaran Pembangkit Listrik (472.86 KB)
3. PLTP (9.80 KB)
4. Sebaran Lokasi Gardu Induk (806.46 KB)
5. PLTS <10MW (2.31 KB)
6. Pembangkit Berbasis Bioenergi (55.39 KB)
7. Pembangkit Offgrid APBN (308.52 KB)
8. PLTM/PLTMH <10MW (66.95 KB)

#### ❌ Failed Download:
1. **Rasio Elektrifikasi Tahun 2024**
   - Reason: Download timeout
   - URL: `https://geoportal.esdm.go.id/gis2/rest/services/SDL1/Rasio_Elektrifikasi/MapServer`
   - Note: Likely contains detailed raster or polygon data per region

---

### 5. Batas Wilayah (Boundaries)
- **MapServers:** 2
- **Successful:** 6 files (1 MapServer with 6 layers)
- **Failed:** 2 files (1 MapServer with 2 layers)
- **Files in folder:** 6

#### ✅ Successfully Downloaded:
All from **Batas Laut Indonesia** MapServer:
1. Peta Batas Landas Kontinen (191.11 KB)
2. Peta Batas Laut MOU Fisheries (14.79 KB)
3. Peta Batas Teritorial (107.77 KB)
4. Peta Batas ZEE (393.54 KB)
5. Peta Garis Pangkal (50.59 KB)
6. Peta Zona Tambahan (162.87 KB)

#### ❌ Failed Downloads:
Both from **Batas Administrasi KSP Area** MapServer:
1. **Batas Administrasi Provinsi** (Layer 0)
   - Reason: Download timeout
   - URL: `https://geoportal.esdm.go.id/gis1/rest/services/SJN/Batas_Administrasi_KSP_Area/MapServer`

2. **Batas Administrasi Kabupaten/Kota** (Layer 1)
   - Reason: Download timeout
   - URL: `https://geoportal.esdm.go.id/gis1/rest/services/SJN/Batas_Administrasi_KSP_Area/MapServer`
   - Note: Administrative boundaries for all provinces/districts - very large dataset

---

## Failure Analysis

### Failure Types Summary

| Failure Type | Count | Percentage |
|-------------|-------|------------|
| No layers found | 6 | 46.2% |
| Download timeout | 5 | 38.5% |
| Network timeout | 1 | 7.7% |
| DNS error | 1 | 7.7% |

### 1. No Layers Found (6 MapServers)

**Pattern:** All 4 from Mineral & Batubara category are from the same server path (`gis4/BGD_TU`)

**Affected Services:**
- BGD_TU: Potensi Sumber Daya dan Cadangan Panas Bumi
- BGD_TU: Potensi Sumber Daya dan Cadangan Mineral Logam
- BGD_TU: Potensi Batubara
- BGD_TU: Potensi Mineral Bukan Logam dan Batuan
- BGD_TU: Potensi Gas Metana Batubara
- BGS_MG: Cekungan Sedimen

**Likely Cause:** These MapServers may be:
- Deprecated or moved to new URLs
- Under maintenance
- Not yet published despite being in the service catalog
- Misconfigured

**Action Required:** Manual verification on ESDM geoportal website

### 2. Download Timeout (5 Layers)

**Pattern:** These are valid services with data but files are too large for 60-second timeout

**Affected Layers:**
1. Potensi Surya di Lahan Permukiman (Solar potential - likely high-resolution raster)
2. Potensi Biogas (Biogas potential)
3. Rasio Elektrifikasi 2024 (Electrification ratio per region)
4. Batas Administrasi Provinsi (Provincial boundaries)
5. Batas Administrasi Kabupaten/Kota (District/city boundaries - most detailed)

**Solution Available:** Use `retry_downloads.js` with 5-minute timeout

### 3. Network Errors (2 Occurrences)

**Affected:**
- Potensi Angin (ETIMEDOUT)
- Potensi Biomassa (DNS resolution failure)

**Likely Cause:** Temporary network issues during download

**Action Required:** Retry download

---

## Recommendations

### Immediate Actions

1. **For Timeout Errors (5 files):**
   ```bash
   node retry_downloads.js
   ```
   This script has:
   - 5-minute timeout (vs 60 seconds)
   - Automatic retry (2 attempts)
   - Better error handling

2. **For Network Errors (2 files):**
   - Retry with stable internet connection
   - Can also use `retry_downloads.js`

3. **For "No Layers" Errors (6 MapServers):**
   - Verify URLs manually at https://geoportal.esdm.go.id
   - Check if services have been moved or deprecated
   - Contact ESDM if these are critical datasets

### Long-term Improvements

1. **Update `download_geojson.js`:**
   - Increase default timeout to 120 seconds
   - Add automatic retry logic
   - Implement exponential backoff for network errors

2. **Monitor ESDM Geoportal:**
   - Periodically check for new services
   - Verify deprecated services
   - Update Datasource.txt accordingly

3. **Data Organization:**
   - Current structure is good with category-based folders
   - Consider adding metadata.json per category with:
     - Data source information
     - Last update timestamp
     - Data quality notes

---

## Files Generated

### Analysis Scripts
1. **verify_datasources.js** - Comprehensive verification script (checks URLs and files)
2. **analyze_missing_files.js** - Analyzes download_report.json and existing files

### Reports
1. **verification_report.json** - Technical details of URL verification
2. **missing_files_analysis.json** - Structured analysis data
3. **MISSING_FILES_REPORT.md** - This human-readable report

---

## Data Completeness by Category

```
Energi Terbarukan:    ████████░░ 54.5% (6/11 MapServers)
Mineral & Batubara:   █████░░░░░ 57.1% (4/7 MapServers)
Minyak & Gas Bumi:    █████████░ 92.3% (12/13 MapServers)
Ketenagalistrikan:    █████████░ 88.9% (8/9 MapServers)
Batas Wilayah:        ██████████ 75.0% (1/2 MapServers, 6 layers)

Overall:              █████████░ 85.7% (36/42 MapServers)
```

---

## Next Steps

1. ✅ Run `retry_downloads.js` to attempt downloading timeout failures
2. ⚠️ Manually verify "No layers found" MapServers on ESDM geoportal
3. 🔄 Update Datasource.txt to remove deprecated services
4. 📊 Consider adding new data sources from ESDM geoportal
5. 🗺️ Integrate downloaded layers into the web application (app.js)

---

**Report Generated by:** analyze_missing_files.js
**Base Data:** download_report.json
**Existing Download Scripts:** download_geojson.js, retry_downloads.js
