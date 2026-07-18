# ClassBoard

Smart classroom file sharing & learning platform. This is the **v1 core**:
login (teacher/student), dashboard, subjects, file upload/download, and
announcements — built as suggested in the original plan (auth → dashboard →
upload/download → subjects → announcements first, everything else later).

Plain HTML/CSS/JS + [Supabase](https://supabase.com) (auth, database, file
storage). No build step required.

```
ClassBoard/
├── index.html            landing → redirects to login or dashboard
├── login.html             sign in / create account
├── dashboard.html         stats, subjects, pinned announcements, recent uploads
├── subject.html           file list + search for one subject
├── upload.html            teacher-only upload
├── announcements.html     announcement feed + post form (teachers)
├── css/style.css          shared theme (dark glass, blue gradient)
├── js/
│   ├── supabaseClient.js  ← put your Supabase URL + anon key here
│   ├── utils.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── subject.js
│   ├── upload.js
│   └── announcements.js
├── server.js              tiny static server (for Node hosting like Wispbyte)
└── package.json
```

---

## 1. Set up Supabase (free)

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Open **SQL Editor** and run this to create the schema:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('teacher','student')) not null default 'student',
  roll_number text,
  created_at timestamptz default now()
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade,
  name text not null,
  path text not null,
  size bigint,
  chapter text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- seed a few subjects to start
insert into subjects (name) values
  ('Physics'), ('Chemistry'), ('Mathematics'),
  ('English'), ('Computer Science'), ('Biology');
```

3. Enable Row Level Security and add basic policies (recommended before
   this goes anywhere near real students — the client-side "teacher only"
   checks in this app are UX only, not security):

```sql
alter table profiles enable row level security;
alter table subjects enable row level security;
alter table files enable row level security;
alter table announcements enable row level security;

-- anyone signed in can read everything
create policy "read all - profiles" on profiles for select using (auth.uid() is not null);
create policy "read all - subjects" on subjects for select using (auth.uid() is not null);
create policy "read all - files" on files for select using (auth.uid() is not null);
create policy "read all - announcements" on announcements for select using (auth.uid() is not null);

-- users can create their own profile row on signup
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

-- only teachers can write files/announcements
create policy "teachers insert files" on files for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'teacher'));
create policy "teachers delete files" on files for delete
  using (exists (select 1 from profiles where id = auth.uid() and role = 'teacher'));
create policy "teachers insert announcements" on announcements for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'teacher'));
```

4. Go to **Storage** → create a bucket named `classboard-files` → make it
   **public** (simplest for v1; switch to private + signed URLs later if
   you need stricter access control).
   Add a storage policy allowing signed-in users to upload:

```sql
create policy "teachers upload files"
  on storage.objects for insert
  with check (
    bucket_id = 'classboard-files'
    and exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
  );
create policy "anyone reads files"
  on storage.objects for select
  using (bucket_id = 'classboard-files');
```

5. Go to **Project Settings → API** and copy your **Project URL** and
   **anon public key**.

6. Paste them into `js/supabaseClient.js`:

```js
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

7. If your Supabase project has "Confirm email" turned on, either turn it
   off for testing (Authentication → Providers → Email) or check the inbox
   after signing up before signing in.

## 2. Try it locally

No build step — just serve the folder so `fetch` calls behave normally:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Open the local URL, create a teacher account, then a student account, sign
in as the teacher, and upload a file to a subject.

## 3. Deploy to Wispbyte

Wispbyte hosts Node.js applications, which is what `server.js` here is for
— it just serves these static files on whatever port Wispbyte assigns.

1. Sign up at [wispbyte.com](https://wispbyte.com) and go to your dashboard.
2. Create a new server/application and choose the **Node.js** option
   (sometimes listed under "Application" or "Website" hosting rather than
   the Discord-bot-specific ones).
3. Upload the contents of this `ClassBoard/` folder using the panel's file
   manager (or connect a GitHub repo if Wispbyte offers that for your
   plan) — upload everything, including `server.js` and `package.json`.
4. In the server's **Startup** settings, set:
   - **Startup command:** `node server.js`
   - Wispbyte will inject a `PORT` environment variable automatically;
     `server.js` already reads `process.env.PORT`, so you shouldn't need
     to change anything.
5. Open the server console and run `npm install` (or use the panel's
   "Install"/"Build" button if it runs this for you) so `express` gets
   installed.
6. Start the server. Wispbyte will give you a URL/port to reach it at —
   that's your live ClassBoard.
7. Because this app talks to Supabase directly from the browser, there's
   nothing else to configure server-side — just make sure
   `js/supabaseClient.js` has your real project values before you deploy
   (or re-upload that one file after editing it).

If your Wispbyte plan only supports specific "eggs" (Discord bot, Minecraft,
etc.) and no generic Node/website option, look for one labeled **Node.js**,
**Generic**, or **Application** — that's the one this project needs.

## 4. What's built vs. what's next

**Built:** teacher/student auth, dashboard with live stats, subjects,
per-subject file search, drag-and-drop upload, delete, download,
announcements feed + posting.

**Not built yet** (from the original wishlist — add incrementally):
timetable, attendance, admin panel (add/remove teachers & students from a
UI instead of the database), favorites/bookmarks, notifications, file
previews, dark/light toggle, multiple classrooms. The database schema
above is deliberately simple so each of these can be added as its own
table + page without reworking what's here.
