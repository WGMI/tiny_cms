-- Auth schema for End FGM Africa CMS (Neon)
-- Run this if your DATABASE_URL points to a different Neon project/branch.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  UNIQUE(resource, action)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Default roles (use fixed UUIDs for consistency)
INSERT INTO roles (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111101', 'admin', 'Full access to CMS'),
  ('11111111-1111-1111-1111-111111111102', 'editor', 'Can manage pages, events, media'),
  ('11111111-1111-1111-1111-111111111103', 'viewer', 'Read-only access')
ON CONFLICT (name) DO NOTHING;

-- Permissions
INSERT INTO permissions (resource, action) VALUES
  ('pages', 'create'), ('pages', 'read'), ('pages', 'update'), ('pages', 'delete'),
  ('events', 'create'), ('events', 'read'), ('events', 'update'), ('events', 'delete'),
  ('media', 'create'), ('media', 'read'), ('media', 'update'), ('media', 'delete'),
  ('users', 'create'), ('users', 'read'), ('users', 'update'), ('users', 'delete'),
  ('roles', 'read'), ('roles', 'assign')
ON CONFLICT (resource, action) DO NOTHING;

-- Admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111101'::uuid, id FROM permissions
ON CONFLICT DO NOTHING;

-- Editor: pages, events, media
INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111102'::uuid, id FROM permissions
WHERE resource IN ('pages', 'events', 'media')
ON CONFLICT DO NOTHING;

-- Viewer: read only
INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111103'::uuid, id FROM permissions
WHERE action = 'read'
ON CONFLICT DO NOTHING;

-- Events & media (for End FGM Africa CMS)
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  filename TEXT,
  mime_type TEXT,
  public_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events_page (
  id SERIAL PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO events_page (title, subtitle, updated_at)
SELECT 'Join Our Upcoming Events', 'Discover and join events from the End FGM/C Network Africa.', now()
WHERE NOT EXISTS (SELECT 1 FROM events_page LIMIT 1);

-- Pages (raw HTML or form-generated content for site pages)
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  full_html TEXT NOT NULL,
  sections JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
