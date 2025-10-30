#!/usr/bin/env node

/**
 * Cleanup script for orphaned image records
 * 
 * This script removes database records that reference non-existent files in storage.
 * Run this script to clean up orphaned records created by the upload bug.
 * 
 * Usage:
 *   node cleanup-orphaned-images.js
 * 
 * Or with dry-run mode (recommended first):
 *   node cleanup-orphaned-images.js --dry-run
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findOrphanedRecords() {
  console.log('🔍 Finding orphaned image records...');
  
  const { data: orphanedRecords, error } = await supabase
    .from('images')
    .select(`
      id,
      bid_request_id,
      image_url,
      created_at
    `)
    .not('image_url', 'is', null);

  if (error) {
    console.error('❌ Error fetching image records:', error);
    return [];
  }

  const orphaned = [];
  
  for (const record of orphanedRecords) {
    // Extract filename from URL
    const filename = record.image_url.split('/').pop();
    
    // Check if file exists in storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('vehicle_images')
      .download(filename);
    
    if (fileError || !fileData) {
      orphaned.push(record);
    }
  }
  
  return orphaned;
}

async function cleanupOrphanedRecords(orphanedRecords, dryRun = false) {
  if (orphanedRecords.length === 0) {
    console.log('✅ No orphaned records found!');
    return;
  }

  console.log(`📊 Found ${orphanedRecords.length} orphaned records:`);
  
  orphanedRecords.forEach((record, index) => {
    console.log(`   ${index + 1}. ${record.image_url} (created: ${record.created_at})`);
  });

  if (dryRun) {
    console.log('🔍 DRY RUN: Would delete the above records');
    return;
  }

  console.log('🗑️  Deleting orphaned records...');
  
  const idsToDelete = orphanedRecords.map(record => record.id);
  
  const { error } = await supabase
    .from('images')
    .delete()
    .in('id', idsToDelete);

  if (error) {
    console.error('❌ Error deleting orphaned records:', error);
    return;
  }

  console.log(`✅ Successfully deleted ${orphanedRecords.length} orphaned records`);
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  console.log('🧹 Image Cleanup Script');
  console.log('=====================');
  
  if (isDryRun) {
    console.log('🔍 Running in DRY RUN mode - no changes will be made');
  }
  
  try {
    const orphanedRecords = await findOrphanedRecords();
    await cleanupOrphanedRecords(orphanedRecords, isDryRun);
    
    console.log('✅ Cleanup completed successfully');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
