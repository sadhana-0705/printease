const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");

export const apiOrigin =
  configuredApiUrl || (typeof window !== "undefined" ? window.location.origin : "");

export const apiBaseUrl = configuredApiUrl ? `${configuredApiUrl}/api` : "/api";

export const buildFileUrl = (fileUrl = "") => {
  if (!fileUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const normalizedPath = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return configuredApiUrl ? `${configuredApiUrl}${normalizedPath}` : normalizedPath;
};
