-- SQL script to add obligation column to tasks table
-- This can be run directly on the TiDB database

ALTER TABLE tasks ADD COLUMN obligation VARCHAR(255) DEFAULT '';