create extension if not exists "pgcrypto";

create table if not exists regulatory_documents (
    id uuid primary key default gen_random_uuid(),

    jurisdiction text not null,
    authority text not null,

    document_code text not null,
    title text not null,

    version text,
    effective_from date,
    effective_until date,

    source_url text not null,

    storage_bucket text,
    storage_path text,

    sha256 text not null,

    created_at timestamptz not null default now(),

    unique (document_code, version, sha256)
);

create table regulatory_sections (
    id uuid primary key default gen_random_uuid(),

    document_id uuid not null
        references regulatory_documents(id)
        on delete cascade,

    section_number text not null,
    title text,

    content text not null,

    page_start integer,
    page_end integer,

    created_at timestamptz not null default now(),

    unique (document_id, section_number)
);