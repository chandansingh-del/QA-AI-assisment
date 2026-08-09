# Manual Test Execution Log

**Date:** 9 August 2026  
**SUT:** https://practicesoftwaretesting.com/  
**Manual cases:** `FunctionalTestCase.csv` (TC-MAN-001 … TC-MAN-008)

---

## Summary

| TC ID | Status | Evidence type | Reference |
|-------|--------|---------------|-----------|
| TC-MAN-001 | Passed | Automation-backed | `PrismStructure/tests/ui/smoke/registration-profile.spec.js` |
| TC-MAN-002 | Passed | Automation-backed | `PrismStructure/tests/ui/smoke/checkout-invoice.spec.js` |
| TC-MAN-003 | Passed | Automation-backed | `PrismStructure/tests/ui/regression/invalid-login.spec.js` |
| TC-MAN-004 | Passed | Automation-backed | `PrismStructure/tests/ui/regression/registration-validation.spec.js` |
| TC-MAN-005 | Passed | Automation-backed | `PrismStructure/tests/ui/regression/single-confirm-no-invoice.spec.js` |
| TC-MAN-006 | Passed | Automation-backed | `PrismStructure/tests/ui/regression/empty-cart-checkout.spec.js` |
| TC-MAN-007 | Passed | Manual screenshots | `2026-08-09_TC-MAN-007_*.png` |
| TC-MAN-008 | Passed | Manual screenshots | `2026-08-09_TC-MAN-008_*.png` |

---

## TC-MAN-001 … TC-MAN-006 (automation-backed)

These manual cases map 1:1 to passing UI automation specs executed on 9 August 2026 (14/14 suite pass — see `EXECUTION-SUMMARY.md`). Steps and expected results in the CSV were satisfied by the automated flows; no separate human walkthrough was recorded beyond the automation run.

---

## TC-MAN-007 — Out-of-stock add-to-cart blocked

**Capture command:** `node scripts/capture-manual-evidence.js` (from `PrismStructure/`)

**Evidence files:**

- `2026-08-09_TC-MAN-007_oos-product-detail.png` — Long Nose Pliers detail shows Out of Stock; Add to Cart disabled
- `2026-08-09_TC-MAN-007_cart-after-oos-attempt.png` — Cart does not contain the OOS product

---

## TC-MAN-008 — Logout clears session

**Capture command:** same script as TC-MAN-007

**Evidence files:**

- `2026-08-09_TC-MAN-008_profile-before-logout.png` — Profile accessible while logged in
- `2026-08-09_TC-MAN-008_profile-after-logout.png` — `/account/profile` redirects to login
- `2026-08-09_TC-MAN-008_invoices-after-logout.png` — `/account/invoices` redirects to login

---

## Credentials

Seeded customer credentials are loaded from `PrismStructure/.env` (see `.env.example`). Passwords are not stored in this log or in `FunctionalTestCase.csv`.
