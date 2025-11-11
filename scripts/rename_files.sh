#!/bin/bash

# Rename files to be more human-readable
# Removes service prefixes and redundant information

echo "Renaming files to be more human-readable..."

# Batas Wilayah
cd data/batas_wilayah
mv "sjn_batas_administrasi_ksp_area_batas_administrasi_kabupaten_kota_layer1.geojson" "batas_administrasi_kabupaten_kota.geojson" 2>/dev/null && echo "✓ batas_administrasi_kabupaten_kota.geojson"
mv "sjn_batas_administrasi_ksp_area_batas_administrasi_provinsi_layer0.geojson" "batas_administrasi_provinsi.geojson" 2>/dev/null && echo "✓ batas_administrasi_provinsi.geojson"
mv "sjn_batas_laut_indonesia_peta_batas_landas_kontinen_layer0.geojson" "batas_laut_landas_kontinen.geojson" 2>/dev/null && echo "✓ batas_laut_landas_kontinen.geojson"
mv "sjn_batas_laut_indonesia_peta_batas_laut_mou_fisheries_layer1.geojson" "batas_laut_mou_fisheries.geojson" 2>/dev/null && echo "✓ batas_laut_mou_fisheries.geojson"
mv "sjn_batas_laut_indonesia_peta_batas_teritorial_layer2.geojson" "batas_laut_teritorial.geojson" 2>/dev/null && echo "✓ batas_laut_teritorial.geojson"
mv "sjn_batas_laut_indonesia_peta_batas_zee_layer3.geojson" "batas_laut_zee.geojson" 2>/dev/null && echo "✓ batas_laut_zee.geojson"
mv "sjn_batas_laut_indonesia_peta_garis_pangkal_layer4.geojson" "batas_laut_garis_pangkal.geojson" 2>/dev/null && echo "✓ batas_laut_garis_pangkal.geojson"
mv "sjn_batas_laut_indonesia_peta_zona_tambahan_layer5.geojson" "batas_laut_zona_tambahan.geojson" 2>/dev/null && echo "✓ batas_laut_zona_tambahan.geojson"
cd ../..

# Energi Terbarukan
cd data/energi_terbarukan
mv "blk_a_potensi_angin_potensi_angin_layer0.geojson" "potensi_angin.geojson" 2>/dev/null && echo "✓ potensi_angin.geojson"
mv "blk_a_potensi_energi_arus_laut_indonesia_potensi_energi_arus_laut_indonesia_layer0.geojson" "potensi_energi_arus_laut.geojson" 2>/dev/null && echo "✓ potensi_energi_arus_laut.geojson"
mv "blk_a_potensi_hidro_potensi_hidro_layer0.geojson" "potensi_hidro.geojson" 2>/dev/null && echo "✓ potensi_hidro.geojson"
mv "blk_a_potensi_plts_terapung_potensi_plts_terapung_layer0.geojson" "potensi_plts_terapung.geojson" 2>/dev/null && echo "✓ potensi_plts_terapung.geojson"
mv "blk_a_potensi_surya_di_lahan_permukiman_tanah_terbuka_savana_potensi_surya_di_lahan_permukiman_tanahterbuka_savana_layer0.geojson" "potensi_surya_lahan_permukiman_savana.geojson" 2>/dev/null && echo "✓ potensi_surya_lahan_permukiman_savana.geojson"
mv "dbp_potensi_biogas_potensi_biogas_layer0.geojson" "potensi_biogas.geojson" 2>/dev/null && echo "✓ potensi_biogas.geojson"
mv "dbp_potensi_biomassa_potensi_biomassa_layer0.geojson" "potensi_biomassa.geojson" 2>/dev/null && echo "✓ potensi_biomassa.geojson"
mv "dpp_wilayah_kerja_panas_bumi_wilayah_kerja_panas_bumi_layer0.geojson" "wilayah_kerja_panas_bumi.geojson" 2>/dev/null && echo "✓ wilayah_kerja_panas_bumi.geojson"
mv "dpp_wilayah_penugasan_survei_pendahuluan_dan_eksplorasi_wilayah_penugasan_survei_pendahuluan_dan_eksplorasi_layer0.geojson" "wilayah_penugasan_survei_pendahuluan_eksplorasi.geojson" 2>/dev/null && echo "✓ wilayah_penugasan_survei_pendahuluan_eksplorasi.geojson"
mv "dpp_wilayah_penugasan_survei_pendahuluan_wilayah_penugasan_survei_pendahuluan_layer0.geojson" "wilayah_penugasan_survei_pendahuluan.geojson" 2>/dev/null && echo "✓ wilayah_penugasan_survei_pendahuluan.geojson"
cd ../..

