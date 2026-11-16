# Safe code generator

Run `npm install` once, then `npm run dev`. Run `npm test` and `npm run build`
to check the application.

## GitHub Pages

The Vite build uses `/number-generator/` as its base path for the GitHub Pages
project site. Push to `main` to build and deploy it using GitHub Actions, with
the Pages source set to **GitHub Actions** in the repository settings.

## Safe setup

The application opens in admin mode. On first use, the default safe code is
**1996**; check that the physical safe matches before returning to the game.
An existing saved code is never overwritten by the default.

Enter the existing four-digit safe combination, or generate a new one and
program the physical safe to match. Confirm the code before it is saved.
Ctrl + A or **Return to game** closes admin; Ctrl + A on the idle screen opens
it again. The current code is masked on every admin entry.

The confirmed code is stored in this browser's local storage on this device.
Clearing browser/site data removes it, restoring the default on the next launch.
Admin access is not PIN-protected, and
local storage is not secure against someone with device access.

Each play independently has a 1% chance of revealing the configured safe code;
all other plays generate a different four-digit code. **There is no maximum
winner allocation**, so this mode cannot guarantee a limited prize count.
Each device operates independently.

This prototype is not yet a PWA: it has no service worker or offline
installation. Test on the target iPad and physical button before an event.
