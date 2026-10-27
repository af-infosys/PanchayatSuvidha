import React, { useState, useEffect } from "react";
import "./SurvayReport.scss";
import apiPath from "../../isProduction";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import axios from "axios";
import { toast } from "react-toastify";

import WaterTarijFormat from "../../components/WaterTarijFormat";
import WaterTarijChart from "../../components/WaterTarijChart";
import { useAuth } from "../../config/AuthContext";

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

/* ---------- helper ---------- */
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

const calculateTotal = (data = []) => {
    return {
        houseTax: {
            curr: data.reduce((s, i) => s + Number(i[20] || 0), 0),
            prev: data.reduce((s, i) => s + Number(i[22] || 0), 0),

            vasulat: {
                curr: data.reduce(
                    (s, i) =>
                        s + Number(JSON.parse(i[24] || "{}")?.vasulat?.currtax || 0),
                    0,
                ),
                prev: data.reduce(
                    (s, i) =>
                        s + Number(JSON.parse(i[24] || "{}")?.vasulat?.prevtax || 0),
                    0,
                ),
            },
        },
        waterTax: {
            curr: data.reduce(
                (s, i) =>
                    s + Number(JSON.parse(i[21] || "{}")?.normal_water?.curr || 0),
                0,
            ),
            prev: data.reduce(
                (s, i) =>
                    s + Number(JSON.parse(i[23] || "{}")?.normal_water?.prev || 0),
                0,
            ),

            vasulat: {
                curr: data.reduce(
                    (s, i) =>
                        s + Number(JSON.parse(i[21] || "{}")?.normal_water?.vasulat || 0),
                    0,
                ),
                prev: data.reduce(
                    (s, i) =>
                        s + Number(JSON.parse(i[23] || "{}")?.normal_water?.vasulat || 0),
                    0,
                ),
            },
        },

        specialTax: {
            curr: data.reduce(
                (s, i) =>
                    s + Number(JSON.parse(i[21] || "{}")?.special_water?.curr || 0),
                0,
            ),
            prev: data.reduce(
                (s, i) =>
                    s + Number(JSON.parse(i[23] || "{}")?.special_water?.prev || 0),
                0,
            ),

            vasulat: {
                curr: data.reduce(
                    (s, i) =>
                        s + Number(JSON.parse(i[21] || "{}")?.special_water?.vasulat || 0),
                    0,
                ),
                prev: data.reduce(
                    (s, i) =>
                        s + Number(JSON.parse(i[23] || "{}")?.special_water?.vasulat || 0),
                    0,
                ),
            },
        },

        lightTax: {
            curr: data.reduce(
                (s, i) => s + Number(JSON.parse(i[21] || "{}")?.light?.curr || 0),
                0,
            ),
            prev: data.reduce(
                (s, i) => s + Number(JSON.parse(i[23] || "{}")?.light?.prev || 0),
                0,
            ),

            vasulat: {
                curr: data.reduce(
                    (s, i) => s + Number(JSON.parse(i[21] || "{}")?.light?.vasulat || 0),
                    0,
                ),
                prev: data.reduce(
                    (s, i) => s + Number(JSON.parse(i[23] || "{}")?.light?.vasulat || 0),
                    0,
                ),
            },
        },
        cleanTax: {
            curr: data.reduce(
                (s, i) => s + Number(JSON.parse(i[21] || "{}")?.cleaning?.curr || 0),
                0,
            ),
            prev: data.reduce(
                (s, i) => s + Number(JSON.parse(i[23] || "{}")?.cleaning?.prev || 0),
                0,
            ),

            vasulat: {
                curr: data.reduce(
                    (s, i) =>
                        s + Number(JSON.parse(i[21] || "{}")?.cleaning?.vasulat || 0),
                    0,
                ),
                prev: data.reduce(
                    (s, i) =>
                        s + Number(JSON.parse(i[23] || "{}")?.cleaning?.vasulat || 0),
                    0,
                ),
            },
        },

        totalCount: data.length,
        receiptCount: data.reduce((sum, i) => {
            const receipt = JSON.parse(i[24] || "{}")?.receipt || null;

            const pNo = Array.isArray(receipt)
                ? receipt
                    .map((r) => r?.pNo || "")
                    .filter(Boolean)
                    .join("+")
                : receipt?.pNo?.trim() || "";

            if (!pNo) return sum;

            // Remove dates (dd-mm-yy or dd/mm/yy)
            const receipts = pNo.replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, "");

            return sum + receipts.split("+").filter((r) => r.trim()).length;
        }, 0),

        countTax: data.reduce(
            (s, i) =>
                s +
                ([
                    "ધાર્મિક સ્થળ",
                    "સરકારી મિલ્ક્ત",
                    "બેંક - સરકારી",
                    "પ્લોટ સરકારી - કોમનપ્લોટ",
                    "પ્લોટ (ફરતી દિવાલ) સરકારી",
                ].includes(i[8])
                    ? 0
                    : 1),
            0,
        ),

        tabCount: data.reduce((sum, record) => {
            return sum + (Number(record[12]) || 0);
        }, 0),
    };
};

