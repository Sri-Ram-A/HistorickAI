// routes.ts
export const BASE_URL = "http://127.0.0.1:8000/";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export const API_PATHS = {
  FOLDERS: "folder/folders/",
  FOLDER: (id: string) => `folder/folders/${id}/`,
  FILES: "folder/files/",
  FILE: (id: string) => `folder/files/${id}/`,
} as const;


async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("No refresh token");
  const res = await fetch(`${BASE_URL}api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    localStorage.clear();
    throw new Error("Session expired");
  }
  const data = await res.json();
  localStorage.setItem("access", data.access);
  return data.access;
}

export async function REQUEST(
  method: HttpMethod,
  endpoint: string,
  body?: any,
  options?: { isMultipart?: boolean }
) {
  async function sendRequest(accessToken: string | null) {
    const headers: Record<string, string> = {};
    if (!options?.isMultipart) {
      headers["Content-Type"] = "application/json";
    }
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const response = await fetch(`${BASE_URL}api/${endpoint}`, {
      method: method,
      headers: headers,
      body: options?.isMultipart
        ? body
        : body
          ? JSON.stringify(body)
          : null,
    });
    return response;
  }

  let accessToken = localStorage.getItem("access");
  let response = await sendRequest(accessToken);

  // If token expired → refresh and retry once
  if (response.status === 401) {
    accessToken = await refreshAccessToken();
    response = await sendRequest(accessToken);
  }

  // If still failing → throw error
  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch { }
    throw new Error(errorMessage);
  }

  // No content
  if (response.status === 204) {
    return null;
  }

  // Parse JSON if available
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return null;
}