// ============================================================
// ClassBoard — auth
// Roles are stored in the `profiles` table (id, full_name, role).
// role is one of: "teacher" | "student"
// ============================================================

async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

async function getProfile() {
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

// Redirect to login if not authenticated. Call at the top of protected pages.
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return await getProfile();
}

// Redirect non-teachers away from teacher-only pages.
async function requireTeacher() {
  const profile = await requireAuth();
  if (profile && profile.role !== "teacher") {
    showToast("Teachers only — redirecting.", "error");
    setTimeout(() => (window.location.href = "dashboard.html"), 1200);
    return null;
  }
  return profile;
}

async function signUp({ fullName, email, password, role, rollNumber }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // Create the matching profile row. If email confirmation is required,
  // this still works because Supabase issues a user id immediately.
  const userId = data.user?.id;
  if (userId) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      role,
      roll_number: rollNumber || null,
    });
    if (profileError) throw profileError;
  }
  return data;
}

async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

// Renders the user chip in the topbar. Call on every protected page.
async function renderUserChip(profile) {
  const chip = document.getElementById("user-chip");
  if (!chip || !profile) return;
  const initials = (profile.full_name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  chip.innerHTML = `
    <div class="avatar">${initials}</div>
    <div>
      <div>${escapeHtml(profile.full_name || "Unnamed")}</div>
      <div class="role-tag">${profile.role}</div>
    </div>
  `;
  chip.style.cursor = "pointer";
  chip.title = "Sign out";
  chip.addEventListener("click", signOut);
}