const TarijReport = () => {
    const [projectId, setProjectId] = useState(null);

    const [records, setRecords] = useState([]);
    const [project, setProject] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


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


    const fetchRecords = async () => {
        try {
            const res = await fetch(
                `${await apiPath()}/api/sheet?workId=${projectId}`,
            );
            const json = await res.json();
            setRecords(json?.data || []);
        } catch (e) {
            setError("ડેટા લાવવામાં નિષ્ફળ.");
        }
    };

    const fetchProject = async () => {
        try {
            const res = await axios.get(
                `${await apiPath()}/api/work/project/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            setProject(res?.data?.data || {});
        } catch (e) {
            toast.error("Project load error");
        }
    };


    useEffect(() => {
        fetchWork();
    }, [user]);


    useEffect(() => {
        if (!projectId) return;


        Promise.all([fetchProject(), fetchRecords()]).finally(() =>
            setLoading(false),
        );
    }, [projectId]);





    const normalRecords = records.filter((r) => !isCommercialProperty(r));
    const commercialRecords = records.filter((r) => isCommercialProperty(r));

    const totalAll = calculateTotal(records);
    const totalNormal = calculateTotal(normalRecords);
    const totalCommercial = calculateTotal(commercialRecords);

    const addSectionToPDF = async (pdf, elementId, addNewPage = false) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 1.5 });
        const imgData = canvas.toDataURL("image/jpeg", 1);

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (addNewPage) pdf.addPage();

        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    };

    const generatePDF = async () => {
        const pdf = new jsPDF("l", "pt", [912, 1500]);

        if (project?.details?.seperatecommercial) {
            await addSectionToPDF(pdf, "pdf-normal");
            await addSectionToPDF(pdf, "pdf-commercial", true);
            await addSectionToPDF(pdf, "pdf-total", true);

            await addSectionToPDF(pdf, "pdf-res-chart", true);
            await addSectionToPDF(pdf, "pdf-com-chart", true);
            await addSectionToPDF(pdf, "pdf-chart", true);
        } else {
            await addSectionToPDF(pdf, "pdf-single");

            await addSectionToPDF(pdf, "pdf-chart", true);
        }

        pdf.save("5. Tarij_Report.pdf");
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <button
                onClick={generatePDF}
                className="bg-green-600 text-white px-4 py-2 rounded"
            >
                Download PDF
            </button>

            <br />
            <br />

            {project?.details?.seperatecommercial ? (
                <span className="text-green-600 font-bold">
                    COMMERCIAL SEPARATION ACTIVE
                </span>
            ) : (
                <span className="text-gray-500">Standard Sort</span>
            )}

            <br />
            <br />

            <div
                id="pdf-report-container"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "30px",
                }}
            // style={{ width: "1300px", padding: "20px", paddingLeft: "70px" }}
            >
                {project?.details?.seperatecommercial ? (
                    <>
                        <div
                            id="pdf-normal"
                            style={{
                                width: "1300px",
                                padding: "20px",
                                paddingLeft: "60px",
                                paddingTop: "80px",
                                background: "#fff",
                            }}
                        >
                            <WaterTarijFormat
                                project={project}
                                total={totalNormal}
                                length={normalRecords.length}
                                totalTabConn={records.reduce(
                                    (sum, record) => sum + (Number(record[12]) || 0),
                                    0,
                                )}
                                name="રહેણાંક મિલકત"
                            />
                        </div>

                        <div
                            id="pdf-commercial"
                            style={{
                                width: "1300px",
                                padding: "20px",
                                paddingLeft: "60px",
                                paddingTop: "80px",
                                background: "#fff",
                            }}
                        >
                            <WaterTarijFormat
                                project={project}
                                total={totalCommercial}
                                length={commercialRecords.length}
                                totalTabConn={records.reduce(
                                    (sum, record) => sum + (Number(record[12]) || 0),
                                    0,
                                )}
                                name="કોમર્શિયલ મિલકત"
                            />
                        </div>

                        <div
                            id="pdf-total"
                            style={{
                                width: "1300px",
                                padding: "20px",
                                paddingLeft: "60px",
                                paddingTop: "80px",
                                background: "#fff",
                            }}
                        >
                            <WaterTarijFormat
                                project={project}
                                total={totalAll}
                                length={records.length}
                                totalTabConn={records.reduce(
                                    (sum, record) => sum + (Number(record[12]) || 0),
                                    0,
                                )}
                                name="રહેણાંક મિલકત તથા કોમર્શિયલ મિલકત બન્ને"
                            />
                        </div>

                        <div
                            id="pdf-res-chart"
                            style={{
                                width: "1300px",
                                padding: "20px",
                                paddingLeft: "60px",
                                paddingTop: "80px",
                                background: "#fff",
                            }}
                        >
                            <WaterTarijChart
                                project={project}
                                total={totalNormal}
                                length={normalRecords.length}
                                totalResidence={normalRecords?.length}
                                totalTabConn={records.reduce(
                                    (sum, record) => sum + (Number(record[12]) || 0),
                                    0,
                                )}
                                name={"ચાર્ટ તારીજ ૯/ડિ કુલ માંગણાં નો રહેણાંક મિલકતનો રિપોર્ટ"}
                            />
                        </div>

                        <div
                            id="pdf-com-chart"
                            style={{
                                width: "1300px",
                                padding: "20px",
                                paddingLeft: "60px",
                                paddingTop: "80px",
                                background: "#fff",
                            }}
                        >
                            <WaterTarijChart
                                project={project}
                                total={totalCommercial}
                                length={commercialRecords.length}
                                totalResidence={commercialRecords?.length}
                                totalTabConn={records.reduce(
                                    (sum, record) => sum + (Number(record[12]) || 0),
                                    0,
                                )}
                                name={
                                    "ચાર્ટ તારીજ ૯/ડિ કુલ માંગણાં નો કોમર્શિયલ મિલકતનો રિપોર્ટ"
                                }
                            />
                        </div>

                        <div
                            id="pdf-chart"
                            style={{
                                width: "1300px",
                                padding: "20px",
                                paddingLeft: "60px",
                                paddingTop: "80px",
                                background: "#fff",
                            }}
                        >
                            <WaterTarijChart
                                project={project}
                                total={totalAll}
                                length={records.length}
                                totalResidence={records?.length}
                                totalTabConn={records.reduce(
                                    (sum, record) => sum + (Number(record[12]) || 0),
                                    0,
                                )}
                                name={
                                    "ચાર્ટ તારીજ ૯/ડિ કુલ માંગણાં નો રહેણાંક તથા કોમર્શિયલ (બન્નેનો રિપોર્ટ)"
                                }
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            id="pdf-single"
                            style={{
                                width: "1300px",
                                padding: "20px",
                                paddingLeft: "60px",
                                paddingTop: "80px",
                                background: "#fff",
                            }}
                        >
                            <WaterTarijFormat
                                project={project}
                                total={totalAll}
                                length={records.length}
                                totalTabConn={records.reduce(
                                    (sum, record) => sum + (Number(record[12]) || 0),
                                    0,
                                )}
                                name=""
                            />
                        </div>

                        <div
                            id="pdf-chart"
                            style={{
                                width: "1300px",
                                padding: "20px",
                                paddingLeft: "60px",
                                paddingTop: "80px",
                                background: "#fff",
                            }}
                        >
                            <WaterTarijChart
                                project={project}
                                total={totalNormal}
                                length={normalRecords.length}
                                totalResidence={records?.length}
                                totalTabConn={records.reduce(
                                    (sum, record) => sum + (Number(record[12]) || 0),
                                    0,
                                )}
                                name={"ચાર્ટ તારીજ કુલ માંગણાં નો રિપોર્ટ (તારીજ)"}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TarijReport;
