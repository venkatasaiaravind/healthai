# HealthAI Security Specification

## Data Invariants
1. A **User Profile** must belong to the authenticated user (`uid` matches `request.auth.uid`).
2. **Food Logs** can only be created and read by the owner.
3. **Orders** are immutable once placed, except for status updates (admin only).
4. **Products** are publicly readable but only writable by admins.
5. **Chat Sessions** are private to the user.

## The "Dirty Dozen" Payloads (Threat Models)
1. **Identity Spoofing**: User A trying to update User B's profile.
2. **Privilege Escalation**: User trying to set `role: 'admin'` in their own document.
3. **Ghost Fields**: Adding `isVerified: true` to a product write.
4. **ID Poisoning**: Using a 2KB string as a `productId`.
5. **Orphaned Writes**: Creating a food log for a non-existent user.
6. **Resource Exhaustion**: Sending a 1MB string in `foodName`.
7. **Bypassing Health Scoring**: Manually setting a high `healthScore` on a product.
8. **Stale Data Attack**: Overwriting `updatedAt` with a past timestamp.
9. **Relational Sync Break**: Deleting an order item without updating total.
10. **Unauthorized List Query**: Scraping all users without a filter.
11. **Terminal State Bypass**: Changing a 'delivered' order back to 'pending'.
12. **PII Leak**: Reading private user emails from a public list.

## Test Runner (Logic Overview)
Tests will be implemented in `firestore.rules.test.ts` to verify these protections.
