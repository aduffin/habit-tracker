# Habit Tracker Spec

Description: A personal habit tracker where users create an account, add habits they want to build, and check them off each day. Each habit has a weekly goal and a color, and the app shows weekly progress and a monthly calendar of completed days.

## Data

- **Habit:** name, description (optional), weekly goal (times per week), color, owner (user)
- **Completion:** which habit, date completed

## Pages

- **Register / Log in:** create an account or sign in with email and password.
- **Dashboard (day view):** shows one day at a time, starting on today. All my habits with a checkbox for that day, and weekly progress for that day's week (e.g. "2/3 this week"). Previous/next day buttons and a "Today" button. Can't navigate or check off past today.
- **Add / Edit habit form:** set a habit's name, description, weekly goal, and color
- **Calendar:** monthly grid with colored boxes for each habit completed on each day; previous/next month buttons; filter to show one habit or all. 

## Login

**Required**. Habits are personal, so each user only sees their own.

## Decisions

- **Weeks start on Sunday.** Affects weekly progress counts and the calendar layout.
- **Email confirmation is turned off.** Supabase's free email service is heavily rate-limited, which could block new users (including graders) from signing up. A production app would turn this on with a proper email provider.
- **Row Level Security (RLS) is enabled on all tables.** Each user can only read and change their own habits and completions.

## Testing Log

### Authentication (tested and passes):
- Sign up creates a user in Supabase and goes to the dashboard
- Log out returns to the login page
- Log in with correct credentials works
- Wrong password shows an error
- Logged-out users are redirected away from the dashboard

### Navigation

- Navbar shows only when logged in
- Dashboard and Calendar links work
- Log out from navbar returns to Login
- Logged-out users are redirected away from Calendar