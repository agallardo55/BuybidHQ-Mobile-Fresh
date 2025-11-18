# Permanent Documentation

This directory contains version-controlled, permanent documentation for the project.

## Structure

- **`/specs/`** - Technical specifications and core system documentation
- **`/prds/`** - Product requirements documents
- **`/architecture/`** - System design, data models, security practices, migration guides, deployment checklists
- **`/api/`** - API documentation, testing guides, feature documentation
- **Root** - General project documentation (README, QUICK_START, TODO)

## Files

### Root Level
- `README.md` - This file
- `QUICK_START.md` - Quick start guide for developers
- `TODO.md` - Project tracking and completed fixes

### `/specs/`
- `spec.md` - Main technical specification

### `/architecture/`
- `data-model.md` - Database schema and data model documentation
- `security-best-practices.md` - Security guidelines and practices
- `MIGRATION_INSTRUCTIONS.md` - Database migration procedures
- `DEPLOYMENT_CHECKLIST.md` - Deployment procedures and checklist
- `IMPROVEMENTS.md` - Code quality improvements and architectural changes

### `/api/`
- `stripe-testing-checklist.md` - Stripe integration testing checklist
- `stripe-e2e.md` - Stripe end-to-end testing guide
- `STRIPE_TESTING_GUIDE.md` - Comprehensive Stripe testing documentation
- `VIN_DECODER_DOCUMENTATION.md` - VIN decoder API documentation
- `VIN_TEST_RESULTS_TEMPLATE.md` - Template for VIN test results
- `VIN_DECODE_EDGE_CASE_TESTING.md` - VIN decoder edge case testing

## Workflow

- Check existing specs/PRDs before building features
- Reference relevant specs when implementing
- Update permanent docs if requirements change significantly
- All files in this directory are version controlled

