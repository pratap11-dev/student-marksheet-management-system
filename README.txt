# Student Marksheet Management System (No XAMPP)

## Run the project
1. Download and extract `student_marksheet_standalone.zip`.
2. Open the extracted folder in VS Code.
3. Open `index.html` in your browser (double-click it), or use the VS Code Live Server extension if you already have it.
4. Login as Admin:
   - Username: `admin`
   - Password: `admin123`
5. Add students and give each student a password.
6. Add subjects if required, enter marks, then select a student to view/print their marksheet.
7. Students can log in using their roll number and the password created by the admin.

## Features
- Admin and Student login screens
- Add, edit and delete students
- Add and delete subjects with maximum marks
- Enter/update marks
- Automatic percentage, grade and pass/pending status
- Student-only result view
- Print marksheet or save it as PDF from the browser
- Export/import JSON backup

## Important project limitation
This is a standalone front-end college demo. It uses the browser's `localStorage` for saving data. It does **not** use MySQL, PHP, XAMPP, or a server. Data stays in the same browser profile on the same computer. Login is for demonstration only and is not secure authentication. For a real multi-user system with shared data and secure accounts, a backend and database are required.

## Added in this version
- Class analytics (admin): average per subject, pass/fail/pending, grade distribution, top 5 students, KPI tiles.
- "Your performance" charts (student): own percentages and comparison with the class average.
- New background theme. Charts are plain SVG (charts.js), so they work offline with no libraries.
