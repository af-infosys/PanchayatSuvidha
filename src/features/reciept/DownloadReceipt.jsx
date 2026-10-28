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

// Component for rendering blank underline if value is missing
const DataField = ({
  value,
  minWidth = "100px",
  color = "#000",
  isBold = false,
  isNumeric = false,
}) => {
  const hasValue =
    value !== undefined &&
    value !== null &&
    value.toString().trim() !== "" &&
    value !== "-" &&
    value !== "—";
  const displayValue = hasValue
    ? isNumeric
      ? toGujaratiNumber(value)
      : value
    : "";

  return (
    <span
      style={{
        display: "inline-block",
        minWidth: minWidth,
        borderBottom: "1px solid #000",
        padding: "0 5px",
        textAlign: "center",
        fontWeight: isBold ? "bold" : "normal",
        color: hasValue ? color : "transparent",
        margin: "0 2px",
        paddingBottom: "6px",
      }}
    >
      {displayValue || "\u00A0"}
    </span>
  );
};

const WaterReceiptDownload = () => {
  const { mId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const receiptsWrapperRef = useRef();

  const [projectId, setProjectId] = useState(null);
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(true);

  const [commonData, setCommonData] = useState({
    gaam: "",
    taluka: "",
    jilla: "",
    name: "",
    mobile: "",
    connNo: "",
    oldConn: "",
    area: "",
    yearPrefix: "",
    yearSuffix: "",
  });

  const [receiptsList, setReceiptsList] = useState([]);

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

      // Fetch Project
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
      setSignature(projData?.other?.signature || null);

      // Fetch Record
      const recRes = await fetch(
        `${await apiPath()}/api/sheet/${mId}?workId=${projectId}`,
      );
      if (!recRes.ok) throw new Error("Failed to fetch record");

      const result = await recRes.json();
      const record = result.data;

      if (record) {
        // Split Tax Year
        const taxYear = projData?.details?.taxYear || "";

        setCommonData({
          gaam: projData?.spot?.gaam || "",
          taluka: projData?.spot?.taluka || "",
          jilla: projData?.spot?.district || "",
          name: record[3] || "",
          mobile: record[6] || "",
          connNo: record[2] || "",
          oldConn: record[5] || "",
          area: record[1] || "",
          taxYear,
        });

        // Smart Distribution of Receipts Logic
        const prevDemand = Number(
          JSON.parse(record[23] || "{}")?.special_water?.prev || 0,
        );

        const record24 =
          typeof record[24] === "string"
            ? JSON.parse(record[24] || "{}")
            : record[24] || {};
        const savedReceipts = record24.receipt ?? record24.receipts ?? [];
        const receiptArray = Array.isArray(savedReceipts)
          ? savedReceipts
          : [savedReceipts];

        let remainingPrevDemand = prevDemand;

        const processedReceipts = receiptArray
          .filter((r) => r && Object.keys(r).length > 0)
          .map((rect) => {
            const amt = Number(rect.amount) || 0;
            let appliedPrev = 0;
            let appliedCurr = 0;

            if (remainingPrevDemand > 0) {
              if (amt <= remainingPrevDemand) {
                appliedPrev = amt;
                remainingPrevDemand -= amt;
              } else {
                appliedPrev = remainingPrevDemand;
                appliedCurr = amt - remainingPrevDemand;
                remainingPrevDemand = 0; // Cleared
              }
            } else {
              appliedCurr = amt;
            }

            return {
              pNo: rect.pNo || "",
              date: formatDate(rect.date),
              totalAmount: amt > 0 ? amt : "",
              amountInWords:
                amt > 0 ? numberToGujaratiWords(amt) + " રૂપિયા પૂરા" : "",
              appliedPrev: appliedPrev > 0 ? appliedPrev : "-",
              appliedCurr: appliedCurr > 0 ? appliedCurr : "-",
            };
          });

        // Ensure at least one blank receipt prints if data is empty
        if (processedReceipts.length === 0) {
          processedReceipts.push({
            pNo: "",
            date: "",
            totalAmount: "",
            amountInWords: "",
            appliedPrev: "-",
            appliedCurr: "-",
          });
        }

        setReceiptsList(processedReceipts);
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

  // Handle Multi-page A4 PDF Download
  const handleDownloadPDF = async () => {
    const pdf = new jsPDF("l", "mm", "a4");
    const pages = document.querySelectorAll(".receipt-page-container");

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(
      `Receipts_${commonData.name || "Blank"}_${commonData.connNo || "No"}.pdf`,
    );
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

  // Common receipt component layout that renders either side (Scaled Down)
  const ReceiptLayout = ({ receipt, copyType }) => (
    <div
      style={{
        flex: 1,
        border: "2px solid #000",
        height: "100%",
        padding: "10px", // Reduced padding
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        color: "#000",
        position: "relative",
      }}
    >
      {/* Copy Type Tag (Top Left Corner) */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          fontSize: "12px",
          fontWeight: "bold",
          borderRadius: "3px",
          paddingLeft: "5px",
        }}
      >
        {copyType}
      </div>

      {/* Header Section */}
      <div
        style={{
          textAlign: "center",
          marginTop: "10px",
          marginBottom: "10px",
          position: "relative",
        }}
      >
        <h1
          style={{
            margin: "10px 0 3px 0",
            fontSize: "20px",
            color: "#374151",
            fontWeight: "bold",
          }}
        >
          શ્રી {commonData.gaam} ગ્રામ્ય જળ અને સ્વચ્છતા સમિતિ.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#000",
            fontWeight: "500",
          }}
        >
          મુ.{" "}
          <span style={{ color: "#4b5563", fontWeight: "600" }}>
            {commonData.gaam}
          </span>{" "}
          &nbsp;&nbsp; તા.{" "}
          <span style={{ color: "#4b5563", fontWeight: "600" }}>
            {commonData.taluka}
          </span>{" "}
          &nbsp;&nbsp; જી.{" "}
          <span style={{ color: "#4b5563", fontWeight: "600" }}>
            {commonData.jilla}
          </span>
        </p>
      </div>

      {/* DETAILS BLOCK */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginBottom: "10px",
          fontSize: "13px",
        }}
      >
        {/* Line 1: Name & Mobile */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "baseline" }}>
            <span>શ્રી</span>
            <DataField
              value={commonData.name}
              minWidth="180px"
              isGujarati={false}
            />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span>મો.</span>
            <DataField
              value={commonData.mobile}
              minWidth="150px"
              isNumeric={true}
            />
          </div>
        </div>

        {/* Line 2: Receipt No, Connection No, Date */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            પહોંચ નં.{" "}
            <DataField
              value={receipt.pNo}
              minWidth="50px"
              isNumeric={true}
              color="#dc2626"
              isBold={true}
            />
          </div>
          <div>
            નળ કનેક્શન નં.{" "}
            <DataField
              value={commonData.connNo}
              minWidth="50px"
              isNumeric={true}
            />
          </div>
          <div>
            તા.{" "}
            <DataField value={receipt.date} minWidth="70px" isNumeric={true} />
          </div>
        </div>

        {/* Line 3: Area Name, Year */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            વિસ્તારનું નામ{" "}
            <DataField
              value={commonData.area}
              minWidth="130px"
              isGujarati={false}
            />
          </div>
          <div>
            વર્ષ{" "}
            {commonData?.taxYear ? (
              <DataField
                value={commonData?.taxYear}
                minWidth="30px"
                isNumeric={true}
              />
            ) : (
              <>
                {" "}
                ૨૦ <DataField value={""} minWidth="15px" isNumeric={true} />
                ૨૦
                <DataField value={""} minWidth="15px" isNumeric={true} />
              </>
            )}
          </div>
        </div>

        {/* Line 4: Old Connection No */}
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div>
            જૂનો નળ કનેક્શન નં.{" "}
            <DataField
              value={commonData.oldConn}
              minWidth="60px"
              isNumeric={true}
            />
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "2px solid #000",
          marginBottom: "8px",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr>
            <th style={tableStyles.th}>
              <span className="formatting">અનુ.</span>
            </th>
            <th style={tableStyles.th}>
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
        </thead>
        <tbody>
          <tr>
            <td style={tableStyles.tdCenter}>
              <span className="formatting">૧</span>
            </td>
            <td style={tableStyles.td}>
              <span className="formatting">નળ કનેકશન ફી</span>
            </td>
            <td style={tableStyles.amountTd}>
              <span className="formatting">
                {toGujaratiNumber(receipt.appliedPrev)}
                {receipt.appliedPrev !== "-" && "/-"}
              </span>
            </td>
            <td style={tableStyles.amountTd}>
              <span className="formatting">
                {toGujaratiNumber(receipt.appliedCurr)}
                {receipt.appliedCurr !== "-" && "/-"}
              </span>
            </td>
            <td style={tableStyles.amountTd}>
              <span className="formatting">
                {toGujaratiNumber(receipt.totalAmount)}
                {receipt.totalAmount !== "" && "/-"}
              </span>
            </td>
          </tr>

          {["૨", "૩", "૪"].map((num, i) => (
            <tr key={i}>
              <td style={tableStyles.tdCenter}>
                <span className="formatting">{toGujaratiNumber(num)}</span>
              </td>
              <td style={tableStyles.td}>
                <span className="formatting">
                  {num === "૨"
                    ? "લેઈટ ફી (દંડ)"
                    : num === "૩"
                      ? "નવા નળ કનેકશન ફી"
                      : "નોટીસ ફી"}
                </span>
              </td>
              <td style={tableStyles.amountTd}></td>
              <td style={tableStyles.amountTd}></td>
              <td style={tableStyles.amountTd}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Amount in Words */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "2px solid #000",
          padding: "6px 8px",
          marginTop: "-10px",
          borderTop: "none",
          fontSize: "13px",
        }}
      >
        <div>
          અંકે{" "}
          <DataField
            value={receipt.amountInWords}
            minWidth="180px"
            isGujarati={false}
          />
        </div>
        <div
          style={{
            fontWeight: "bold",
            fontSize: "16px",
            display: "flex",
            alignItems: "baseline",
          }}
        >
          કુલ રૂા...{" "}
          <DataField
            value={receipt.totalAmount ? receipt.totalAmount + "/-" : ""}
            minWidth="80px"
            isNumeric={true}
            isBold={true}
          />
        </div>
      </div>

      {/* Signatures */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "8px",
          fontSize: "12px",
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
            alt="Signature"
            style={{
              width: "auto",
              height: "auto",
              maxHeight: "25px",
              objectFit: "cover",
              opacity: signature ? 1 : 0,
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div style={{ fontWeight: "bold" }}>નાણા સ્વીકારનારની સહી</div>
          <div style={{ height: "10px" }}></div>
        </div>
      </div>

      {/* Instructions Panel - Scaled Down */}
      <div
        style={{
          padding: "6px 8px",
          backgroundColor: "#f3f4f6",
          borderRadius: "4px",
          border: "1px solid #d1d5db",
        }}
      >
        <div
          style={{
            backgroundColor: "#374151",
            color: "white",
            padding: "2px 10px",
            borderRadius: "10px",
            display: "inline-block",
            fontWeight: "bold",
            marginBottom: "4px",
            fontSize: "11px",
          }}
        >
          <span className="formatting">સૂચના</span>
        </div>
        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            fontSize: "10px",
            lineHeight: "1.3",
            color: "#1f2937",
          }}
        >
          <li style={{ marginBottom: "1px" }}>
            ૧. કનેકશન ઉપર મોટર મુકીને પાણી ખેંચશે તો રૂા. પ૦૦ દંડ સહીત મોટર જપ્ત
            કરવામાં આવશે, માટે કોઈએ મોટર મુકવી નહી.
          </li>
          <li style={{ marginBottom: "1px" }}>
            ૨. શ્રી ગ્રામ્ય જળ અને સ્વચ્છતા સમિતીની મંજુરી વગર કોઈએ પાઈપ લાઈન
            ખોદવી નહી અને ખોદાણ કામ કરશે તો પાણી સમિતી નક્કી કરે તે દંડ ભરવાનો
            રહેશે.
          </li>
          <li style={{ marginBottom: "1px" }}>
            ૩. શ્રી ગ્રામ્ય જળ અને સ્વચ્છતા સમિતીએ નક્કી કરેલ સમય પ્રમાણે બીલ
            ભરવાનું રહેશે.
          </li>
          <li style={{ marginBottom: "1px" }}>
            ૪. કનેકશન ધરાવતા દરેક ગ્રાહકે કાયદાનું પાલન કરવાનું રહેશે.
          </li>
          <li>૫. ભુલ ચુક લેવી દેવી.</li>
        </ol>
      </div>

      {/* Bottom Designation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          fontSize: "12px",
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
            alt="Signature"
            style={{
              width: "auto",
              height: "auto",
              maxHeight: "25px",
              objectFit: "cover",
              opacity: signature ? 1 : 0,
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div style={{ marginBottom: "1px" }}>અધ્યક્ષ</div>
          <div>શ્રી {commonData.gaam} ગ્રામ્ય જળ અને સ્વચ્છતા સમિતી</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen py-10">
      {/* Top Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 transition"
        >
          <CornerUpLeft size={18} className="mr-2" /> Back
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition font-bold"
        >
          <Download size={18} className="mr-2" /> Download A4 PDF
        </button>
      </div>

      {/* Wrapping multiple A4 pages (Landscape) */}
      <div ref={receiptsWrapperRef} className="flex flex-col gap-10">
        {receiptsList.map((receipt, index) => (
          <div
            key={index}
            className="receipt-page-container"
            style={{
              width: "297mm", // Fixed A4 Landscape Width
              height: "210mm", // Fixed A4 Landscape Height
              backgroundColor: "white",
              padding: "5mm", // Outer padding
              boxSizing: "border-box",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              display: "flex", // Flex row for side-by-side
              flexDirection: "row",
              gap: "5mm", // Gap between the two copies
              overflow: "hidden",
            }}
          >
            {/* Left Copy - Grahak Copy */}
            <ReceiptLayout receipt={receipt} copyType="ગ્રાહક કોપી" />

            {/* Right Copy - Office Copy */}
            <ReceiptLayout receipt={receipt} copyType="ઓફિસ કોપી" />
          </div>
        ))}
      </div>
    </div>
  );
};

const tableStyles = {
  th: {
    border: "1px solid #000",
    padding: "4px", // Reduced padding
    textAlign: "center",
    backgroundColor: "#f9fafb",
  },
  td: { border: "1px solid #000", padding: "4px" },
  tdCenter: {
    border: "1px solid #000",
    padding: "4px",
    textAlign: "center",
    width: "25px",
  },
  amountTd: {
    border: "1px solid #000",
    padding: "4px",
    textAlign: "center",
    fontSize: "16px", // Reduced from 18px but still bolder/larger than normal text
    fontWeight: "bold",
    width: "80px",
  },
};

export default WaterReceiptDownload;
