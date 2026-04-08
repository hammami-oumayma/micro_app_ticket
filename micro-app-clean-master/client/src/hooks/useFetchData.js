import { useEffect, useState, useCallback } from "react";

const useFetchData = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        setLoading(true);
        setError(null);
        const value = await fetch(url, { credentials: "include" });
        if (!value.ok) {
          throw new Error("Une erreur est survenue");
        }
        const res = await value.json();
        setData(res);
      } catch (err) {
        console.log(err);
        setError(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchdata();
  }, [url, tick]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useFetchData;
