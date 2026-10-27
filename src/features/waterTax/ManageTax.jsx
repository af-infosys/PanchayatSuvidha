import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiPath from "../../isProduction";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../config/AuthContext";
import toGujaratiNumber from "../../components/toGujaratiNumber";
import TaxRegisterReport from "../../components/taxRegisterReport/TaxRegisterReport";
import TinyLoader from "../../components/TinyLoader/TinyLoader"; // Path check kar lena aapke project ke hisaab se

const ManageTax = () => {
    const [records, setRecords] = useState([]);
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projectId, setProjectId] = useState(null);
    const [project, setProject] = useState([]);

    // Step 1: Fetch projectId when user is available
    const fetchWork = async () => {
        try {
            const res = await fetch(`${await apiPath()}/api/work/${user.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();
            setProjectId(data?.work?._id);
            console.log("Project ID:", data?.work?._id);
        } catch (error) {
            console.error("Error fetching work:", error);
        }
    };

    // Helper functions for fetching APIs
    const fetchProject = async () => {
        const response = await axios.get(
            `${await apiPath()}/api/work/project/${projectId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        return response.data?.data || [];
    };

    const fetchRecords = async () => {
        const response = await fetch(
            `${await apiPath()}/api/sheet?workId=${projectId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data || [];
    };

    // Step 2: Fetch all data concurrently when projectId changes
    const fetchAllData = async () => {
        if (!projectId) return;

        try {
            setLoading(true); // Loading ON

            // Promise.all dono API ko ek saath call karega, time bachega
            const [projectData, recordsData] = await Promise.all([
                fetchProject(),
                fetchRecords()
            ]);

            setProject(projectData);
            setRecords(recordsData);

            // toast.success(`Data Fetched Successfully.`);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("ડેટા લાવવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.");
        } finally {
            setLoading(false); // Loading OFF
        }
    };

    useEffect(() => {
        if (user) {
            fetchWork();
        }
    }, [user]);

    useEffect(() => {
        fetchAllData();
    }, [projectId]);

    // ✨ Yaha par Full-Screen Loading Return kar rahe hain
    if (loading || !records) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <TinyLoader />
                <p className="mt-4 text-gray-600 font-medium text-lg tracking-wide">
                    ડેટા લોડ થઈ રહ્યો છે. કૃપા કરીને રાહ જુઓ...
                </p>
            </div>
        );
    }

    // Error UI agar koi error aati hai toh
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <p className="text-red-500 font-bold text-xl">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow"
                >
                    ફરી પ્રયાસ કરો
                </button>
            </div>
        );
    }

    return (
        <TaxRegisterReport
            records={records}
            project={project}
            projectId={projectId}
            loading={loading} // Ye pass karna jaruri nahi hai ab, kyu ki uper early return kar diya hai, par pichle code compatibility ke liye rakh sakte hain
            error={error}
            year="૨૦૨૫/૨૬"
        />
    );
};

export default ManageTax;