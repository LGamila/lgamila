-- Initial database setup for Moroccan Stream
-- This file runs automatically when the container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create streamers table (this was missing and causing the error)
CREATE TABLE IF NOT EXISTS streamer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    platform VARCHAR(50) NOT NULL, -- 'twitch', 'kick', etc.
    platform_id VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    follower_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform, platform_id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'twitch', 'kick', etc.
    platform_id VARCHAR(255) NOT NULL,
    streamer_id UUID REFERENCES streamer(id) ON DELETE CASCADE,
    streamer_name VARCHAR(255) NOT NULL,
    thumbnail_url TEXT,
    viewer_count INTEGER DEFAULT 0,
    is_live BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stream_checks table (for scheduled jobs)
CREATE TABLE IF NOT EXISTS stream_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    streamer_id UUID REFERENCES streamer(id) ON DELETE CASCADE,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    was_live BOOLEAN NOT NULL,
    viewer_count INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streamer_platform ON streamer(platform);
CREATE INDEX IF NOT EXISTS idx_streamer_username ON streamer(username);