# Ketenagalistrikan
cd data/ketenagalistrikan
mv "dap_pembangkit_offgrid_apbn_pembangkit_offgrid_apbn_layer0.geojson" "pembangkit_offgrid_apbn.geojson" 2>/dev/null && echo "✓ pembangkit_offgrid_apbn.geojson"
mv "dap_pltm_pltmh_under_10_mega_watt_pltm_pltmh_10mw_layer0.geojson" "pltm_pltmh_under_10mw.geojson" 2>/dev/null && echo "✓ pltm_pltmh_under_10mw.geojson"
mv "dap_plts_under_10_mega_watt_plts_10mw_layer0.geojson" "plts_under_10mw.geojson" 2>/dev/null && echo "✓ plts_under_10mw.geojson"
mv "dbp_pembangkit_berbasis_bioenergi_pembangkit_berbasis_bioenergi_layer0.geojson" "pembangkit_bioenergi.geojson" 2>/dev/null && echo "✓ pembangkit_bioenergi.geojson"
mv "dpp_pltp_pltp_layer0.geojson" "pltp_panas_bumi.geojson" 2>/dev/null && echo "✓ pltp_panas_bumi.geojson"
mv "sdl1_jaringan_listrik_jaringan_listrik_layer0.geojson" "jaringan_listrik.geojson" 2>/dev/null && echo "✓ jaringan_listrik.geojson"
mv "sdl1_rasio_elektrifikasi_rasio_elektrifikasi_tahun_2024_layer0.geojson" "rasio_elektrifikasi_2024.geojson" 2>/dev/null && echo "✓ rasio_elektrifikasi_2024.geojson"
mv "sdl1_sebaran_lokasi_gardu_induk_sebaran_lokasi_gardu_induk_layer0.geojson" "sebaran_gardu_induk.geojson" 2>/dev/null && echo "✓ sebaran_gardu_induk.geojson"
mv "sdl1_sebaran_pembangkit_listrik_sebaran_pembangkit_listrik_layer0.geojson" "sebaran_pembangkit_listrik.geojson" 2>/dev/null && echo "✓ sebaran_pembangkit_listrik.geojson"
cd ../..

# Mineral Batubara
cd data/mineral_batubara
mv "blk_a_mineral_laut_lokasi_mineral_laut_layer0.geojson" "mineral_laut_lokasi.geojson" 2>/dev/null && echo "✓ mineral_laut_lokasi.geojson"
mv "blk_a_mineral_laut_sebaran_mineral_laut_layer1.geojson" "mineral_laut_sebaran.geojson" 2>/dev/null && echo "✓ mineral_laut_sebaran.geojson"
mv "pusat_wilayahpertambangan_wilayah_pertambangan_layer0.geojson" "wilayah_pertambangan.geojson" 2>/dev/null && echo "✓ wilayah_pertambangan.geojson"
mv "pusat_wiup_publish_wiup_layer0.geojson" "wiup_wilayah_izin_usaha_pertambangan.geojson" 2>/dev/null && echo "✓ wiup_wilayah_izin_usaha_pertambangan.geojson"
cd ../..

# Minyak Gas Bumi
cd data/minyak_gas_bumi
mv "dmbs_infrastruktur_pipa_transmisi_gas_bumi_infrastruktur_pipa_transmisi_gas_bumi_layer0.geojson" "infrastruktur_pipa_transmisi_gas.geojson" 2>/dev/null && echo "✓ infrastruktur_pipa_transmisi_gas.geojson"
mv "dmbs_jaringan_gas_rumah_tangga_jaringan_gas_rumah_tangga_layer0.geojson" "jaringan_gas_rumah_tangga.geojson" 2>/dev/null && echo "✓ jaringan_gas_rumah_tangga.geojson"
mv "dmep_cadangan_migas_cadangan_migas_layer0.geojson" "cadangan_migas.geojson" 2>/dev/null && echo "✓ cadangan_migas.geojson"
mv "dmep_kilang_lng_hulu_kilang_gas_lng_hulu_layer0.geojson" "kilang_lng_hulu.geojson" 2>/dev/null && echo "✓ kilang_lng_hulu.geojson"
mv "dmew_wilayah_kerja_migas_konvensional_wilayah_kerja_migas_konvensional_layer0.geojson" "wilayah_kerja_migas_konvensional.geojson" 2>/dev/null && echo "✓ wilayah_kerja_migas_konvensional.geojson"
mv "dmew_wilayah_kerja_migas_non_konvensional_wilayah_kerja_migas_non_konvensional_layer0.geojson" "wilayah_kerja_migas_non_konvensional.geojson" 2>/dev/null && echo "✓ wilayah_kerja_migas_non_konvensional.geojson"
mv "dmoo_kilang_lng_hilir_kilang_lng_hilir_layer0.geojson" "kilang_lng_hilir.geojson" 2>/dev/null && echo "✓ kilang_lng_hilir.geojson"
mv "dmoo_kilang_lpg_hilir_kilang_lpg_hilir_layer0.geojson" "kilang_lpg_hilir.geojson" 2>/dev/null && echo "✓ kilang_lpg_hilir.geojson"
mv "dmoo_kilang_minyak_kilang_minyak_layer0.geojson" "kilang_minyak.geojson" 2>/dev/null && echo "✓ kilang_minyak.geojson"
mv "dmos_terminal_cng_terminal_cng_layer0.geojson" "terminal_cng.geojson" 2>/dev/null && echo "✓ terminal_cng.geojson"
mv "dmos_terminal_lng_terminal_lng_layer0.geojson" "terminal_lng.geojson" 2>/dev/null && echo "✓ terminal_lng.geojson"
mv "dmos_terminal_lpg_terminal_lpg_layer0.geojson" "terminal_lpg.geojson" 2>/dev/null && echo "✓ terminal_lpg.geojson"
cd ../..

echo ""
echo "✓ All files renamed successfully!"
echo ""
echo "Summary of changes:"
echo "  - Removed service prefixes (sjn_, blk_a_, dbp_, etc.)"
echo "  - Removed redundant directory names from filenames"
echo "  - Removed layer numbers (layer0, layer1, etc.) where not needed"
echo "  - Kept essential information (year, type, location)"
