-- VERIFRAME Seed Data for Initial Setup & Demo Cases

INSERT INTO users (id, name, email, password_hash, role) VALUES
('usr-demo-001', 'Dr. Sarah Vance', 'sarah.vance@factcheck.org', '$2a$10$abcdefghijklmnopqrstuv', 'fact_checker'),
('usr-demo-002', 'Alex Mercer', 'alex.mercer@cybersec.io', '$2a$10$abcdefghijklmnopqrstuv', 'analyst');

INSERT INTO media_files (id, filename, mime_type, size_bytes, file_hash, storage_url) VALUES
('med-001', 'press_conference_deepfake.mp4', 'video/mp4', 18452000, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '/samples/sample_video.mp4'),
('med-002', 'synthetic_portrait.jpg', 'image/jpeg', 2450100, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', '/samples/sample_image.jpg'),
('med-003', 'executive_voice_clone.wav', 'audio/wav', 4120000, '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eee7935b20cb', '/samples/sample_audio.wav'),
('med-004', 'verified_news_photo.png', 'image/png', 5120000, '7b257a07746487e411b012356c54c30c80b6f9f257f864e26217e54f0a0d922f', '/samples/authentic_photo.png');

INSERT INTO analysis_cases (id, user_id, media_id, title, verdict, confidence, risk_level, status) VALUES
('VF-2026-000124', 'usr-demo-001', 'med-001', 'Political Address Video Segment', 'MANIPULATED', 91, 'HIGH', 'COMPLETED'),
('VF-2026-000125', 'usr-demo-001', 'med-002', 'Profile Photo Submission #8812', 'SUSPICIOUS', 78, 'MEDIUM', 'IN_REVIEW'),
('VF-2026-000126', 'usr-demo-002', 'med-003', 'Wire Transfer Audio Instructions', 'INCONCLUSIVE', 54, 'MEDIUM', 'COMPLETED'),
('VF-2026-000127', 'usr-demo-002', 'med-004', 'Field Report Photo #401', 'AUTHENTIC', 96, 'LOW', 'COMPLETED');

INSERT INTO detection_results (id, case_id, face_forgery_score, temporal_score, audio_visual_score, metadata_score, provenance_status, model_version, reasoning_highlights) VALUES
('det-001', 'VF-2026-000124', 94, 88, 86, 75, 'NOT_VERIFIED', 'v2.4-ensemble', '["Facial landmark jitter detected between frame 120-240", "Audio pitch spectral anomaly detected around 4.2s", "C2PA cryptographic signature missing"]'),
('det-002', 'VF-2026-000125', 82, 45, 30, 85, 'SUSPICIOUS', 'v2.4-ensemble', '["Diffusion noise spectrum matches Stable Diffusion v2.1 footprint", "Unnatural eye reflections detected", "EXIF timestamp edited"]'),
('det-003', 'VF-2026-000126', 20, 15, 68, 40, 'UNAVAILABLE', 'v2.4-ensemble', '["High ambient background noise reduces neural vocoder detection certainty", "Frequency cutoff at 8kHz indicates re-encoding"]'),
('det-004', 'VF-2026-000127', 4, 3, 2, 98, 'VERIFIED', 'v2.4-ensemble', '["Hardware C2PA certificate valid (Sony Alpha 7 IV)", "Sensor noise matches authentic Bayer pattern", "Original camera raw signature present"]');

INSERT INTO provenance_results (id, case_id, c2pa_valid, issuer, camera_make, camera_model, software_history, exif_data) VALUES
('prov-001', 'VF-2026-000124', false, 'Unknown', 'Generic', 'Virtual Device', '["FFmpeg 4.4", "Adobe After Effects 2024"]', '{"Software": "Adobe After Effects", "ModifyDate": "2026-08-10T14:22:00Z"}'),
('prov-004', 'VF-2026-000127', true, 'Sony Security PKI', 'Sony', 'ILCE-7M4', '["Sony Camera Firmware v2.0"]', '{"Make": "Sony", "Model": "ILCE-7M4", "ISO": 400, "Lens": "FE 24-70mm F2.8 GM"}');

INSERT INTO review_cases (id, case_id, reviewer_id, status, reviewer_verdict, notes) VALUES
('rev-001', 'VF-2026-000125', 'usr-demo-001', 'IN_REVIEW', 'SUSPICIOUS', 'Requested secondary deepfake facial boundary inspection due to compressed upload quality.');
