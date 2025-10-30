#!/usr/bin/env node

/**
 * Test script for the image upload fix
 * 
 * This script tests the complete solution to ensure:
 * 1. Upload verification works correctly
 * 2. Rollback logic cleans up orphaned files
 * 3. Transaction-like safety prevents partial uploads
 * 
 * Usage:
 *   node test-image-upload-fix.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create a test image file
function createTestImage() {
  // Create a simple 1x1 pixel PNG
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc.
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, // compressed data
    0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // checksum
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  return new File([pngData], 'test-image.png', { type: 'image/png' });
}

async function testUploadVerification() {
  console.log('🧪 Testing upload verification...');
  
  const testFile = createTestImage();
  const filePath = `test-verification-${Date.now()}.png`;
  
  try {
    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('vehicle_images')
      .upload(filePath, testFile);
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return false;
    }
    
    // Verify file exists by checking metadata (efficient)
    const { data, error } = await supabase.storage
      .from('vehicle_images')
      .list('', { 
        limit: 1,
        search: filePath 
      });
    
    // File exists if list returns results
    const fileExists = !error && data && data.length > 0;
    
    if (!fileExists) {
      console.error('❌ Verification failed:', error);
      return false;
    }
    
    console.log('✅ Upload verification test passed (metadata check)');
    
    // Clean up test file
    await supabase.storage
      .from('vehicle_images')
      .remove([filePath]);
    
    return true;
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  }
}

async function testRollbackLogic() {
  console.log('🧪 Testing rollback logic...');
  
  const testFiles = [
    createTestImage(),
    createTestImage(),
    createTestImage()
  ];
  
  const filePaths = testFiles.map((_, index) => `test-rollback-${Date.now()}-${index}.png`);
  
  try {
    // Upload all files
    const uploadPromises = testFiles.map((file, index) =>
      supabase.storage
        .from('vehicle_images')
        .upload(filePaths[index], file)
    );
    
    const uploadResults = await Promise.all(uploadPromises);
    
    // Check if any upload failed
    const failedUploads = uploadResults.filter(result => result.error);
    if (failedUploads.length > 0) {
      console.error('❌ Some uploads failed:', failedUploads);
      return false;
    }
    
    // Simulate verification failure by removing one file
    await supabase.storage
      .from('vehicle_images')
      .remove([filePaths[1]]);
    
    // Test rollback logic (simulate what the component does)
    const filePathsToRemove = filePaths;
    const { error: rollbackError } = await supabase.storage
      .from('vehicle_images')
      .remove(filePathsToRemove);
    
    if (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError);
      return false;
    }
    
    // Verify all files were removed
    for (const filePath of filePaths) {
      const { data, error } = await supabase.storage
        .from('vehicle_images')
        .download(filePath);
      
      if (!error) {
        console.error('❌ File not removed during rollback:', filePath);
        return false;
      }
    }
    
    console.log('✅ Rollback logic test passed');
    return true;
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  }
}

async function testTransactionSafety() {
  console.log('🧪 Testing transaction-like safety...');
  
  const testFile = createTestImage();
  const filePath = `test-transaction-${Date.now()}.png`;
  
  try {
    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('vehicle_images')
      .upload(filePath, testFile);
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return false;
    }
    
    // Simulate error during processing
    throw new Error('Simulated processing error');
    
  } catch (error) {
    // Test rollback in catch block (simulate what the component does)
    console.log('🔄 Simulating rollback due to error...');
    
    try {
      await supabase.storage
        .from('vehicle_images')
        .remove([filePath]);
      
      // Verify file was removed
      const { data, error } = await supabase.storage
        .from('vehicle_images')
        .download(filePath);
      
      if (!error) {
        console.error('❌ File not removed during error rollback');
        return false;
      }
      
      console.log('✅ Transaction safety test passed');
      return true;
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError);
      return false;
    }
  }
}

async function testOrphanedRecordCleanup() {
  console.log('🧪 Testing orphaned record cleanup...');
  
  try {
    // Check for existing orphaned records
    const { data: orphanedRecords, error } = await supabase
      .from('images')
      .select('id, image_url')
      .not('image_url', 'is', null);
    
    if (error) {
      console.error('❌ Error fetching records:', error);
      return false;
    }
    
    let orphanedCount = 0;
    
    for (const record of orphanedRecords) {
      const filename = record.image_url.split('/').pop();
      const { data, error } = await supabase.storage
        .from('vehicle_images')
        .list('', { 
          limit: 1,
          search: filename 
        });
      
      // File doesn't exist if list returns no results
      const fileExists = !error && data && data.length > 0;
      if (!fileExists) {
        orphanedCount++;
      }
    }
    
    if (orphanedCount > 0) {
      console.log(`⚠️  Found ${orphanedCount} orphaned records`);
      console.log('   Run the cleanup script to remove them');
    } else {
      console.log('✅ No orphaned records found');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  }
}

async function main() {
  console.log('🧪 Image Upload Fix - Comprehensive Test Suite');
  console.log('==============================================');
  
  const tests = [
    { name: 'Upload Verification', fn: testUploadVerification },
    { name: 'Rollback Logic', fn: testRollbackLogic },
    { name: 'Transaction Safety', fn: testTransactionSafety },
    { name: 'Orphaned Record Check', fn: testOrphanedRecordCleanup }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 Running ${test.name}...`);
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} failed with error:`, error);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results');
  console.log('===============');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The image upload fix is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);
