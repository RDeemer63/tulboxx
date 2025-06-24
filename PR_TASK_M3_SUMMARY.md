# Tulboxx CRM - M-3 Feature Flag Cleanup PR Summary

## Task Description
Feature flag cleanup (M-3): Mark deprecated feature flags and remove unnecessary toggle code

## Summary
This PR implements Task M-3 of the Legacy Code Archival project. It focuses on cleaning up the feature flag system by introducing a status field for feature flags, marking deprecated flags, and updating the feature flag handling logic to treat deprecated flags as always enabled.

The key components of this PR are:
1. Adding a `FeatureFlagStatus` enum to track the lifecycle of feature flags
2. Marking `NEW_LEADS_MODULE` and `MOBILE_OPTIMIZATIONS` as deprecated
3. Updating the `useFeatureFlag` hook to treat deprecated flags as always enabled
4. Removing `FeatureFlagGuard` components from the leads module pages
5. Documenting the deprecated flags for historical reference
