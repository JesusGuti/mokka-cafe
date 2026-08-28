function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL no está definida. Revisa tu archivo .env")
  }

  return apiUrl
}

export const env = {
  apiUrl: getApiUrl(),
}
