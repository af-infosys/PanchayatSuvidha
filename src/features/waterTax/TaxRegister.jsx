import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiPath from "../../isProduction";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../config/AuthContext";
import toGujaratiNumber from "../../components/toGujaratiNumber";
import TaxRegisterReport from "../../components/taxRegisterReport/TaxRegisterReport";

const TaxRegister = () => {
  const [records, setRecords] = useState([]);
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [projectId, setProjectId] = useState(null);

  const fetchWork = async () => {
    try {
      fetch(`${await apiPath()}/api/work/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then(async (data) => {
          setProjectId(data?.work?._id);
          console.log("Project ID:", data?.work?._id);
        });
    } catch (error) {
      console.error("Error fetching work:", error);
    }
  };

  const fetchRecords = async () => {
    try {
      if (projectId === null) return;

      const response = await fetch(
        `${await apiPath()}/api/sheet?workId=${projectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setRecords(result.data);
    } catch (err) {
      console.error("Error fetching records:", err);

      setError("ડેટા લાવવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.");
    } finally {
      setLoading(false);
    }
  };

  const [project, setProject] = useState([]);
  //   const [taxes, setTaxes] = useState([]);

  const fetchProject = async () => {
    if (projectId === null) return;

    try {
      setLoading(true);

      const data = await axios.get(
        `${await apiPath()}/api/work/project/${projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log(data);
      setProject(data?.data?.data || []);
      toast.success(`Data Fetched Successfully.`);
    } catch (error) {
      console.error("Error fetching projects:", error);
      //   toast.error(`Error Fetching Projects: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  //   const fetchTaxes = async () => {
  //     setLoading(true);
  //     try {
  //       if (projectId === null) return;

  //       let fetchedData = await axios.get(
  //         `${await apiPath()}/api/valuation/tax/${projectId}`,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         },
  //       );

  //       fetchedData = fetchedData?.data?.taxes;
  //       console.log(fetchedData);

  //       if (fetchedData && fetchedData.length > 0) {
  //         setTaxes(fetchedData);
  //         toast.success("Tax Data Fetched Successfully.");
  //       } else {
  //         toast.info("No Tax Data Found! try adding new Data");
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Error Fetching Taxes Data.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  // Step 1: Fetch projectId when user is available
  useEffect(() => {
    fetchWork();
  }, [user]);

  // Step 2: Fetch all data when projectId changes
  useEffect(() => {
    if (!projectId) return;

    fetchProject();
    fetchRecords();
    // fetchTaxes();
  }, [projectId]);

  return (
    <TaxRegisterReport
      records={records}
      project={project}
      projectId={projectId}
      loading={loading}
      error={error}
      year="૨૦૨૫/૨૬"
    />
  );
};

export default TaxRegister;
