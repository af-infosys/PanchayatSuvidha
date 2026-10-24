import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { useAuth } from "../../config/AuthContext.js";
import apiPath from "../../isProduction.js";
import { Download, CornerUpLeft } from "lucide-react";
import { toast } from "react-toastify";
import TinyLoader from "../../components/TinyLoader/TinyLoader.jsx";
import numberToGujaratiWords from "../../components/numberToGujaratiWords.js";
import toGujaratiNumber from "../../components/toGujaratiNumber.js";

// Date formatter to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

const WaterReceiptDownload = () => {
  const { mId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const receiptRef = useRef();

  const [projectId, setProjectId] = useState(null);
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState({
    gaam: "",
    taluka: "",
    jilla: "",
    name: "",
    date: "",
    receiptNo: "",
    prevAmount: "",
    currAmount: "",
    totalAmount: "",
  });

  // 1. Fetch Project ID based on User
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
    } catch (error) {
      console.error("Error fetching work:", error);
      toast.error("Error Fetching Work");
    }
  };

  // 2. Fetch Project Info & Specific Row Record
  const fetchProjectAndRecord = async () => {
    try {
      setLoading(true);

      // Fetch Project for Gaam, Taluka, Jilla
      const projRes = await axios.get(
        `${await apiPath()}/api/work/project/${projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const projData = projRes.data?.data || {};
      console.log("Project Data:", projData);
      setSignature(projData?.other?.signature || null);

      // Fetch Record for Owner Name and Receipt Data
      const recRes = await fetch(
        `${await apiPath()}/api/sheet/${mId}?workId=${projectId}`,
      );
      if (!recRes.ok) throw new Error("Failed to fetch record");

      const result = await recRes.json();
      const record = result.data;

      if (record) {
        // Parse Receipt array from record[24]
        const record24 =
          typeof record[24] === "string"
            ? JSON.parse(record[24] || "{}")
            : record[24] || {};
        const savedReceipts = record24.receipt ?? record24.receipts ?? [];
        const receiptArray = Array.isArray(savedReceipts)
          ? savedReceipts
          : [savedReceipts];

        // Pick the latest receipt for printing
        const latestReceipt = receiptArray[receiptArray.length - 1] || {};

        // Parse special_water tax as default values
        const prevVasulat = Number(
          JSON.parse(record[23] || "{}")?.special_water?.vasulat || 0,
        );
        const currVasulat = Number(
          JSON.parse(record[21] || "{}")?.special_water?.vasulat || 0,
        );

        // Split Tax Year for header (e.g., "૨૦૨૫/૨૬" => Prefix "૨૫", Suffix "૨૬")
        const taxYear = projData?.details?.taxYear || "";

        // Final amounts mapped (Falling back to receipt amount if Vasulat is 0)
        const totalAmt = latestReceipt.amount || prevVasulat + currVasulat || 0;

        setReceiptData({
          gaam: projData?.spot?.gaam || "",
          taluka: projData?.spot?.taluka || "",
          jilla: projData?.spot?.district || "",
          name: record[3] || "—",
          date: formatDate(latestReceipt.date) || "—",
          receiptNo: latestReceipt.pNo || "—",
          year: taxYear,
          prevAmount: prevVasulat ? prevVasulat : "-",
          currAmount: currVasulat ? currVasulat : totalAmt,
          totalAmount: totalAmt,
        });
      }
    } catch (err) {
      console.error("Error fetching record:", err);
      toast.error("રેકોર્ડ લાવવામાં નિષ્ફળ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWork();
  }, [user]);

  useEffect(() => {
    if (projectId && mId) {
      fetchProjectAndRecord();
    }
  }, [projectId, mId]);

  // Handle A4 PDF Download
  const handleDownloadPDF = async () => {
    const element = receiptRef.current;

    // Generate Canvas
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    // A4 Size configuration
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Receipt_${receiptData.name}_${receiptData.receiptNo}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <TinyLoader />
        <p className="mt-4 text-gray-600 font-medium">
          રેકોર્ડ લોડ થઈ રહ્યા છે...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen py-10">
      {/* Top Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 transition"
        >
          <CornerUpLeft size={18} className="mr-2" />
          Back
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition font-bold"
        >
          <Download size={18} className="mr-2" />
          Download A4 Receipt
        </button>
      </div>

      {/* A4 Size Receipt Container */}
      <div
        ref={receiptRef}
        style={{
          width: "210mm", // A4 Document Width
          minHeight: "297mm", // A4 Document Height
          backgroundColor: "white",
          padding: "50px 40px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          fontFamily: "sans-serif",
          color: "#000",
          boxSizing: "border-box",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
            position: "relative",
          }}
        >
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "28px",
              color: "#374151",
              fontWeight: "bold",
            }}
          >
            શ્રી ગ્રામ્ય જળ અને સ્વચ્છતા સમિતિ.
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#000",
              fontWeight: "500",
            }}
          >
            મુ.{" "}
            <span style={{ color: "#4b5563", fontWeight: "600" }}>
              {receiptData.gaam}
            </span>
            &nbsp;&nbsp;&nbsp; તા.{" "}
            <span style={{ color: "#4b5563", fontWeight: "600" }}>
              {receiptData.taluka}
            </span>
            &nbsp;&nbsp;&nbsp; જી.{" "}
            <span style={{ color: "#4b5563", fontWeight: "600" }}>
              {receiptData.jilla}
            </span>
          </p>
        </div>

        {/* Details Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            fontSize: "18px",
          }}
        >
          <div style={{ flex: 1 }}>
            શ્રી <u style={{ padding: "0 5px" }}>{receiptData.name}</u>
          </div>
          <div>
            તા.{" "}
            <u style={{ padding: "0 5px" }}>
              {toGujaratiNumber(
                receiptData.date || "______________________________",
              )}
            </u>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            fontSize: "18px",
          }}
        >
          <div>
            પહોંચ નં.{" "}
            <span
              style={{
                color: "#dc2626",
                fontWeight: "bold",
                marginLeft: "10px",
              }}
            >
              {toGujaratiNumber(receiptData.receiptNo)}
            </span>
          </div>
          <div>
            વર્ષ &nbsp;&nbsp;&nbsp;
            {receiptData.year
              ? toGujaratiNumber(receiptData.year)
              : "20_____- 20_____"}
          </div>
        </div>

        {/* Table Section */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "2px solid #000",
            marginBottom: "15px",
            fontSize: "16px",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...tableStyles.th, maxWidth: "10px" }}>
                <span className="formatting">અનુ.</span>
              </th>
              <th style={{ ...tableStyles.th, maxWidth: "60px" }}>
                <span className="formatting">વિગત</span>
              </th>
              <th style={tableStyles.th}>
                <span className="formatting">પાછલી</span>
              </th>
              <th style={tableStyles.th}>
                <span className="formatting">ચાલુ</span>
              </th>
              <th style={tableStyles.th}>
                <span className="formatting">કુલ</span>
              </th>
            </tr>
            {/* <tr>
              <th style={tableStyles.th}>રૂ.</th>
              <th style={tableStyles.th}>પૈ.</th>
              <th style={tableStyles.th}>રૂ.</th>
              <th style={tableStyles.th}>પૈ.</th>
              <th style={tableStyles.th}>રૂ.</th>
              <th style={tableStyles.th}>પૈ.</th>
            </tr> */}
          </thead>
          <tbody>
            <tr>
              <td style={tableStyles.tdCenter}>
                <span className="formatting">૧ </span>
              </td>
              <td style={{ ...tableStyles.td, maxWidth: "60px" }}>
                <span className="formatting">નળ કનેકશન ફી</span>
              </td>
              <td style={tableStyles.tdCenter}>
                <span className="formatting" style={{ fontWeight: "bold" }}>
                  {toGujaratiNumber(receiptData.prevAmount)}
                </span>
              </td>

              <td style={tableStyles.tdCenter}>
                <span className="formatting" style={{ fontWeight: "bold" }}>
                  {toGujaratiNumber(receiptData.currAmount)}/-
                </span>
              </td>

              <td style={tableStyles.tdCenter}>
                <span className="formatting" style={{ fontWeight: "bold" }}>
                  {toGujaratiNumber(receiptData.totalAmount)}/-
                </span>
              </td>
            </tr>
            <tr>
              <td style={tableStyles.tdCenter}>
                <span className="formatting">૨</span>
              </td>
              <td style={{ ...tableStyles.td, maxWidth: "60px" }}>
                <span className="formatting">લેઈટ ફી (દંડ)</span>
              </td>
              <td style={tableStyles.tdCenter}></td>
              <td style={tableStyles.tdCenter}></td>
              <td style={tableStyles.tdCenter}></td>
            </tr>
            <tr>
              <td style={tableStyles.tdCenter}>
                <span className="formatting">૩</span>
              </td>
              <td style={{ ...tableStyles.td, maxWidth: "60px" }}>
                <span className="formatting">નવા નળ કનેકશન ફી</span>
              </td>
              <td style={tableStyles.tdCenter}></td>
              <td style={tableStyles.tdCenter}></td>
              <td style={tableStyles.tdCenter}></td>
            </tr>
            <tr>
              <td style={tableStyles.tdCenter}>
                <span className="formatting">૪</span>
              </td>
              <td style={{ ...tableStyles.td, maxWidth: "60px" }}>
                <span className="formatting">નોટીસ ફી</span>
              </td>
              <td style={tableStyles.tdCenter}></td>
              <td style={tableStyles.tdCenter}></td>
              <td style={tableStyles.tdCenter}></td>
            </tr>
          </tbody>
        </table>

        {/* Total Amount in Words */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            border: "2px solid #000",
            padding: "10px",
            marginTop: "-17px",
            borderTop: "none",
            fontSize: "18px",
          }}
        >
          <div>
            અંકે{" "}
            <u style={{ padding: "0 5px" }}>
              {numberToGujaratiWords(receiptData.totalAmount)}
            </u>
          </div>
          <div style={{ fontWeight: "bold" }}>
            કુલ રૂા...{" "}
            <u style={{ padding: "0 10px" }}>
              {toGujaratiNumber(receiptData.totalAmount)}/-
            </u>
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "40px",
            fontSize: "16px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={`https://lh3.googleusercontent.com/u/0/d/${signature}`}
              alt={`${signature} Signature`}
              style={{
                width: "auto",
                height: "auto",
                maxHeight: "60px",
                objectFit: "cover",
              }}
              // crossOrigin="anonymous" //  important for pdf
              onError={(e) => {
                console.error("Image failed to load for ID:", signature);
              }}
            />
            <div style={{ fontWeight: "bold" }}>નાણા સ્વીકારનારની સહી</div>
            <div style={{ height: "50px" }}></div>
          </div>
        </div>

        {/* Instructions Panel */}
        <div
          style={{
            marginTop: "5px",
            padding: "15px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        >
          <div
            style={{
              backgroundColor: "#374151",
              color: "white",
              padding: "5px 20px",
              borderRadius: "20px",
              display: "inline-block",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            <span className="formatting">સૂચના</span>
          </div>

          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              fontSize: "15px",
              lineHeight: "1.8",
              color: "#1f2937",
            }}
          >
            <li>
              ૧. કનેકશન ઉપર મોટર મુકીને પાણી ખેંચશે તો રૂા. પ૦૦ દંડ સહીત મોટર
              જપ્ત કરવામાં આવશે, માટે કોઈએ મોટર મુકવી નહી.
            </li>

            <li>
              ૨. શ્રી ગ્રામ્ય જળ અને સ્વચ્છતા સમિતીની મંજુરી વગર કોઈએ પાઈપ લાઈન
              ખોદવી નહી અને ખોદાણ કામ કરશે તો પાણી સમિતી નક્કી કરે તે દંડ ભરવાનો
              રહેશે.
            </li>

            <li>
              ૩. શ્રી ગ્રામ્ય જળ અને સ્વચ્છતા સમિતીએ નક્કી કરેલ સમય પ્રમાણે બીલ
              ભરવાનું રહેશે.
            </li>

            <li>૪. કનેકશન ધરાવતા દરેક ગ્રાહકે કાયદાનું પાલન કરવાનું રહેશે.</li>

            <li>૫. ભુલ ચુક લેવી દેવી.</li>
          </ol>
        </div>

        {/* Bottom Designation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          <div></div>
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={`https://lh3.googleusercontent.com/u/0/d/${signature}`}
              alt={`${signature} Signature`}
              style={{
                width: "auto",
                height: "auto",
                maxHeight: "60px",
                objectFit: "cover",
              }}
              // crossOrigin="anonymous" //  important for pdf
              onError={(e) => {
                console.error("Image failed to load for ID:", signature);
              }}
            />
            <div style={{ marginBottom: "5px" }}>અધ્યક્ષ</div>
            <div>શ્રી ગ્રામ્ય જળ અને સ્વચ્છતા સમિતી</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline Styles for Table Borders
const tableStyles = {
  th: {
    border: "1px solid #000",
    padding: "10px",
    textAlign: "center",
    backgroundColor: "#f9fafb",
  },
  td: { border: "1px solid #000", padding: "10px" },
  tdCenter: { border: "1px solid #000", padding: "10px", textAlign: "center" },
};

export default WaterReceiptDownload;
