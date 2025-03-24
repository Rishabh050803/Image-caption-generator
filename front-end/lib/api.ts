const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL 

// Ensure we're not using double slashes for API paths
export const getApiUrl = (path: string) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  // Ensure the base URL does not end with a slash
  const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${cleanBaseUrl}/${cleanPath}`;
};

// OAuth URL generators
export const getGoogleAuthUrl = () => getApiUrl('/accounts/google/login');
export const getGithubAuthUrl = () => getApiUrl('/accounts/github/login')