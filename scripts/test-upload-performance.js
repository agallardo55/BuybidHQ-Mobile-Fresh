#!/usr/bin/env node

/**
 * Performance test for image upload verification optimization
 * 
 * This script measures the performance difference between:
 * - Download-based verification (old method)
 * - Metadata-based verification (new method)
 * 
 * Usage:
 *   node test-upload-performance.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

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
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
    0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  return new File([pngData], 'test-image.png', { type: 'image/png' });
}

async function testDownloadVerification(filePath) {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.storage
      .from('vehicle_images')
      .download(filePath);
    
    const endTime = Date.now();
    return {
      success: !error && !!data,
      duration: endTime - startTime,
      method: 'download'
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      duration: endTime - startTime,
      method: 'download',
      error
    };
  }
}

async function testMetadataVerification(filePath) {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.storage
      .from('vehicle_images')
      .list('', { 
        limit: 1,
        search: filePath 
      });
    
    const endTime = Date.now();
    const fileExists = !error && data && data.length > 0;
    
    return {
      success: fileExists,
      duration: endTime - startTime,
      method: 'metadata'
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      duration: endTime - startTime,
      method: 'metadata',
      error
    };
  }
}

async function runPerformanceTest() {
  console.log('🚀 Image Upload Verification Performance Test');
  console.log('============================================');
  
  const testFile = createTestImage();
  const filePath = `perf-test-${Date.now()}.png`;
  
  try {
    // Upload test file
    console.log('📤 Uploading test file...');
    const { error: uploadError } = await supabase.storage
      .from('vehicle_images')
      .upload(filePath, testFile);
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return;
    }
    
    console.log('✅ Test file uploaded successfully');
    
    // Test download verification (old method)
    console.log('\n🔍 Testing download verification (old method)...');
    const downloadResults = [];
    for (let i = 0; i < 5; i++) {
      const result = await testDownloadVerification(filePath);
      downloadResults.push(result);
      console.log(`   Run ${i + 1}: ${result.duration}ms`);
    }
    
    // Test metadata verification (new method)
    console.log('\n🔍 Testing metadata verification (new method)...');
    const metadataResults = [];
    for (let i = 0; i < 5; i++) {
      const result = await testMetadataVerification(filePath);
      metadataResults.push(result);
      console.log(`   Run ${i + 1}: ${result.duration}ms`);
    }
    
    // Calculate averages
    const downloadAvg = downloadResults.reduce((sum, r) => sum + r.duration, 0) / downloadResults.length;
    const metadataAvg = metadataResults.reduce((sum, r) => sum + r.duration, 0) / metadataResults.length;
    
    // Calculate improvement
    const improvement = ((downloadAvg - metadataAvg) / downloadAvg) * 100;
    
    console.log('\n📊 Performance Results');
    console.log('======================');
    console.log(`Download verification (old): ${downloadAvg.toFixed(2)}ms average`);
    console.log(`Metadata verification (new): ${metadataAvg.toFixed(2)}ms average`);
    console.log(`Performance improvement: ${improvement.toFixed(1)}% faster`);
    
    if (improvement > 0) {
      console.log('✅ Optimization successful!');
    } else {
      console.log('⚠️  No performance improvement detected');
    }
    
    // Clean up test file
    await supabase.storage
      .from('vehicle_images')
      .remove([filePath]);
    
    console.log('\n🧹 Test file cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the performance test
runPerformanceTest().catch(console.error);
