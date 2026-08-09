# Test Data

Static JSON payloads and builders for UI and API tests.

## Guidelines

- Invoice billing fields per assessment example
- `payment_method`: `cash-on-delivery`, `payment_details`: `{}`
- Product IDs should be fetched at runtime from `GET /products` (in-stock items)
- Never hardcode production credentials in committed files

## Seeded Accounts (public SUT)

Document reference accounts here after confirming against live environment.
Load actual values from `.env` at runtime.
