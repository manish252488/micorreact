/**
 * Safe Host Loader for Product Micro Frontend
 * Handles cases where host hasn't loaded yet
 */

import { storeLoader, utilsLoader } from "host/utils";

// Create a React hook for safe store access
export const useSafeStore = () => {
  const [store, setStore] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const loadStore = async () => {
      try {
        setIsLoading(true);
        const loadedStore = await storeLoader.loadStore();
        if (mounted) {
          setStore(loadedStore);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          // Still set store to fallback
          setStore(storeLoader.getStore());
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadStore();

    return () => {
      mounted = false;
    };
  }, []);

  return { store, isLoading, error };
};

// Create a React hook for safe utils access
export const useSafeUtils = () => {
  const [utils, setUtils] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const loadUtils = async () => {
      try {
        const loadedUtils = await utilsLoader.loadUtils();
        if (mounted) {
          setUtils(loadedUtils);
        }
      } catch (err) {
        console.error('Failed to load utils:', err);
        if (mounted) {
          setUtils(utilsLoader.getUtils());
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadUtils();

    return () => {
      mounted = false;
    };
  }, []);

  return { utils, isLoading };
};

