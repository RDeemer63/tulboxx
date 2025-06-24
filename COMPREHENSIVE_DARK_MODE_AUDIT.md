# TULBOXX Dark Mode Comprehensive Audit & Fix Plan

## Current Issues Identified
1. **Inconsistent Component Styling**: Card backgrounds still showing tan/brown instead of proper dark themes
2. **Pink Icon Colors**: Search icons and other UI elements showing pink instead of proper gray/slate
3. **Text Color Mismatches**: Headers, labels, and content text not properly themed
4. **Architecture Issues**: Manual className overrides instead of systematic theme implementation

## Root Cause Analysis

### 1. CSS Variables Not Properly Defined
- Missing comprehensive CSS variable system
- Inconsistent color naming conventions
- No centralized theme token management

### 2. Component-Level Issues
- Base UI components not using theme-aware variables
- Manual className overrides creating inconsistencies
- Missing dark mode variants in component definitions

### 3. Application-Level Problems
- Pages relying on manual dark mode classes
- No systematic component theming approach
- Inconsistent icon and text color management

## Systematic Fix Plan

### Phase 1: Foundation - CSS Variables & Theme System
1. Update `client/src/index.css` with comprehensive CSS variables
2. Ensure all colors use HSL format for consistency
3. Define semantic color tokens (primary, secondary, surface, etc.)

### Phase 2: Base UI Components
1. Update Card component to use proper theme variables
2. Fix Input component styling with consistent theming
3. Update Select components for proper dark mode support
4. Standardize Button, Badge, and other core components

### Phase 3: Icon & Typography System
1. Create consistent icon color system
2. Standardize text hierarchy with proper contrast
3. Fix pink icon issues systematically

### Phase 4: Application Pages
1. Remove manual className overrides
2. Use consistent component patterns
3. Validate all pages follow design system

### Phase 5: Testing & Validation
1. Test theme switching functionality
2. Validate accessibility compliance
3. Ensure visual consistency across all pages

## Success Criteria
- All pages display consistent dark mode styling
- No pink or miscolored icons
- Proper text contrast ratios maintained
- Professional TULBOXX industrial theme preserved
- Theme switching works seamlessly