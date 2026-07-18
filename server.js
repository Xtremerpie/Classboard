// ============================================================
// ClassBoard — static file server
// Wispbyte (and most panel-based Node hosts) expect an app that
// listens on process.env.PORT. This just serves the static files.
// ============================================================
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

// Fallback to index.html for unknown routes (keeps things working
// if a link is typed directly instead of clicked)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`ClassBoard running on port ${PORT}`);
});
