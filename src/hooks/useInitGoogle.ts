export const useInitiateGoogleAuth = () => {
  return () => {
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      console.error("VITE_API_URL is not defined in .env file");
      return;
    }

    window.location.href = `${apiUrl}/auth/google/callback`;
  };
};
