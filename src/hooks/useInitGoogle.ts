export const useInitiateGoogleAuth = () => {
  return () => {
    // Make sure VITE_API_URL is defined in your .env file
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      console.error("VITE_API_URL is not defined in .env file");
      return;
    }

    // Changed to /auth/google (not /auth/google/callback)
    window.location.href = `${apiUrl}/auth/google/callback`;
  };
};
