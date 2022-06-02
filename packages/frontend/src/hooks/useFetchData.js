import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const useFetchData = (endpoint, dependencies = [], checkAuth = true) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  const handleDataUpdate = (data) => {
    setData(data);
  };

  useEffect(() => {
    // Set up a cancellation source
    let didCancel = false;

    setIsLoading(true);
    async function getData() {
      if (checkAuth) {
        try {
          const token = await getAccessTokenSilently();

          // Create request headers with token authorization
          const headers = { Authorization: `Bearer ${token}` };

          const fetchedData = await axios.get(
            `${process.env.REACT_APP_ENDPOINT}/api/${endpoint}`,
            { headers }
          );
          if (!didCancel) {
            // Ignore if we started fetching something else
            setData(fetchedData.data);
            setIsLoading(false);
          }
        } catch (err) {
          // Is this error because we cancelled it ourselves?
          if (axios.isCancel(err)) {
            console.log(`call was cancelled`);
          } else {
            console.error(err);
          }
          setIsLoading(false);
        }
      } else {
        try {
          const fetchedData = await axios.get(
            `${process.env.REACT_APP_ENDPOINT}/api/${endpoint}`
          );
          if (!didCancel) {
            // Ignore if we started fetching something else
            setData(fetchedData.data);
            setIsLoading(false);
          }
        } catch (err) {
          // Is this error because we cancelled it ourselves?
          if (axios.isCancel(err)) {
            console.log(`call was cancelled`);
          } else {
            console.error(err);
          }
          setIsLoading(false);
        }
      }
    }
    getData();
    return () => {
      didCancel = true;
    }; // Remember if we start fetching something else
    // eslint-disable-next-line
  }, dependencies);

  return [data, isLoading, handleDataUpdate];
};

export default useFetchData;
