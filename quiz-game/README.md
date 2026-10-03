# SkillCraft Quiz (Task 03)

A quiz game with a login page, built with plain HTML, CSS and JavaScript. No backend and no build step.

## Features
- Login and create-account pages with form validation, show/hide password, "keep me signed in" and guest mode
- Protected quiz page: logged-out visitors are sent back to the login page
- 10 questions in 3 types: single choice, multi select and fill in the blank (shuffled each round)
- Live score, round timer, per-question progress bar, instant right/wrong feedback
- Result screen with animated score ring, accuracy, time taken and a saved personal best
- Keyboard support (keys 1 to 4 pick an option, Enter continues) and a responsive layout

## Files
| File | Purpose |
| --- | --- |
| index.html, auth.js | Login and create-account page |
| quiz.html, script.js | Quiz game |
| style.css | Shared theme |

## Run it
Open `index.html` in a browser, or publish with GitHub Pages (Settings > Pages > Deploy from branch > `main` / root).

Accounts are stored in the browser's localStorage, so this is a frontend demo and not production authentication.

Built for SkillCraft Technology, Task 03.
