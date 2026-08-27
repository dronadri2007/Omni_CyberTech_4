process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-value';
process.env.ANALYZER = 'forensic';
process.env.CORS_ORIGINS = '*';
delete process.env.DATABASE_URL;
