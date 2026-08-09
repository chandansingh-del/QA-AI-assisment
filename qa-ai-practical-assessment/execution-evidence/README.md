# Execution Evidence

Store test execution artifacts here:

- Playwright HTML report exports (or screenshots)
- Failed test traces / screenshots
- API response logs (redact tokens)
- Manual test execution notes

## Naming Convention

```
YYYY-MM-DD_<suite>_<browser>_<result>.png
YYYY-MM-DD_playwright-report/
```

Do not commit secrets, bearer tokens, or full `.env` files.
