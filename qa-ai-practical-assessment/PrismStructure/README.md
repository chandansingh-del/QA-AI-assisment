# PrismStructure

Playwright automation scaffold for UI + API testing (Prism-style Page Object Model).

## Folder Layout

```
PrismStructure/
├── playwright.config.js    # Playwright configuration (placeholder)
├── package.json            # Dependencies and npm scripts
├── .env.example            # Environment variable template
├── fixtures/               # Custom Playwright fixtures (auth, pages)
├── pages/                  # Page objects (UI)
│   └── components/         # Reusable UI components
├── tests/
│   ├── ui/                 # UI specs (@smoke, @regression)
│   └── api/                # API specs
├── utils/                  # Pure helpers (no Playwright imports)
├── test-data/              # Static payloads and data builders
├── playwright-report/      # Generated HTML reports (gitignored)
└── test-results/           # Traces, screenshots (gitignored)
```

## Conventions

- **Page objects** expose locators and user actions; avoid assertions unless page-state checks
- **Specs** contain test logic, tags, and assertions
- **Fixtures** inject authenticated sessions and page objects
- **API tests** use `request` fixture against documented OpenAPI endpoints only

## Status

> Scaffold only — tests, page objects, and config values to be implemented in next phase.
