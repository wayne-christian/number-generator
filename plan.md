# Exhibition preparation plan

## 1. Confirm decisions and requirements

- Review the original exhibition brief and confirm its requirements; it is not currently in the repository.
- Set the prize limit and how winners should be distributed. The current 1% chance has no cap.
- Confirm what counts as a play if the app is interrupted after recording it but before showing the result.
- Confirm the approved University logo, colours, and assets.
- Decide which event details reports should include and how events should be identified.

## 2. Add event management and reliable records

- Add event details and start, pause, resume, end, and confirmed-reset controls.
- Store event progress and play/winner counts in IndexedDB.
- Record each play and reserve any winner allocation before animation, so a restart cannot award the same reserved prize again.
- Add a test experience that does not change event statistics.
- Add configuration import/export and CSV/JSON reports.
- Display a warning that each iPad operates independently.

## 3. Implement prize limits and admin protection

- Implement the agreed winner-limit and distribution rules, with tests for the cap and edge cases.
- Require a PIN before revealing the safe code and automatically exit admin after inactivity.
- Treat a client-side PIN as a deterrent, not strong security: someone with access to the iPad or browser data may still bypass it.
- Test keyboard and touch flows, including accidental exit and re-entry.

## 4. Finish the experience

- Add activation and optional spinning sounds, plus sound and volume controls.
- Make animation timing, result duration, and message configurable.
- Add a discreet early reset for staff.
- Apply the approved branding and assets.

## 5. Prepare for deployment and offline use

- Add a manifest, app icons, Apple touch icon, and service worker.
- Configure and deploy GitHub Pages; test the published build, not only the local development server.
- Install the app on the target iPad and verify every screen, font, image, and sound in Airplane Mode.
- Confirm the physical safe's combination matches the app before the event. A fresh installation currently defaults to `1996`.

## 6. Validate the event setup

- Expand automated tests around event persistence, interruptions, winner limits, admin timeouts, import/export, and offline asset availability.
- Run a simulated event of at least **200 plays**, checking that recorded totals, winner totals, and reports agree.
- Test the physical button, HID keyboard input, USB-C connection, Guided Access, sleep/wake, and restart on the actual iPad.

## Suggested order

Confirm the prize policy and event-recording rules first. Then build event persistence and prize limits, followed by admin protection and finishing features. Add PWA support before deployment and iPad testing.

GitHub Pages deployment and physical testing require access to the relevant GitHub settings and the target device.
