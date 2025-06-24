# Archived Code - Tulboxx CRM

## Purpose

This directory, `archived/`, contains legacy code from the Tulboxx CRM project. The code stored here is no longer actively used, maintained, or considered part of the current operational codebase.

## Reason for Archiving

Code is moved to this directory for several reasons, including:

*   **Refactoring Efforts**: As the codebase evolves, older implementations are replaced with newer, more efficient, or better-structured code.
*   **Feature Deprecation**: Features that are no longer supported or have been removed from the application.
*   **System Upgrades**: Components replaced by entirely new systems or architectural patterns (e.g., migration from a legacy estimate system to a modern one).

## Status of Archived Code

Please be aware of the following regarding the contents of this directory:

*   **Not Actively Maintained**: The code here does not receive updates, bug fixes, or security patches.
*   **Not Part of Production**: This code is excluded from current development, testing, and production builds.
*   **Potential Issues**: Archived code may contain known (or unknown) bugs, security vulnerabilities, outdated dependencies, or rely on deprecated APIs.
*   **Do Not Use Directly**: This code should **not** be directly imported, referenced, or relied upon by any new or active parts of the Tulboxx application.

## Intended Use

The primary purposes for retaining this archived code are:

*   **Historical Reference**: To understand past design decisions, feature implementations, or architectural choices.
*   **Knowledge Preservation**: To serve as a reference for how certain problems were solved previously.
*   **Selective Logic Extraction (with extreme caution)**: In rare cases, specific algorithms or business logic might be reviewed for potential adaptation into new systems. Any such reuse must be done with thorough review, refactoring, and testing.

## Structure

The directory structure within `archived/` (e.g., `archived/server/`, `archived/client/`) aims to mirror the original location of the files in the main project. This is done to provide context and make it easier to understand where the code originated.

## Caution

Developers should exercise extreme caution when interacting with code in this directory. If you need to understand or potentially adapt any logic from here:

1.  Consult project documentation or senior team members to understand the context and reasons for archiving.
2.  Thoroughly review and understand the code before considering any form of reuse.
3.  Assume that any code extracted will need significant refactoring, updating, and testing to meet current standards and requirements.

**It is strongly recommended to rewrite logic based on current best practices rather than directly reusing archived code.**

---

This archive helps keep the main codebase clean and focused on current development while preserving historical context.
