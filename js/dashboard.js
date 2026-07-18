// ============================================================
// ClassBoard — dashboard page logic
// ============================================================

(async () => {
  const profile = await requireAuth();
  if (!profile) return;

  renderUserChip(profile);
  document.getElementById("greeting").textContent =
    `Welcome back, ${profile.full_name?.split(" ")[0] || "there"}`;

  if (profile.role === "teacher") {
    document.getElementById("nav-upload").style.display = "inline-block";
  }

  await Promise.all([loadStats(), loadSubjects(), loadPinnedAnnouncements(), loadRecentUploads()]);
})();

async function loadStats() {
  const [{ count: fileCount }, { count: subjectCount }, { count: announceCount }, todayFiles] =
    await Promise.all([
      supabase.from("files").select("*", { count: "exact", head: true }),
      supabase.from("subjects").select("*", { count: "exact", head: true }),
      supabase.from("announcements").select("*", { count: "exact", head: true }),
      supabase
        .from("files")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]);

  document.getElementById("stat-files").textContent = fileCount ?? 0;
  document.getElementById("stat-subjects").textContent = subjectCount ?? 0;
  document.getElementById("stat-announcements").textContent = announceCount ?? 0;
  document.getElementById("stat-today").textContent = todayFiles.count ?? 0;
}

async function loadSubjects() {
  const grid = document.getElementById("subject-grid");
  const { data: subjects, error } = await supabase.from("subjects").select("*").order("name");

  if (error || !subjects || subjects.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="icon">📚</div>No subjects yet. ${
      error ? "Check your Supabase setup." : "A teacher can add one from the database for now."
    }</div>`;
    return;
  }

  // File counts per subject
  const { data: counts } = await supabase.from("files").select("subject_id");
  const countMap = {};
  (counts || []).forEach((f) => (countMap[f.subject_id] = (countMap[f.subject_id] || 0) + 1));

  grid.innerHTML = subjects
    .map((s) => {
      const color = subjectColor(s.name);
      return `
        <a class="card subject-tile" href="subject.html?id=${s.id}&name=${encodeURIComponent(s.name)}">
          <div class="icon" style="background:${color}22;color:${color};">${subjectIcon(s.name)}</div>
          <div class="name">${escapeHtml(s.name)}</div>
          <div class="count">${countMap[s.id] || 0} file${countMap[s.id] === 1 ? "" : "s"}</div>
        </a>`;
    })
    .join("");
}

async function loadPinnedAnnouncements() {
  const el = document.getElementById("pinned-announcements");
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) {
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

async function loadRecentUploads() {
  const el = document.getElementById("recent-uploads");
  const { data, error } = await supabase
    .from("files")
    .select("*, subjects(name)")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="icon">📁</div>No files uploaded yet.</div>`;
    return;
  }

  el.innerHTML = data
    .map((f) => {
      const meta = fileTypeMeta(f.name);
      const { data: pub } = supabase.storage.from("classboard-files").getPublicUrl(f.path);
      return `
        <div class="card file-row">
          <div class="file-icon" style="background:${meta.color}22;">${meta.icon}</div>
          <div class="file-meta">
            <div class="file-name">${escapeHtml(f.name)}</div>
            <div class="file-sub">${escapeHtml(f.subjects?.name || "General")} · ${formatBytes(f.size)} · ${timeAgo(f.created_at)}</div>
          </div>
          <div class="file-actions">
            <a class="icon-btn" href="${pub.publicUrl}" target="_blank" title="Download">⬇️</a>
          </div>
        </div>`;
    })
    .join("");
}
