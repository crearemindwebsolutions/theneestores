const fs = require('fs');

const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
const catalogSql = fs.readFileSync('supabase-media-and-catalog.sql', 'utf8');

let updatedSchema = schema;
if (!updatedSchema.includes('create table if not exists public.media')) {
  const insertPos = updatedSchema.indexOf('-- 5. PRODUCTS TABLE');
  const mediaTableDef = `-- 4.5. MEDIA & ASSETS TABLE (Stores all live website media, promotional banners, product cutouts & scenes)
create table if not exists public.media (
  id text primary key,
  title text not null,
  category text not null,
  file_path text not null,
  public_url text,
  alt_text text,
  media_type text default 'image/jpeg',
  file_size integer,
  dimensions text,
  tag text,
  metadata jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.media enable row level security;
drop policy if exists "Allow select on media" on public.media;
create policy "Allow select on media" on public.media for select using (true);
drop policy if exists "Allow all on media" on public.media;
create policy "Allow all on media" on public.media for all using (true) with check (true);

`;
  if (insertPos !== -1) {
    updatedSchema = updatedSchema.slice(0, insertPos) + mediaTableDef + updatedSchema.slice(insertPos);
  } else {
    updatedSchema += '\n' + mediaTableDef;
  }
}

if (!updatedSchema.includes('SEED ALL 67 CURRENT LIVE WEBSITE IMAGES')) {
  const seedMarker = '-- 7. SEED ALL 67 CURRENT LIVE WEBSITE IMAGES';
  const seedIndex = catalogSql.indexOf(seedMarker);
  if (seedIndex !== -1) {
    const endMarker = '-- 13. PERMISSIONS';
    const endIndex = catalogSql.indexOf(endMarker);
    const seedContent = endIndex !== -1
      ? catalogSql.slice(seedIndex - 80, endIndex)
      : catalogSql.slice(seedIndex - 80);
    updatedSchema += '\n\n' + seedContent;
  }
}

fs.writeFileSync('supabase-schema.sql', updatedSchema);
console.log('Successfully updated supabase-schema.sql! Total lines:', updatedSchema.split('\n').length);
