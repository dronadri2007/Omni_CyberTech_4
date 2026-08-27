-- VERIFRAME Database Schema Definition (PostgreSQL 14+)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analyst', -- analyst, journalist, fact_checker, reviewer, admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_files (
    id VARCHAR(64) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    file_hash VARCHAR(128) NOT NULL,
    storage_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analysis_cases (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    media_id VARCHAR(64) REFERENCES media_files(id),
    title VARCHAR(255) NOT NULL,
    verdict VARCHAR(50) NOT NULL, -- AUTHENTIC, SUSPICIOUS, MANIPULATED, INCONCLUSIVE
    confidence INT NOT NULL, -- 0 to 100
    risk_level VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- PROCESSING, COMPLETED, IN_REVIEW, ARCHIVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detection_results (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES analysis_cases(id) ON DELETE CASCADE,
    face_forgery_score INT NOT NULL,
    temporal_score INT NOT NULL,
    audio_visual_score INT NOT NULL,
    metadata_score INT NOT NULL,
    provenance_status VARCHAR(50) NOT NULL, -- VERIFIED, NOT_VERIFIED, SUSPICIOUS, UNAVAILABLE
    model_version VARCHAR(50) NOT NULL DEFAULT 'v2.4-ensemble',
    reasoning_highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    heatmap_matrix JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provenance_results (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES analysis_cases(id) ON DELETE CASCADE,
    c2pa_valid BOOLEAN NOT NULL DEFAULT false,
    issuer VARCHAR(255),
    signature_timestamp TIMESTAMP WITH TIME ZONE,
    camera_make VARCHAR(100),
    camera_model VARCHAR(100),
    software_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    exif_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS review_cases (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES analysis_cases(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(64) REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, IN_REVIEW, VERIFIED, OVERRIDDEN, REJECTED
    reviewer_verdict VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES analysis_cases(id) ON DELETE CASCADE,
    pdf_url TEXT,
    json_export JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    name VARCHAR(100) NOT NULL,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
