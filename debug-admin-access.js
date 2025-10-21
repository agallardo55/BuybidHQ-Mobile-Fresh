#!/usr/bin/env node

/**
 * Debug Admin Access Issue
 * 
 * This script helps identify why a user is showing as having admin access
 * when they should be a free member.
 * 
 * Usage: node debug-admin-access.js <user_email>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugUserAdminAccess(userEmail) {
  console.log(`🔍 Debugging admin access for user: ${userEmail}`);
  console.log('=' .repeat(60));

  try {
    // 1. Check if user exists in auth.users
    console.log('\n1️⃣ Checking auth.users table...');
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    const user = authUser.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.log('❌ User not found in auth.users');
      return;
    }
    
    console.log(`✅ User found in auth.users: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${user.created_at}`);
    console.log(`   Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);

    // 2. Check buybidhq_users table
    console.log('\n2️⃣ Checking buybidhq_users table...');
    const { data: buybidhqUser, error: buybidhqError } = await supabase
      .from('buybidhq_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (buybidhqError) {
      console.log(`❌ Error fetching buybidhq_users: ${buybidhqError.message}`);
    } else if (!buybidhqUser) {
      console.log('❌ User not found in buybidhq_users table');
    } else {
      console.log('✅ User found in buybidhq_users:');
      console.log(`   ID: ${buybidhqUser.id}`);
      console.log(`   Email: ${buybidhqUser.email}`);
      console.log(`   Role: ${buybidhqUser.role}`);
      console.log(`   App Role: ${buybidhqUser.app_role}`);
      console.log(`   Account ID: ${buybidhqUser.account_id}`);
      console.log(`   Dealership ID: ${buybidhqUser.dealership_id}`);
      console.log(`   Is Active: ${buybidhqUser.is_active}`);
      console.log(`   Deleted At: ${buybidhqUser.deleted_at}`);
      
      // Check if legacy role is causing admin access
      if (buybidhqUser.role === 'admin') {
        console.log('🚨 ISSUE FOUND: User has legacy role = "admin"');
        console.log('   This is likely the cause of admin access!');
      }
    }

    // 3. Check legacy superadmin table
    console.log('\n3️⃣ Checking legacy superadmin table...');
    const { data: superadminEntry, error: superadminError } = await supabase
      .from('superadmin')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (superadminError && superadminError.code !== 'PGRST116') {
      console.log(`❌ Error fetching superadmin: ${superadminError.message}`);
    } else if (superadminEntry) {
      console.log('🚨 ISSUE FOUND: User exists in legacy superadmin table!');
      console.log(`   Status: ${superadminEntry.status}`);
      console.log(`   Created: ${superadminEntry.created_at}`);
      console.log(`   Updated: ${superadminEntry.updated_at}`);
    } else {
      console.log('✅ User not found in legacy superadmin table');
    }

    // 4. Check new super_administrators table
    console.log('\n4️⃣ Checking super_administrators table...');
    const { data: superAdminEntry, error: superAdminError } = await supabase
      .from('super_administrators')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (superAdminError && superAdminError.code !== 'PGRST116') {
      console.log(`❌ Error fetching super_administrators: ${superAdminError.message}`);
    } else if (superAdminEntry) {
      console.log('🚨 ISSUE FOUND: User exists in super_administrators table!');
      console.log(`   Status: ${superAdminEntry.status}`);
      console.log(`   Granted By: ${superAdminEntry.granted_by}`);
      console.log(`   Granted At: ${superAdminEntry.granted_at}`);
    } else {
      console.log('✅ User not found in super_administrators table');
    }

    // 5. Check account_administrators table
    console.log('\n5️⃣ Checking account_administrators table...');
    const { data: accountAdminEntries, error: accountAdminError } = await supabase
      .from('account_administrators')
      .select('*')
      .eq('user_id', user.id);

    if (accountAdminError) {
      console.log(`❌ Error fetching account_administrators: ${accountAdminError.message}`);
    } else if (accountAdminEntries && accountAdminEntries.length > 0) {
      console.log('🚨 ISSUE FOUND: User exists in account_administrators table!');
      accountAdminEntries.forEach((entry, index) => {
        console.log(`   Entry ${index + 1}:`);
        console.log(`     Account ID: ${entry.account_id}`);
        console.log(`     Status: ${entry.status}`);
        console.log(`     Granted By: ${entry.granted_by}`);
        console.log(`     Granted At: ${entry.granted_at}`);
      });
    } else {
      console.log('✅ User not found in account_administrators table');
    }

    // 6. Check user_roles table
    console.log('\n6️⃣ Checking user_roles table...');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);

    if (userRolesError) {
      console.log(`❌ Error fetching user_roles: ${userRolesError.message}`);
    } else if (userRoles && userRoles.length > 0) {
      console.log('📋 User roles found:');
      userRoles.forEach((role, index) => {
        console.log(`   Role ${index + 1}: ${role.role}`);
        console.log(`     Active: ${role.is_active}`);
        console.log(`     Granted At: ${role.granted_at}`);
        console.log(`     Expires At: ${role.expires_at || 'Never'}`);
      });
    } else {
      console.log('✅ No entries found in user_roles table');
    }

    // 7. Test admin functions
    console.log('\n7️⃣ Testing admin detection functions...');
    
    // Test is_superadmin function
    const { data: isSuperAdmin, error: isSuperAdminError } = await supabase
      .rpc('is_superadmin', { user_email: userEmail });
    
    if (isSuperAdminError) {
      console.log(`❌ Error testing is_superadmin: ${isSuperAdminError.message}`);
    } else {
      console.log(`🔍 is_superadmin(${userEmail}): ${isSuperAdmin}`);
    }

    // Test is_super_admin function
    const { data: isSuperAdminNew, error: isSuperAdminNewError } = await supabase
      .rpc('is_super_admin', { checking_user_id: user.id });
    
    if (isSuperAdminNewError) {
      console.log(`❌ Error testing is_super_admin: ${isSuperAdminNewError.message}`);
    } else {
      console.log(`🔍 is_super_admin(${user.id}): ${isSuperAdminNew}`);
    }

    // Test is_admin function
    const { data: isAdmin, error: isAdminError } = await supabase
      .rpc('is_admin', { checking_user_id: user.id });
    
    if (isAdminError) {
      console.log(`❌ Error testing is_admin: ${isAdminError.message}`);
    } else {
      console.log(`🔍 is_admin(${user.id}): ${isAdmin}`);
    }

    // Test get_current_user_data function
    const { data: currentUserData, error: currentUserDataError } = await supabase
      .rpc('get_current_user_data');
    
    if (currentUserDataError) {
      console.log(`❌ Error testing get_current_user_data: ${currentUserDataError.message}`);
    } else {
      console.log(`🔍 get_current_user_data():`, currentUserData);
    }

    // 8. Summary and recommendations
    console.log('\n' + '=' .repeat(60));
    console.log('📋 SUMMARY & RECOMMENDATIONS');
    console.log('=' .repeat(60));

    const issues = [];
    
    if (buybidhqUser && buybidhqUser.role === 'admin') {
      issues.push('Legacy role field is set to "admin"');
    }
    
    if (superadminEntry) {
      issues.push('User exists in legacy superadmin table');
    }
    
    if (superAdminEntry) {
      issues.push('User exists in super_administrators table');
    }
    
    if (accountAdminEntries && accountAdminEntries.length > 0) {
      issues.push('User exists in account_administrators table');
    }

    if (issues.length === 0) {
      console.log('✅ No obvious admin access issues found.');
      console.log('   The user should not have admin access.');
    } else {
      console.log('🚨 ADMIN ACCESS ISSUES FOUND:');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      console.log('\n🔧 RECOMMENDED FIXES:');
      console.log('   1. Update buybidhq_users.role to "basic" or "individual"');
      console.log('   2. Remove user from legacy superadmin table (if exists)');
      console.log('   3. Remove user from super_administrators table (if exists)');
      console.log('   4. Remove user from account_administrators table (if exists)');
      console.log('   5. Ensure user_roles table has correct role assignments');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Get user email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Please provide a user email as an argument');
  console.error('Usage: node debug-admin-access.js <user_email>');
  process.exit(1);
}

debugUserAdminAccess(userEmail);
