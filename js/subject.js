// ============================================================
// ClassBoard — subject page logic
// ============================================================

let allFiles = [];
let currentProfile = null;

(async () => {
  const profile = await requireAuth();
  if (!profile) return;
  currentProfile = profile;
  renderUserChip(profile);

  if (profile.role === "teacher") {
    document.getElementById("nav-upload").style.display = "inline-block";
  }

  const subjectId = qs("id");
  const subjectName = qs("name") || "Subject";
  document.getElementById("subject-title").textContent = subjectName;

  if (!subjectId) {
    document.getElementById("file-list").innerHTML =
      `<div class="empty-state">No subject selected.</div>`;
    return;
  }

  await loadFiles(subjectId);

  document.getElementById("search-input").addEventListener("input", (e) => {
    renderFiles(filterFiles(e.target.value));
  });
})();

async function loadFiles(subjectId) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false });

  if (error) {
    document.getElementById("file-list").innerHTML =
      `<div class="empty-state">Couldn't load files. Check your Supabase setup.</div>`;
    return;
  }

  allFiles = data || [];
  document.getElementById("subject-count").textContent =
    `${allFiles.length} file${allFiles.length === 1 ? "" : "s"}`;
  renderFiles(allFiles);
}

function filterFiles(query) {
  const q = query.trim().toLowerCase();
  if (!q) return allFiles;
  return allFiles.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      (f.chapter || "").toLowerCase().includes(q)
  );
}

function renderFiles(files) {
  const el = document.getElementById("file-list");
  if (files.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="icon">📁</div>No files match.</div>`;
    return;
  }

  el.innerHTML = files
    .map((f) => {
      const meta = fileTypeMeta(f.name);
      const { data: pub } = supabase.storage.from("classboard-files").getPublicUrl(f.path);
      const canDelete = currentProfile.role === "teacher";
      return `
        <div class="card file-row">
          <div class="file-icon" style="background:${meta.color}22;">${meta.icon}</div>
          <div class="file-meta">
            <div class="file-name">${escapeHtml(f.name)}</div>
            <div class="file-sub">${f.chapter ? escapeHtml(f.chapter) + " · " : ""}${formatBytes(f.size)} · ${timeAgo(f.created_at)}</div>
          </div>
          <div class="file-actions">
            <a class="icon-btn" href="${pub.publicUrl}" target="_blank" title="Download">⬇️</a>
            ${canDelete ? `<button class="icon-btn danger" title="Delete" onclick="deleteFile('${f.id}','${f.path}')">🗑️</button>` : ""}
          </div>
        </div>`;
    })
    .join("");
}

async function deleteFile(id, path) {
  if (!confirm("Delete this file for everyone?")) return;
  const { error: storageError } = await supabase.storage.from("classboard-files").remove([path]);
  const { error: rowError } = await supabase.from("files").delete().eq("id", id);
  if (storageError || rowError) {
    showToast("Couldn't delete the file.", "error");
    return;
  }
  showToast("File deleted.");
  allFiles = allFiles.filter((f) => f.id !== id);
  renderFiles(allFiles);
}
