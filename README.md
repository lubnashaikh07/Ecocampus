# EcoCampus — TY BScIT Project

EcoCampus is a front-end campus sustainability project built with HTML, CSS, JavaScript, and browser `localStorage`. It includes student registration/login, an admin dashboard, eco challenges, points, badges, a leaderboard, and profile management.

## Files
All files must remain in the same folder:
- `index.html` — login
- `register.html` — student registration
- `student-dashboard.html` — student overview
- `admin-dashboard.html` — manage challenges and view student participation
- `challenges.html` — search, filter, and complete challenges
- `leaderboard.html` — points ranking
- `profile.html` — edit profile and view badges
- `style.css` — responsive styling
- `app.js` — login, state, points, badges, and localStorage logic

## Run the project
1. Extract the ZIP.
2. Keep all 9 project files together inside the `EcoCampus` folder.
3. Open `index.html` in a modern browser. For the best experience, use VS Code with the **Live Server** extension and choose **Open with Live Server**.
4. Register a student account, or use the demo admin account below.

## Demo admin login
- Email: `admin@ecocampus.com`
- Password: `admin123`

## Student workflow
1. Select **Register** and create a student account.
2. Login to open the student dashboard.
3. Open **Challenges**, search or filter by category, then mark a challenge complete.
4. Points, completed challenges, badges, and rank update based on the stored data.
5. Use **Profile** to update the name/college or delete the student account.

## Admin workflow
1. Login with the demo admin account.
2. Create a challenge using its title, description, point value, and category.
3. Use **Edit** to modify a challenge and **Delete** to remove it.
4. Review student counts, completions, points, and leaderboard standings.

## Extra features
- Use the **Dark mode / Light mode** toggle in the top navigation. Your choice is saved in localStorage.
- The student dashboard displays a daily eco tip and a progress bar for the seven starter challenges.
- The leaderboard export downloads a CSV file that can be opened in Excel or Google Sheets.

## Storage and limitations
- The app uses browser `localStorage`; it does not need a database or server.
- Data is saved only in the browser profile/device that is being used. It will not automatically sync between devices or browsers.
- This is a college-project demo, not a production authentication system. Passwords are stored locally in plain text; do not use real or sensitive passwords.
- The demo admin account is created automatically the first time the app runs in a browser.
- To reset the demo data, clear this site's local storage in browser developer tools. This removes local student accounts and challenge progress.

## Technologies
HTML5 · CSS3 · Vanilla JavaScript · localStorage


## KPI photo proof verification
- Students open **Eco challenges**, choose a task, select a photo, preview it, then submit it for review.
- Submissions appear in **Admin dashboard → KPI proof review** with the student name, student ID, task ID, timestamp and image.
- Admins can approve a proof or reject it with a reason. Rejected tasks can be resubmitted.
- Only approved proof submissions count as completed and earn challenge points. Pending submissions cannot be submitted repeatedly.
- For this browser-only demo, images are stored as data URLs in `localStorage`; images are limited to 1.5 MB to reduce storage problems. Browser storage is local to that browser/device and is not shared between different users/devices. Use a backend and file storage for a real multi-user deployment.
