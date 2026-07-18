// ============================================================
// ClassBoard — announcements page logic
// ============================================================

let currentProfile = null;

(async () => {
  const profile = await requireAuth();
  if (!profile) return;
  currentProfile = profile;
  renderUserChip(profile);

  if (profile.role === "teacher") {
    document.getElementById("nav-upload").style.display = "inline-block";
    document.getElementById("new-announce-form").style.display = "block";
  }

  await loadAnnouncements();
})();

async function loadAnnouncements() {
  const el = document.getElementById("announce-list");
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    el.innerHTML = `<div class="empty-state">Couldn't load announcements. Check your Supabase setup.</div>`;
    return;
  }
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="icon">📌</div>No announcements yet.</div>`;
    return;
  }

  el.innerHTML = data
    .map(
      (a) => `
      <div class="card announce-card">
        <div class="announce-pin">📌</div>
        <div class="announce-body">
          <div class="announce-title">${escapeHtml(a.title)}</div>
          <div class="announce-text">${escapeHtml(a.body)}</div>
          <div class="announce-time">${timeAgo(a.created_at)}</div>
        </div>
      </div>`
    )
    .join("");
}

document.getElementById("new-announce-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("an-title").value.trim();
  const body = document.getElementById("an-body").value.trim();
  if (!title || !body) return;

  const { error } = await supabase.from("announcements").insert({
    title,
    body,
    created_by: currentProfile.id,
  });

  if (error) {
    showToast("Couldn't post announcement.", "error");
    return;
  }

  showToast("Announcement posted.");
  document.getElementById("an-title").value = "";
  document.getElementById("an-body").value = "";
  await loadAnnouncements();
});
