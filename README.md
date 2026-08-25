# STR Welcome Display

A full-screen guest welcome portal for an STR. It provides:

- Personalized guest name, occasion, message, and stay dates
- Automated Walt Disney World park hours and entertainment from ThemeParks.wiki
- House Wi-Fi, checkout time, assistance instructions, and house-guide QR code
- A private admin page for the owner or property manager
- Cloudflare Pages Functions and Workers KV storage
- Automatic display refresh every five minutes

## Important limitation

ThemeParks.wiki is an unofficial, best-effort data source. The screen includes a notice asking guests to confirm hours and schedules in Disney's official app.

---

# Part 1 — Deploy the project

## Recommended deployment method

Use a GitHub-connected Cloudflare Pages project. This is more reliable for a Pages project containing Functions than casual drag-and-drop uploads, and it makes future updates much easier.

### Step 1: Create a GitHub repository

1. Sign in to GitHub.
2. Create a new private repository named `str-welcome-display`.
3. Unzip this package.
4. Upload the **contents inside** the `str-welcome-display` folder to the repository.
5. Confirm the repository root contains:
   - `public`
   - `functions`
   - `_headers`
   - `README.md`

Do not upload one extra containing folder above those files.

### Step 2: Create the Cloudflare Pages project

1. Sign in to Cloudflare.
2. Open **Workers & Pages**.
3. Select **Create application**.
4. Select **Pages** and connect to Git.
5. Choose your `str-welcome-display` repository.
6. Use these deployment settings:
   - Framework preset: **None**
   - Build command: leave blank
   - Build output directory: `public`
   - Root directory: leave blank
7. Deploy.

Cloudflare will give you a URL similar to:

`https://str-welcome-display.pages.dev`

The public display will load immediately, but saving admin settings will not work until the KV binding and password are added.

---

# Part 2 — Create the settings database

## Step 3: Create a Workers KV namespace

1. In Cloudflare, open **Storage & Databases** or **Workers KV**.
2. Create a namespace named:
   `STR_WELCOME_SETTINGS`

## Step 4: Bind KV to the Pages project

1. Return to **Workers & Pages**.
2. Open the Pages project.
3. Open **Settings**.
4. Find **Bindings**.
5. Add a **KV namespace** binding.
6. Variable name must be exactly:
   `STR_SETTINGS`
7. Select the `STR_WELCOME_SETTINGS` namespace.
8. Save.
9. Redeploy the latest deployment.

The spelling and capitalization of `STR_SETTINGS` must match exactly.

---

# Part 3 — Add the admin password

## Step 5: Create the secret

1. Open the Pages project.
2. Go to **Settings → Variables and Secrets**.
3. Add a secret:
   - Name: `ADMIN_TOKEN`
   - Value: create a long password, ideally at least 20 characters.
4. Apply it to Production.
5. Save.
6. Redeploy the latest deployment.

Do not place this password in any JavaScript file.

## Step 6: Test the admin page

Visit:

`https://YOUR-PROJECT.pages.dev/admin.html`

1. Enter the `ADMIN_TOKEN` password.
2. Select **Load current settings**.
3. Enter a test guest name and house information.
4. Select **Publish to display**.
5. Open the public root URL in another browser tab.
6. Refresh it and confirm the changes appear.

The deployed display also refreshes itself every five minutes.

Give your property manager the admin URL and password. For stronger individual access later, protect `/admin.html` with Cloudflare Access and give each person a separate email-based login.

---

# Part 4 — Connect it to OptiSigns

1. In OptiSigns, open **Assets**.
2. Select **Add Asset → Apps → Website**.
3. Name it `STR Guest Welcome`.
4. Paste the public root URL:
   `https://YOUR-PROJECT.pages.dev/`
5. Set it to full-screen.
6. Use a refresh interval such as 30 minutes. The webpage itself updates its data every five minutes, so OptiSigns does not need to reload constantly.
7. Assign the asset to the LG display.
8. Preview it on the actual display before the first guest.

Do **not** use `/admin.html` as the OptiSigns URL.

---

# Part 5 — Normal operating workflow

Before each check-in:

1. Open `/admin.html` on your phone or computer.
2. Enter the admin password.
3. Select **Load current settings**.
4. Update:
   - Guest display name
   - Occasion
   - Welcome message
   - Check-in and checkout dates
   - Theme
5. Select **Publish to display**.
6. Open the public display URL to preview it.

After checkout:

1. Replace the guest name with a neutral message such as `Welcome to Your Orlando Vacation`.
2. Remove the occasion.
3. Publish again.

Avoid displaying a guest's full legal name. A first name or family display name is safer.

---

# Troubleshooting

## The admin page says “Unauthorized”

- Confirm the password matches the `ADMIN_TOKEN` secret.
- Confirm the secret exists in the Production environment.
- Redeploy after adding or changing the secret.

## Publish fails with a server error

- Confirm a KV binding named exactly `STR_SETTINGS` exists.
- Confirm it is bound to the Production environment.
- Redeploy after adding the binding.

## Disney park schedules do not appear

- Open `/api/parks` in a browser.
- It should return JSON containing `parks`.
- ThemeParks.wiki may be temporarily unavailable or may have changed its schema.
- The public display intentionally shows a safe fallback rather than a blank page.

## The page works on a computer but not OptiSigns

- Confirm the URL starts with `https://`.
- Use the normal OptiSigns Website app.
- Confirm the signage player can access the internet.
- Test the exact public URL in a regular browser on the same network.

## QR code does not load

The starter uses QuickChart's public QR image endpoint. For a completely self-contained display, replace it later with a bundled QR-generation library or a static QR image.

---

# Files you are most likely to customize

- `public/styles.css`: colors, spacing, and visual theme
- `public/index.html`: display layout
- `public/display.js`: slide behavior and content rendering
- `functions/api/parks.js`: Disney API transformation
- `public/admin.html`: fields shown to you and the manager

