# Project guidance

## Site structure

- This is a static website. Edit `Second Chance Toy Repair.html` as the source page.
- Keep the logo, portrait, and restoration photos in the repository root; add new restoration photos to `build.sh` so they are included in the deployed `dist/` assets.
- The site is hosted on Cloudflare using Workers Static Assets. `wrangler.toml` runs `./build.sh` before deploy and serves the resulting `dist/` directory. The Workers Builds deploy command is `npx wrangler deploy`.

## Website changes

- Keep the layout usable at phone widths from 320px, tablet widths, and desktop widths.
- Preserve readable contrast, visible keyboard focus, associated form labels, and correct expanded/hidden/pressed states for interactive controls.
- Respect `prefers-reduced-motion` when adding animations or transitions.
- The contact form posts to the same-origin `/api/contact` Worker endpoint, which sends to `demi@scaddenfamily.com`. Keep the recipient fixed, use the toy name/description as the subject, and set the visitor's email as reply-to.
- `src/index.js` handles API requests and passes all other paths through the `ASSETS` binding. The `EMAIL` send binding is restricted to the fixed recipient and the verified `contact@dogearedplush.com` sender.

## Saving work

- When the user explicitly says “save” about project work, stage the intended changes, create a descriptive Git commit, and push it to `origin/main` without asking again.
- Verify that the push succeeded and report the commit.
- Do not commit or push unrelated changes.
