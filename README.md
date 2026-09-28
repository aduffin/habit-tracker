

Readme · MD
# Habit Tracker
 
A personal habit tracker web app. Create an account, add the habits you want to build, check them off each day, and watch your progress on a weekly goal and a color-coded monthly calendar.
 
Built for ED2: Build a Web App with AI, using GitHub Copilot as a coding assistant.
 
- **Live app:** https://autumns-habit-tracker.netlify.app/login
- **Demo video:** 
## What the App Does
 
- **Accounts:** sign up, log in, and log out with email and password. Each user only ever sees their own habits.
- **Habits page:** create, view, edit, and delete habits. Each habit has a name, an optional description, a weekly goal (1–7 times per week), and a color. Deleting asks for confirmation, since it also removes that habit's history.
- **Dashboard (daily view):** check off habits for a given day. Move between days with Previous/Next and jump back with Today (you can't go past today). Each habit shows its progress for that week, like "2/3 this week," with a visual cue when the goal is reached.
- **Calendar:** a monthly grid showing a colored box for every habit completed on each day. Full Sunday–Saturday weeks are shown, including dimmed days from the neighboring months. Includes a legend, hover labels, previous/next month navigation, and a filter to view one habit or all.
## Technologies Used
 
| Technology | Purpose |
|---|---|
| **React** | Frontend user interface, built from reusable components |
| **Vite** | Development server and production build tool |
| **React Router** | Page navigation and protected routes |
| **Supabase** | PostgreSQL database and user authentication |
| **Netlify** | Hosting and deployment |
| **Plain CSS** | Styling, including a layout that adapts to phone screens |
| **GitHub Copilot** | AI coding assistant (Agent mode in VS Code) |
 
## Setup Instructions
 
To run your own copy locally:
 
### 1. Prerequisites
 
- [Node.js](https://nodejs.org) (LTS version; this project was built with Node 24)
- A free [Supabase](https://supabase.com) account
### 2. Clone and install
 
```bash
git clone https://github.com/YOUR-USERNAME/habit-tracker.git
cd habit-tracker
npm install
```
 
### 3. Set up the database
 
1. Create a new Supabase project.
2. Open the **SQL Editor**, paste in the contents of `supabase/schema.sql`, and click **Run**. This creates the `habits` and `completions` tables and their security rules.
3. Go to **Authentication → Sign In / Providers → Email** and turn off **Confirm email** (see Design Decisions below).
### 4. Add your Supabase settings
 
Copy `.env.example` to a new file named `.env` and fill in the values from Supabase (**Project Settings → API**):
 
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-publishable-or-anon-key
```
 
Use the **publishable** (or **anon**) key, never the secret/service_role key. The `.env` file is excluded from Git.
 
### 5. Run the app
 
```bash
npm run dev
```
 
Then open the address it prints (usually http://localhost:5173).
 
### Other commands
 
| Command | What it does |
|---|---|
| `npm run build` | Creates the production build in `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run test:dates` | Runs automated checks on the date logic |
 
### Deploying to Netlify
 
Connect the GitHub repo to Netlify with build command `npm run build` and publish directory `dist`. Add the environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, and `NODE_VERSION` (set to `24`). The `public/_redirects` file lets page refreshes work on routes like `/calendar`.
 
## Project Structure
 
```
habit-tracker/
├── public/
│   └── _redirects          # Sends all routes to index.html for React Router
├── scripts/
│   └── test-dates.mjs      # Automated date and calendar-grid checks
├── src/
│   ├── components/         # Reusable pieces
│   │   ├── AuthForm.jsx        # Shared email/password form for login and sign up
│   │   ├── NavigationBar.jsx   # Links and Log out button (logged-in users only)
│   │   ├── ProtectedRoute.jsx  # Redirects logged-out visitors to Log in
│   │   └── SetupNotice.jsx     # Setup help shown if Supabase settings are missing
│   ├── pages/              # Full screens
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx       # Daily check-off view
│   │   ├── Habits.jsx          # Habit list with edit and delete
│   │   ├── HabitForm.jsx       # Shared add/edit habit form
│   │   └── Calendar.jsx        # Monthly calendar view
│   ├── utils/
│   │   └── localDates.js       # Local date, week, and month-grid helpers
│   ├── App.jsx             # Session tracking and route table
│   ├── main.jsx            # App entry point
│   ├── supabaseClient.js   # Shared Supabase connection
│   └── index.css           # Styles
├── supabase/
│   └── schema.sql          # Database tables and security policies
├── .env.example            # Template for Supabase settings
├── SPEC.md                 # Project spec, decisions, and testing log
└── package.json            # Dependencies and npm scripts
```
 
## Database Design
 
The app uses two related tables in Supabase (PostgreSQL):
 
| Table | Fields |
|---|---|
| **habits** | id, user_id, name, description, weekly_goal (1–7), color, created_at |
| **completions** | id, habit_id, user_id, completed_on (date) |
 
- Each completion links to its habit through `habit_id`. Deleting a habit automatically deletes its completions.
- A habit can only be completed once per day (a unique rule on `habit_id` + `completed_on`).
- `completed_on` stores a plain date instead of a timestamp, so check-offs can't shift to the wrong day because of time zones.
- **Row Level Security (RLS)** is enabled on both tables. The database itself ensures each user can only read and change their own rows, and `user_id` is filled in automatically from the logged-in user.
## Design Decisions
 
- **Weeks start on Sunday.** This affects weekly progress and the calendar layout.
- **All dates use the user's local time zone, not UTC.** Otherwise, a habit checked off in the evening could be saved as the next day. This is verified by `npm run test:dates`.
- **Email confirmation is turned off.** Supabase's free email service is heavily rate-limited, which could block new users (including graders) from signing up. A production app would turn this on with a proper email provider.
- **Colors come from 8 preset options** so habits stay easy to tell apart on the calendar.
- **Managing habits and checking them off are on separate pages** (Habits and Dashboard), so the daily view stays simple.
## How AI Was Used
 
The code was written with GitHub Copilot in Agent mode, with me directing, reviewing, and testing each step:
 - **Planned first.** I wrote `SPEC.md` before any code and had Copilot read it at the start of every prompt. I also planned all the project steps with Claude and asked it to explain terms I didn't understand along the way.
- **Built in small steps.** Each prompt covered one feature (login, then page structure, then habits, then the daily view, then the calendar) with clear limits on what not to change.
- **Reviewed the output.** For example, I noticed the first version put all pages in `App.jsx` and had it reorganized into pages and components before adding features.
- **Tested everything.** After each step, I tested the app manually (recorded in the Testing Log in `SPEC.md`) and committed only once it worked. For the riskiest logic, the date handling, I had Copilot write automated tests proving the time zone bug was avoided.
## Known Issues
 
- **"JWT issued at future" error:** Supabase occasionally returns this due to clock differences between its own servers. Refreshing the page resolves it.
- **Bundle size warning:** Vite warns that the JavaScript bundle is over 500 KB, mostly from React and the Supabase library. The app still loads quickly at this size.
## Author
 
Autumn Duffin
 

