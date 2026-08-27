-- VERIFRAME persistence for the rich nested AnalysisCase aggregate.
-- The normalised tables in schema.sql remain the model of record for BI / reporting;
-- this document table is what the API reads and writes at runtime.

CREATE TABLE IF NOT EXISTS analysis_case_documents (
    id          VARCHAR(64) PRIMARY KEY,
    user_id     VARCHAR(64),
    verdict     VARCHAR(50) NOT NULL,
    risk_level  VARCHAR(20) NOT NULL,
    status      VARCHAR(50) NOT NULL,
    doc         JSONB NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_case_docs_created  ON analysis_case_documents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_docs_verdict  ON analysis_case_documents (verdict);

CREATE TABLE IF NOT EXISTS review_case_documents (
    id          VARCHAR(64) PRIMARY KEY,
    case_id     VARCHAR(64) NOT NULL,
    status      VARCHAR(50) NOT NULL,
    doc         JSONB NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_key_documents (
    id          VARCHAR(64) PRIMARY KEY,
    doc         JSONB NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
