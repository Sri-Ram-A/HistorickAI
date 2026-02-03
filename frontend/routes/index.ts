export const BASE_URL = "http://127.0.0.1:8000/"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem("refresh")
  if (!refresh) throw new Error("No refresh token")

  const res = await fetch(`${BASE_URL}api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })

  if (!res.ok) {
    localStorage.clear()
    throw new Error("Session expired")
  }

  const data = await res.json()
  localStorage.setItem("access", data.access)
  return data.access
}

export async function REQUEST(
  method: HttpMethod,
  url: string,
  body?: any,
  options?: { isMultipart?: boolean }
) {
  const makeRequest = async () => {
    const headers: Record<string, string> = {}
    if (!options?.isMultipart)
      headers["Content-Type"] = "application/json"
    const access = localStorage.getItem("access")
    if (access)
      headers["Authorization"] = `Bearer ${access}`
    return fetch(`${BASE_URL}api/${url}`, {
      method,
      headers,
      body: options?.isMultipart
        ? body
        : body
        ? JSON.stringify(body)
        : null,
    })
  }

  let res = await makeRequest()

  // auto refresh
  if (res.status === 401) {
    await refreshAccessToken()
    res = await makeRequest()
  }

  // unified error handling (inline)
  if (!res.ok) {
    let message = "Request failed"

    try {
      const data = await res.json()
      message = data.detail || message
    } catch {}

    throw new Error(message)
  }

  return res.json()
}
