import React, { useEffect, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import apiPath from "../../isProduction";
import "./IndexReport.scss";
import { toast } from "react-toastify";
import axios from "axios";
import toGujaratiNumber from "../../components/toGujaratiNumber";

import { useAuth } from "../../config/AuthContext";


import WaterIndexIndex from "../../components/conver/WaterIndexIndex";

// The main component for the analytics report
const IndexReport = () => {
    // Use state to manage all the report data
    const [rawRecords, setRawRecords] = useState([]); // Original unsorted records for page mapping
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState([]);
    const [pdfProgress, setPdfProgress] = useState({
        isGenerating: false,
        percentage: 0,
        completedPages: 0,
        totalPages: 0,
        isCancelled: false,
    });

    const village = project?.spot?.gaam;
    const taluka = project?.spot?.taluka;
    const district = project?.spot?.district;
    const background = "#007bff";

    const [projectId, setProjectId] = useState();
    const { user } = useAuth();


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

    const fetchProject = async () => {
        try {
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
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error(`Error Fetching Projects: ${error}`);
        }
    };

    // Function to determine the Gujarati letter for a name
    const getGujaratiInitial = (name) => {
        if (!name) return "";
        const firstChar = name.charAt(0);

        const consonants = [
            "ક",
            "ખ",
            "ગ",
            "ઘ",
            "ઙ",
            "ચ",
            "છ",
            "જ",
            "ઝ",
            "ઞ",
            "ટ",
            "ઠ",
            "ડ",
            "ઢ",
            "ણ",
            "ત",
            "થ",
            "દ",
            "ધ",
            "ન",
            "પ",
            "ફ",
            "બ",
            "ભ",
            "મ",
            "ય",
            "ર",
            "લ",
            "વ",
            "શ",
            "ષ",
            "સ",
            "હ",
            "ળ",
        ];
        const vowels = ["અ", "આ", "ઇ", "ઈ", "ઉ", "ઊ", "ઋ", "એ", "ઐ", "ઓ", "ઔ"];

        const alphabetMap = {
            vowels,
        };
        const matras = {
            "": "", // implicit 'અ'
            "ા": "આ",
            "િ": "ઇ",
            "ી": "ઈ",
            "ુ": "ઉ",
            "ૂ": "ઊ",
            "ૃ": "ઋ",
            "ે": "એ",
            "ૈ": "ઐ",
            "ો": "ઓ",
            "ૌ": "ઔ",
        };

        function generateSyllables(consonant) {
            return Object.keys(matras).map((matra) => consonant + matra);
        }

        consonants.forEach((c) => {
            alphabetMap[c] = generateSyllables(c);
        });

        for (const key in alphabetMap) {
            if (alphabetMap[key].includes(firstChar)) {
                return key;
            }
        }
        return "";
    };

    const commercialCategories = [
        "દુકાન",
        "પ્રાઈવેટ - સંસ્થાઓ",
        "કારખાના - ઇન્ડસ્ટ્રીજ",
        "ટ્રસ્ટ મિલ્કત / NGO",
        "મંડળી - સેવા સહકારી મંડળી",
        "બેંક - સરકારી",
        "બેંક - અર્ધ સરકારી બેંક",
        "બેંક - પ્રાઇટ બેંક",
        "કોમ્પપ્લેક્ષ",
        "હિરાના કારખાના નાના",
        "હિરાના કારખાના મોટા",
        "મોબાઈલ ટાવર",
        "પેટ્રોલ પંપ, ગેસ પંપ",
    ];

    function isCommercialProperty(row) {
        const category = row[8] ? row[8].trim() : "";

        // 1️⃣ Category based
        if (commercialCategories.includes(category)) {
            return true;
        }

        // 2️⃣ Room details based ("દુકાન")
        if (row[15]) {
            try {
                const floors = JSON.parse(row[15]);

                return floors.some(
                    (floor) =>
                        Array.isArray(floor.roomDetails) &&
                        floor.roomDetails.some((room) =>
                            room?.roomHallShopGodown?.includes("દુકાન"),
                        ),
                );
            } catch {
                return false;
            }
        }

        return false;
    }

    // Group records by their Gujarati initial
    const groupedRecords = records.reduce((acc, record) => {
        const initial = getGujaratiInitial(record[3]); // Assuming name is at index 3
        if (initial) {
            if (!acc[initial]) {
                acc[initial] = [];
            }
            acc[initial].push(record);
        }
        return acc;
    }, {});

    const sortedKeys = Object.keys(groupedRecords).sort((a, b) =>
        a.localeCompare(b, "gu", { sensitivity: "base" }),
    );

    // Function to fetch dynamic data from an API
    const fetchRecords = async () => {
        setIsLoading(true);
        try {
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

            setRawRecords(result.data); // Save raw order for exact Akarni page mapping

            const sortedRecords = [...result.data].sort((a, b) => {
                const nameA = a[3]?.toString().toLowerCase() || "";
                const nameB = b[3]?.toString().toLowerCase() || "";
                return nameA.localeCompare(nameB, "gu", { sensitivity: "base" });
            });
            setRecords(sortedRecords);
        } catch (err) {
            console.error("Error fetching records:", err);
            console.log("ડેટા લાવવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.");
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchWork();
    }, [user]);

    useEffect(() => {
        if (!projectId) return
        fetchRecords();
        fetchProject();
    }, [projectId]);

    // ------------------------------------------------------------------
    // 🌟 EXACT AKARNI PAGE MAPPING LOGIC (Based on Reference Component)
    // ------------------------------------------------------------------
    const akarniPageMap = useMemo(() => {
        if (!rawRecords || rawRecords.length === 0) return {};

        const map = {};
        const isSeparate = project?.details?.seperatecommercial === true;

        // Standard Akarni configuration
        const pagesPerBundle = 100;
        const recordsPerPage = 6;
        let globalPageNumber = 1;

        // Helper: Split array into chunks (Create Pages)
        const chunkArray = (arr, size) => {
            const results = [];
            for (let i = 0; i < arr.length; i += size) {
                results.push(arr.slice(i, i + size));
            }
            return results;
        };

        if (isSeparate) {
            // ==========================================
            // SEPARATE MODE (RESIDENTIAL + COMMERCIAL)
            // ==========================================
            const normalRecords = rawRecords.filter((r) => !isCommercialProperty(r));
            const commercialRecords = rawRecords.filter((r) =>
                isCommercialProperty(r),
            );

            const normalPages = chunkArray(normalRecords, recordsPerPage);
            const commercialPages = chunkArray(commercialRecords, recordsPerPage);

            // ---------- RESIDENTIAL ----------
            const totalNormalBundles =
                Math.ceil(normalPages.length / pagesPerBundle) || 1;

            for (let b = 1; b <= totalNormalBundles; b++) {
                const start = (b - 1) * pagesPerBundle;
                const end = start + pagesPerBundle;
                const pagesForThisBundle = normalPages.slice(start, end);

                // Map pages inside this bundle
                pagesForThisBundle.forEach((pageRecs) => {
                    pageRecs.forEach((record) => {
                        map[record[0]] = globalPageNumber; // record[0] is property ID
                    });
                    globalPageNumber++; // Increment exactly like the reference logic
                });
            }

            // ---------- COMMERCIAL ----------
            if (commercialPages.length > 0) {
                const totalCommBundles = Math.ceil(
                    commercialPages.length / pagesPerBundle,
                );

                for (let b = 1; b <= totalCommBundles; b++) {
                    const start = (b - 1) * pagesPerBundle;
                    const end = start + pagesPerBundle;
                    const pagesForThisBundle = commercialPages.slice(start, end);

                    // Map pages inside this bundle
                    pagesForThisBundle.forEach((pageRecs) => {
                        pageRecs.forEach((record) => {
                            map[record[0]] = globalPageNumber;
                        });
                        globalPageNumber++;
                    });
                }
            }
        } else {
            // ==========================================
            // MIXED MODE
            // ==========================================
            const pages = chunkArray(rawRecords, recordsPerPage);
            const totalBundles = Math.ceil(pages.length / pagesPerBundle);

            for (let bundle = 1; bundle <= totalBundles; bundle++) {
                const start = (bundle - 1) * pagesPerBundle;
                const end = start + pagesPerBundle;
                const pagesForThisBundle = pages.slice(start, end);

                // Map pages inside this bundle
                pagesForThisBundle.forEach((pageRecs) => {
                    pageRecs.forEach((record) => {
                        map[record[0]] = globalPageNumber;
                    });
                    globalPageNumber++;
                });
            }
        }

        return map;
    }, [rawRecords, project]);
    // ------------------------------------------------------------------

    const formatTime = (seconds) => {
        if (seconds >= 60) {
            const min = Math.floor(seconds / 60);
            const sec = seconds % 60;
            return `${min}m ${sec}s`;
        }
        return `${seconds} seconds`;
    };

    const handleCancel = () => {
        setPdfProgress((prev) => ({
            ...prev,
            isCancelled: true,
        }));
    };

    const handleDownloadPDF = async () => {
        const totalPages = finalRenderPages.length;
        let totalDuration = 0;

        setPdfProgress({
            isGenerating: true,
            isCancelled: false,
            completedPages: 0,
            totalPages: totalPages,
            percentage: 0,
            timeRemaining: null,
        });

        const pdf = new jsPDF("p", "mm", "legal");

        for (let i = 0; i < totalPages; i++) {
            const currentState = await new Promise((resolve) => {
                setPdfProgress((prev) => {
                    resolve(prev);
                    return prev;
                });
            });

            if (currentState.isCancelled) break;

            const pageStart = window.performance.now();
            const pageElement = document.getElementById(`report-page-${i}`);

            if (!pageElement) {
                console.error(`Page element with ID 'report-page-${i}' not found.`);
                continue;
            }

            if (i > 0) {
                pdf.addPage();
            }

            try {
                const canvas = await html2canvas(pageElement, {
                    scale: 2, // સારી ક્વોલિટી માટે
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                });

                const imgData = canvas.toDataURL("image/jpeg", 1.0);

                const imgWidth = 215.6;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

                const pageEnd = window.performance.now();
                totalDuration += pageEnd - pageStart;

                const completedPages = i + 1;
                const percentage = Math.round((completedPages / totalPages) * 100);

                let timeRemaining = null;
                if (completedPages >= 2) {
                    const averageTimePerPage = totalDuration / completedPages;
                    timeRemaining = Math.round(
                        (averageTimePerPage * (totalPages - completedPages)) / 1000,
                    );
                }

                setPdfProgress((prev) => ({
                    ...prev,
                    completedPages,
                    percentage,
                    timeRemaining,
                }));
            } catch (error) {
                console.error("Error generating PDF page:", error);
                break;
            }
        }

        if (!pdfProgress.isCancelled) {
            pdf.save(`Index_Report_${village || "Village"}.pdf`);
        }

        setPdfProgress((prev) => ({ ...prev, isGenerating: false }));

        const finalState = await new Promise((resolve) => {
            setPdfProgress((prev) => {
                resolve(prev);
                return {
                    ...prev,
                    isGenerating: false,
                    isCancelled: prev.isCancelled,
                    percentage: prev.isCancelled ? prev.percentage : 100,
                    timeRemaining: null,
                };
            });
        });

        if (!finalState.isCancelled) {
            pdf.save(`Index_Report_${village || "Village"}.pdf`);
            window.alert("PDF successfully saved.");
        } else {
            window.alert("PDF save operation skipped due to cancellation.");
        }
    };

    const [PROPERTIES_PER_PAGE, SetPropertiesPerPage] = useState(28); // એક પેજ પર કેટલી લાઇન બતાવવી
    const BUNDLE_SIZE = 100; // કેટલા પેજ પછી કવર પેજ મૂકવું

    // 1. પહેલા ગ્રુપિંગના આધારે પેજીસ તૈયાર કરો (This remains Index-specific chunking)
    const prepareDisplayPages = () => {
        const displayPages = [];
        let currentPage = [];
        let rowCount = 0;

        sortedKeys.forEach((key) => {
            // હેડર ચેક
            if (rowCount >= PROPERTIES_PER_PAGE) {
                displayPages.push(currentPage);
                currentPage = [];
                rowCount = 0;
            }
            currentPage.push({ type: "header", key });
            rowCount++;

            groupedRecords[key].forEach((record) => {
                if (rowCount >= PROPERTIES_PER_PAGE) {
                    displayPages.push(currentPage);
                    currentPage = [{ type: "header", key }]; // નવા પેજ પર હેડર રિપીટ
                    rowCount = 1;
                }
                currentPage.push({ type: "record", data: record });
                rowCount++;
            });
        });

        if (currentPage.length > 0) displayPages.push(currentPage);
        return displayPages;
    };

    // 2. Build Final Pages with bundles, covers, and global pagination
    const buildFinalPages = (allPages) => {
        if (!allPages || allPages.length === 0) return [];

        const final = [];
        const isSeparate = project?.details?.seperatecommercial === true;

        // 🔢 Global continuous page counter for Index (1-based)
        let globalPageNumber = 1;

        // Helper to check if a structured page contains commercial property
        const isCommercialPage = (pageContent) => {
            return pageContent?.some((item) =>
                item.type === "record" ? isCommercialProperty(item.data) : false,
            );
        };

        if (isSeparate) {
            // ==========================================
            // SEPARATE MODE
            // ==========================================

            const residentialPagesList = allPages.filter(
                (page) => !isCommercialPage(page),
            );

            const commercialPagesList = allPages.filter((page) =>
                isCommercialPage(page),
            );

            let currentBundle = 1;

            // ---------- RESIDENTIAL ----------
            // const totalResidentialBundles =
            //   Math.ceil(residentialPagesList.length / BUNDLE_SIZE) || 1;

            // for (let b = 1; b <= residentialPagesList.length; b++) {
            // const start = (b - 1) * BUNDLE_SIZE;
            // const end = start + BUNDLE_SIZE;
            // const pagesForThisBundle = residentialPagesList.slice(start, end);

            const pageFrom = globalPageNumber;
            const pageTo = globalPageNumber + residentialPagesList.length - 1;

            final.push({
                type: "cover",
                bundle: currentBundle,
                name: "રહેણાંક મિલકત",
                commercial: false,
                pageFrom,
                pageTo,
            });

            residentialPagesList.forEach((pageRecords) => {
                final.push({
                    type: "data-page",
                    bundle: currentBundle,
                    pageNumber: globalPageNumber,
                    records: pageRecords,
                    isCommercial: false,
                });
                globalPageNumber++; // Increment global counter
            });

            //   currentBundle++;
            // }

            // ---------- COMMERCIAL ----------
            if (commercialPagesList.length > 0) {
                // const totalCommercialBundles = Math.ceil(
                //   commercialPagesList.length / BUNDLE_SIZE,
                // );

                // for (let b = 1; b <= commercialPagesList.length; b++) {
                // const start = (b - 1) * BUNDLE_SIZE;
                // const end = start + BUNDLE_SIZE;
                // const pagesForThisBundle = commercialPagesList.slice(start, end);

                const pageFrom = globalPageNumber;
                const pageTo = globalPageNumber + commercialPagesList.length - 1;

                final.push({
                    type: "cover",
                    bundle: currentBundle,
                    name: "કોમર્શિયલ મિલકત",
                    commercial: true,
                    totalNormalBundles: residentialPagesList,
                    pageFrom,
                    pageTo,
                });

                commercialPagesList.forEach((pageRecords) => {
                    final.push({
                        type: "data-page",
                        bundle: currentBundle,
                        pageNumber: globalPageNumber,
                        records: pageRecords,
                        isCommercial: true,
                    });
                    globalPageNumber++; // Increment global counter
                });

                //   currentBundle++;
                // }
            }
        } else {
            // ==========================================
            // NORMAL MODE
            // ==========================================

            const totalBundles = Math.ceil(allPages.length / BUNDLE_SIZE);

            for (let b = 1; b <= totalBundles; b++) {
                const start = (b - 1) * BUNDLE_SIZE;
                const end = start + BUNDLE_SIZE;
                const pagesForThisBundle = allPages.slice(start, end);

                const pageFrom = globalPageNumber;
                const pageTo = globalPageNumber + pagesForThisBundle.length - 1;

                final.push({
                    type: "cover",
                    bundle: b,
                    pageFrom,
                    pageTo,
                });

                pagesForThisBundle.forEach((pageRecords) => {
                    final.push({
                        type: "data-page",
                        bundle: b,
                        pageNumber: globalPageNumber,
                        records: pageRecords,
                    });
                    globalPageNumber++; // Increment global counter
                });
            }
        }

        return final;
    };

    const displayPages = prepareDisplayPages();
    const finalRenderPages = buildFinalPages(displayPages);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans">
                <div className="text-2xl font-bold text-gray-700">
                    લોડ થઈ રહ્યું છે...
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-4 sm:p-8 bg-gray-100 min-h-screen font-sans">
            {/* ડાઉનલોડ બટન */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={handleDownloadPDF}
                    disabled={pdfProgress.isGenerating}
                    className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {pdfProgress.isGenerating
                        ? "પ્રોસેસ ચાલુ છે..."
                        : "Download Index PDF"}
                </button>
            </div>

            {pdfProgress.isGenerating && (
                // Progress Modal/Overlay
                <div className="fixed inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center z-50 p-4">
                    <div className="p-8 rounded-xl bg-white shadow-2xl w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-2 text-center text-gray-800">
                            {pdfProgress.isCancelled
                                ? "❌ Canceled"
                                : "📄 Generating Report PDF"}
                        </h3>
                        <p
                            className={`text-sm mb-4 text-center ${pdfProgress.isCancelled ? "text-red-500" : "text-gray-500"
                                }`}
                        >
                            Please wait, this is a CPU-intensive task.
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${pdfProgress.isCancelled ? "bg-yellow-500" : "bg-green-600"
                                    }`}
                                style={{ width: `${pdfProgress.percentage}%` }}
                            ></div>
                        </div>

                        {/* Progress Details */}
                        <p className="text-sm font-semibold text-gray-700 text-center mb-1">
                            {pdfProgress.percentage}% Completed
                        </p>
                        <p className="text-xs text-gray-500 text-center mb-2">
                            Page <b>{pdfProgress.completedPages}</b> of{" "}
                            <b>{pdfProgress.totalPages}</b> done
                        </p>

                        {/* ETA Display */}
                        {pdfProgress.timeRemaining !== null && !pdfProgress.isCancelled ? (
                            <p className="text-sm font-bold text-blue-600 text-center mb-4">
                                {formatTime(pdfProgress.timeRemaining)} remaining
                            </p>
                        ) : (
                            <p className="text-sm font-medium text-gray-400 text-center mb-4">
                                {pdfProgress.isCancelled
                                    ? "Cancelling process..."
                                    : "Calculating ETA..."}
                            </p>
                        )}

                        {/* 🔴 CANCEL BUTTON */}
                        <button
                            onClick={handleCancel}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 disabled:bg-red-400"
                            disabled={pdfProgress.isCancelled} // Disable if already signaled to cancel
                        >
                            {pdfProgress.isCancelled ? "Cancelling..." : "Cancel Generation"}
                        </button>
                    </div>
                </div>
            )}

            <br />
            <br />

            <div
                style={{
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                    gap: "20px",

                    position: "sticky",
                    top: "20px",
                    marginBottom: "30px",
                    width: "100%",
                }}
            >
                <button
                    onClick={() => SetPropertiesPerPage(PROPERTIES_PER_PAGE - 1)}
                    style={{
                        padding: "10px 20px",
                        background: "blue",
                        color: "white",
                        borderRadius: "5px",
                        fontSize: "20px",
                        fontWeight: "900",
                    }}
                >
                    -
                </button>

                <h3>{PROPERTIES_PER_PAGE}</h3>

                <button
                    onClick={() => SetPropertiesPerPage(PROPERTIES_PER_PAGE + 1)}
                    style={{
                        padding: "10px 20px",
                        background: "blue",
                        color: "white",
                        borderRadius: "5px",
                        fontSize: "20px",
                        fontWeight: "900",
                    }}
                >
                    +
                </button>
            </div>

            {/* Hidden container for PDF generation */}
            <div
                className="pdf-report-container"
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
                {finalRenderPages.map((item, idx) => {
                    const pageId = `report-page-${idx}`;

                    if (item.type === "cover") {
                        return (
                            <div
                                key={idx}
                                id={pageId}
                                className="report-page legal-landscape-dimensions"
                                style={{
                                    maxWidth: "216mm",
                                    height: "auto",
                                    minHeight: "356mm",
                                    maxHeight: "356mm",
                                    background: "#fff",
                                }}
                            >
                                <WaterIndexIndex
                                    part={item.bundle}
                                    nop={PROPERTIES_PER_PAGE}
                                    project={project}
                                    totalHoouse={records?.length}
                                    title={item.name}
                                    commercial={item?.commercial}
                                    pageFrom={item.pageFrom}
                                    pageTo={item.pageTo}
                                />
                            </div>
                        );
                    }

                    return (
                        <div
                            style={{
                                position: "relative",
                                // background: "red",
                                background: "#fff",

                                maxWidth: "216mm",

                                height: "auto",
                                minHeight: "356mm",
                                maxHeight: "356mm",
                                boxSizing: "border-box",
                            }}
                        >
                            <div
                                key={idx}
                                id={pageId}
                                className="report-page watermark"
                                style={{
                                    width: "100%",
                                    height: "100%",

                                    position: "relative",
                                    background: "transparent",
                                    paddingLeft: "90px",
                                    paddingRight: "20px",
                                }}
                            >
                                {/* Headers and Page Count */}
                                <div
                                    className="page-header-container"
                                    style={{ position: "relative" }}
                                >
                                    <h1
                                        className="heading"
                                        style={{ fontSize: "16px", paddingTop: "5px" }}
                                    >
                                        Index Book - (પાનોત્રી બુક) ક, ખ, ગ, પ્રમાણે <br /> ખાસ પાણી
                                        નળ વેરા રજીસ્ટર{" "}
                                        {item?.isCommercial
                                            ? "(કોમર્શિયલ)"
                                            : item?.isCommercial === false
                                                ? "(રહેણાંક)"
                                                : ""}
                                    </h1>
                                    <h2 className="subheading">
                                        ગ્રામ્ય જળ અને સ્વચ્છતા સમિતિ વર્ષ {project?.details?.taxYear || "૨૦૨૫/૨૬"}
                                    </h2>

                                    <span
                                        className="page-numberN"
                                        style={{
                                            fontSize: "20px",
                                        }}
                                    >
                                        પાના નં. {toGujaratiNumber(item?.pageNumber)}
                                    </span>

                                    <div
                                        className="location-info"
                                        style={{
                                            paddingInline: "50px",
                                            paddingBottom: 0,
                                            marginBottom: 0,
                                            paddingTop: "-25px",
                                            marginTop: "-25px",
                                        }}
                                    >
                                        <span>ગામ:- {village}</span>
                                        <span>તાલુકો:- {taluka}</span>
                                        <span>જિલ્લો:- {district}</span>
                                    </div>
                                </div>

                                <table className="divide-y" style={{ maxWidth: "100%" }}>
                                    <thead>
                                        <tr>
                                            <th
                                                className="px-2 py-3 text-xm text-center font-medium text-gray-500 uppercase tracking-wider"
                                                style={{
                                                    color: "#000",
                                                    fontSize: "15px",
                                                    minWidth: "40px",
                                                    maxWidth: "40px",
                                                }}
                                                id="pdff"
                                            >
                                                <span
                                                    className="formatting"
                                                    style={{ textAlign: "center" }}
                                                >
                                                    ક્રમ
                                                </span>
                                            </th>
                                            <th
                                                className="px-2 py-3 text-xm text-center font-medium text-gray-500 uppercase tracking-wider"
                                                style={{
                                                    color: "#000",
                                                    fontSize: "15px",
                                                    maxWidth: "50px",
                                                }}
                                                id="pdff"
                                            >
                                                <span className="formatting">કનેકશન નંબર </span>
                                            </th>
                                            <th
                                                className="px-2 py-3 text-xm text-center font-medium text-gray-500 uppercase tracking-wider"
                                                style={{
                                                    color: "#000",
                                                    fontSize: "15px",
                                                    minWidth: "150px",
                                                }}
                                                id="pdff"
                                            >
                                                <span className="formatting"> નળ ધારકનું નામ </span>
                                            </th>
                                            <th
                                                className="px-2 py-3 text-xm text-center font-medium text-gray-500 uppercase tracking-wider"
                                                style={{
                                                    color: "#000",
                                                    fontSize: "15px",
                                                    // minWidth: "150px",
                                                }}
                                                id="pdff"
                                            >
                                                <span className="formatting">વિસ્તારનું નામ </span>
                                            </th>
                                            <th
                                                className="px-2 py-3 text-xm text-center font-medium text-gray-500 uppercase tracking-wider"
                                                style={{
                                                    color: "#000",
                                                    fontSize: "15px",
                                                    maxWidth: "35px",
                                                }}
                                                id="pdff"
                                            >
                                                <span className="formatting">પાના નંબર </span>
                                            </th>
                                            <th
                                                className="px-2 py-3 text-xm text-center font-medium text-gray-500 uppercase tracking-wider"
                                                style={{
                                                    color: "#000",
                                                    fontSize: "15px",
                                                    // maxWidth: "25px",
                                                }}
                                                id="pdff"
                                            >
                                                <span className="formatting">મોબાઈલ નંબર </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    {/* Table Rows */}
                                    <tbody>
                                        {item?.records?.map((row, rIdx) =>
                                            row.type === "header" ? (
                                                <tr key={rIdx}>
                                                    <td
                                                        colSpan="6"
                                                        className="text-center font-bold"
                                                        id="pdff"
                                                        style={{ textWrap: "wrap", padding: "0" }}
                                                    >
                                                        <span
                                                            className="formatting"
                                                            style={{
                                                                fontSize: "18px",
                                                                padding: "0",
                                                                paddingTop: "5px",
                                                            }}
                                                        >
                                                            {row.key === "vowels" ? "અ" : row.key}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr key={rIdx}>
                                                    <td
                                                        id="pdff"
                                                        style={{
                                                            textWrap: "wrap",
                                                            textAlign: "center",
                                                            paddingTop: "5px",
                                                        }}
                                                    >
                                                        <span className="formatting">
                                                            {row.data[0] || ""}
                                                        </span>
                                                    </td>

                                                    <td
                                                        id="pdff"
                                                        style={{
                                                            textWrap: "wrap",
                                                            textAlign: "center",

                                                            paddingTop: "5px",
                                                        }}
                                                    >
                                                        <span className="formatting">
                                                            {row.data[2] || ""}
                                                        </span>
                                                    </td>

                                                    <td
                                                        id="pdff"
                                                        style={{
                                                            textWrap: "wrap",

                                                            paddingTop: "5px",

                                                            minWidth: "220px",
                                                        }}
                                                    >
                                                        <span
                                                            className="formatting"
                                                            style={{ fontSize: "12.4px" }}
                                                        >
                                                            {row.data[3] || ""}
                                                        </span>
                                                    </td>

                                                    <td
                                                        id="pdff"
                                                        style={{
                                                            textWrap: "wrap",
                                                            minWidth: "200px",

                                                            paddingTop: "5px",
                                                            fontSize: "12.4px",
                                                        }}
                                                    >
                                                        <span className="formatting">
                                                            {row.data[1] || ""}
                                                        </span>
                                                    </td>

                                                    <td
                                                        id="pdff"
                                                        style={{
                                                            textWrap: "wrap",
                                                            paddingTop: "5px",
                                                        }}
                                                    >
                                                        <span className="formatting">
                                                            {akarniPageMap[row.data[0]] || 0}
                                                        </span>
                                                    </td>

                                                    <td
                                                        id="pdff"
                                                        style={{
                                                            textWrap: "wrap",
                                                            maxWidth: "80px",
                                                            minWidth: "40px",
                                                            paddingTop: "5px",
                                                        }}
                                                    >
                                                        <span className="formatting">
                                                            {row.data[6] || ""}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                                {/* </div> */}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleDownloadPDF}
                className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
                Download PDF
            </button>
        </div>
    );
};

export default IndexReport;
