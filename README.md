# STR Welcome Display — Worker-native

Use this version with your current Cloudflare Worker deployment.

Repository root must contain:
- public/
- src/
- package.json
- wrangler.jsonc

Cloudflare build settings:
- Build command: npm install
- Deploy command: npx wrangler deploy

Bindings:
- KV namespace binding: STR_SETTINGS
- Secret: ADMIN_TOKEN

Test:
- /api/parks
- /api/settings
- /admin.html
