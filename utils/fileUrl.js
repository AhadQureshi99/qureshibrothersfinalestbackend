// utils/fileUrl.js
// Build the base URL used for uploaded-file links (profile pictures, documents,
// resumes, etc.). Prefers an explicitly configured API_URL; otherwise it derives
// the URL from the incoming request while honouring common reverse-proxy headers
// so that links always point at the real public host instead of falling back to
// localhost when the server runs behind a proxy.
const getFileBaseUrl = (req) => {
  if (process.env.API_URL) {
    return String(process.env.API_URL).replace(/\/+$/, "");
  }
  const headers = (req && req.headers) || {};
  const proto =
    (headers["x-forwarded-proto"] && headers["x-forwarded-proto"].split(",")[0]) ||
    (req && req.protocol) ||
    "http";
  const host =
    (headers["x-forwarded-host"] && headers["x-forwarded-host"].split(",")[0]) ||
    (req && req.get && req.get("host")) ||
    `localhost:${process.env.PORT || 3001}`;
  return `${proto}://${host}`;
};

module.exports = { getFileBaseUrl };
