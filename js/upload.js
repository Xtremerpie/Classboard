// ============================================================
// ClassBoard — upload page logic
// ============================================================

let selectedFile = null;
let currentProfile = null;

(async () => {
  const profile = await requireTeacher();
  if (!profile) return;
  currentProfile = profile;
  renderUserChip(profile);
  await loadSubjectOptions();
})();

async function loadSubjectOptions() {
  const select = document.getElementById("subject-select");
  const { data, error } = await supabase.from("subjects").select("*").order("name");
  if (error || !data) return;
  data.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
}

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const dzLabel = document.getElementById("dz-label");
const submitBtn = document.getElementById("upload-submit");

dropzone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => setFile(e.target.files[0]));

["dragenter", "dragover"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);
["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  })
);
dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
});

function setFile(file) {
  if (!file) return;
  selectedFile = file;
  dzLabel.textContent = `${file.name} (${formatBytes(file.size)})`;
  submitBtn.disabled = false;
}

document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("upload-error");
  errorEl.textContent = "";

  const subjectId = document.getElementById("subject-select").value;
  const chapter = document.getElementById("chapter-input").value.trim();

  if (!selectedFile) {
    errorEl.textContent = "Choose a file first.";
    return;
  }
  if (!subjectId) {
    errorEl.textContent = "Select a subject.";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Uploading…";

  try {
    const safeName = selectedFile.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const path = `${subjectId}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("classboard-files")
      .upload(path, selectedFile);
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from("files").insert({
      name: selectedFile.name,
      path,
      size: selectedFile.size,
      subject_id: subjectId,
      chapter: chapter || null,
      uploaded_by: currentProfile.id,
    });
    if (insertError) throw insertError;

    showToast("File uploaded — students can see it now.");
    setTimeout(() => (window.location.href = "dashboard.html"), 900);
  } catch (err) {
    errorEl.textContent = err.message || "Upload failed.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Upload file";
  }
});
