import React, { useState, useEffect } from "react";

import "./SurvayReport.scss";
import toGujaratiNumber from "../../components/toGujaratiNumber";

import apiPath from "../../isProduction";

import jsPDF from "jspdf";

import html2canvas from "html2canvas";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import TaxIndex from "../../components/conver/TaxIndex";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// import Blank9D from "../../components/Blank9D";
import WaterTaxIndexRaw from "../../components/conver/WaterTaxIndexRaw";
import WaterBlank9D from "../../components/WaterBlank9D";
import { useAuth } from "../../config/AuthContext";

const TaxRegister = () => {
  const [count, setCount] = useState(5);
  const [PROPERTIES_PER_PAGE, SetPropertiesPerPage] = useState(5); // એક પેજ પર કેટલી લાઇન બતાવવી

  const scrollToPage = () => {
    const element = document.getElementById(`report-page-${count}`);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    scrollToPage();
  }, [count, setCount]);

  const navigate = useNavigate();
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



  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchRecords = async () => {
    try {
      const response = await fetch(
        `${await apiPath()}/api/dataentry?workId=${projectId}`,
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
  const [projectId, setProjectId] = useState(null);
  const [taxes, setTaxes] = useState([]);

  const fetchProject = async () => {
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
    } catch (error) {
      console.error("Error fetching projects:", error);
      // toast.error(`Error Fetching Projects: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateValue = async () => {
    try {
      setLoading(true);
      toast.info("Calucating Values...");

      const data = await axios.put(
        `${await apiPath()}/api/survey/ordervaluation/${projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log(data?.data?.data || []);
      setProject(data?.data?.data || []);

      toast.success("Calculation Completed.");
    } catch (error) {
      console.error("Error fetching projects:", error);
      // toast.error(`Error Fetching Projects: ${error}`);

    } finally {
      setLoading(false);
    }
  };

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      let fetchedData = await axios.get(
        `${await apiPath()}/api/valuation/tax/${projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      fetchedData = fetchedData?.data?.taxes;

      if (fetchedData && fetchedData.length > 0) {
        setTaxes(fetchedData);
        toast.success("Tax Data Fetched Successfully.");
      } else {
        toast.info("No Tax Data Found! try adding new Data");
      }
    } catch (err) {
      console.error(err);
      // toast.error("Error Fetching Taxes Data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWork();
  }, [user]);

  useEffect(() => {
    if (!projectId) return;

    fetchProject();
    fetchRecords();
    fetchTaxes();
  }, [projectId]);

  const [pdfProgress, setPdfProgress] = useState({
    isGenerating: false,
    isCancelled: false,
    completedPages: 0,
    totalPages: 0,
    percentage: 0,
  });
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

  const CHUNK_SIZE = 5;

  const [chunkStart, setChunkStart] = useState(0);

  const handleDownloadPDF = async () => {
    const totalPages = finalRenderPages.length;

    let totalDuration = 0;

    const startTime = window.performance.now();

    setPdfProgress({
      isGenerating: true,
      isCancelled: false,
      completedPages: 0,
      totalPages,
      percentage: 0,
      timeRemaining: null,
    });

    // Start with first chunk
    setChunkStart(0);

    // Wait React render
    await new Promise((resolve) => setTimeout(resolve, 150));

    const pdf = new jsPDF("landscape", "mm", "legal");

    let currentChunkStart = 0;

    for (let i = 0; i < totalPages; i++) {
      const completedPages = i + 1;
      // setCount(completedPages - 2 || 0);

      // -------------------------
      // Change Chunk if needed
      // -------------------------

      const requiredChunkStart = Math.floor(i / CHUNK_SIZE) * CHUNK_SIZE;

      if (requiredChunkStart !== currentChunkStart) {
        currentChunkStart = requiredChunkStart;

        setChunkStart(requiredChunkStart);

        console.log(
          `Loading chunk ${requiredChunkStart} -> ${requiredChunkStart + CHUNK_SIZE - 1
          }`,
        );

        // Wait React DOM update
        await new Promise((resolve) => setTimeout(resolve, 2800));
      }

      // -------------------------
      // Cancellation Check
      // -------------------------

      const currentState = await new Promise((resolve) => {
        setPdfProgress((prev) => {
          resolve(prev);
          return prev;
        });
      });

      if (currentState.isCancelled) {
        console.log("PDF generation cancelled.");

        break;
      }

      // -------------------------
      // Capture Page
      // -------------------------

      const pageStart = window.performance.now();

      const pageElement = document.getElementById(`report-page-${i}`);

      if (!pageElement) {
        console.error(`Page ${i} not found`);

        continue;
      }

      if (i > 0) {
        pdf.addPage();
      }

      try {
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL("image/jpeg", 1);

        const imgWidth = 355.6;

        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

        const pageEnd = window.performance.now();

        const pageDuration = pageEnd - pageStart;

        totalDuration += pageDuration;

        const percentage = Math.round((completedPages / totalPages) * 100);

        let timeRemaining = null;

        if (completedPages >= 2) {
          const avg = totalDuration / completedPages;

          const pagesRemaining = totalPages - completedPages;

          timeRemaining = Math.max(
            0,
            Math.round((avg * pagesRemaining) / 1000),
          );
        }

        setPdfProgress((prev) => ({
          ...prev,

          completedPages,

          percentage,

          timeRemaining,
        }));
      } catch (error) {
        console.error("Error generating page:", error);

        break;
      }
    }

    // Restore all pages

    setChunkStart(null);

    // Final State

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
      pdf.save("3. Tax_Register.pdf");

      window.alert("PDF successfully saved.");
    } else {
      window.alert("PDF save cancelled.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        ડેટા લોડ થઈ રહ્યો છે...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  // Paginate records into chunks of 15

  // const pages = [];
  // const pageLimit = 6;

  // for (let i = 0; i < records.length; i += pageLimit) {
  //   pages.push(records.slice(i, i + pageLimit));
  // }

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

  // Paginate records into chunks of 6
  // --- CONFIGURATION ---

  const BUNDLE_SIZE = 100;

  const finalRenderPages = buildFinalPages(
    records,
    BUNDLE_SIZE,
    PROPERTIES_PER_PAGE,
  );

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

  function buildFinalPages(allRecords, pagesPerBundle, recordsPerPage) {
    if (!allRecords || allRecords.length === 0) return [];
    // count all tab connection from allRecords[i][12]
    const totalTabConn = allRecords.reduce((sum, record) => {
      return sum + (Number(record[12]) || 0);
    }, 0);

    const final = [];
    const isSeparate = project?.details?.seperatecommercial === true;

    // 🔢 Global page counter (1-based)
    let globalPageNumber = 1;

    // Helper: Split array into chunks
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

      const normalRecords = allRecords.filter((r) => !isCommercialProperty(r));

      const commercialRecords = allRecords.filter((r) =>
        isCommercialProperty(r),
      );

      const normalPages = chunkArray(normalRecords, recordsPerPage);
      const commercialPages = chunkArray(commercialRecords, recordsPerPage);

      let currentBundle = 1;

      // ---------- RESIDENTIAL ----------
      const totalNormalBundles =
        Math.ceil(normalPages.length / pagesPerBundle) || 1;

      for (let b = 1; b <= totalNormalBundles; b++) {
        const start = (b - 1) * pagesPerBundle;
        const end = start + pagesPerBundle;
        const pagesForThisBundle = normalPages.slice(start, end);

        const coverProperties = pagesForThisBundle.reduce(
          (sum, p) => sum + p.length,
          0,
        );

        const pageFrom = globalPageNumber;
        const pageTo = globalPageNumber + pagesForThisBundle.length - 1;

        if (pagesForThisBundle.length > 0) {
          final.push({
            type: "cover",
            bundle: currentBundle,
            name: "રહેણાંક મિલકત",
            commercial: false,
            totalRecords: normalRecords.length,
            section: "residential",
            part: b,
            totalParts: totalNormalBundles,

            fromStart: pagesForThisBundle[0][0][0],
            toEnd:
              pagesForThisBundle[pagesForThisBundle.length - 1][
              pagesForThisBundle[pagesForThisBundle.length - 1].length - 1
              ][0],

            // 👇 NEW
            coverProperties,
            pageFrom,
            pageTo,

            totalTabConn: totalTabConn,
          });
        }

        pagesForThisBundle?.forEach((pageRecs) => {
          final.push({
            type: "page",
            bundle: currentBundle,
            pageIndex: globalPageNumber - 1,
            pageRecords: pageRecs,
            isCommercial: false,
          });
          globalPageNumber++;
        });

        if (pagesForThisBundle.length > 0) currentBundle++;
      }

      if (normalPages?.length > 0) {
        final.push({
          type: "blank",
          isCommercial: false,
        });
        final.push({
          type: "blank",
          isCommercial: false,
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

          const coverProperties = pagesForThisBundle.reduce(
            (sum, p) => sum + p.length,
            0,
          );

          const pageFrom = globalPageNumber;
          const pageTo = globalPageNumber + pagesForThisBundle.length - 1;

          final.push({
            type: "cover",
            bundle: currentBundle,
            name: "કોમર્શિયલ મિલકત",
            commercial: true,
            totalRecords: commercialRecords.length,
            section: "commercial",
            part: b,
            totalParts: totalCommBundles,
            totalNormalBundles: totalNormalBundles,

            fromStart: pagesForThisBundle[0][0][0],
            toEnd:
              pagesForThisBundle[pagesForThisBundle.length - 1][
              pagesForThisBundle[pagesForThisBundle.length - 1].length - 1
              ][0],

            // 👇 NEW
            coverProperties,
            pageFrom,
            pageTo,

            totalTabConn: totalTabConn,
          });

          pagesForThisBundle.forEach((pageRecs) => {
            final.push({
              type: "page",
              bundle: currentBundle,
              pageIndex: globalPageNumber - 1,
              pageRecords: pageRecs,
              isCommercial: true,
            });
            globalPageNumber++;
          });

          currentBundle++;
        }
      }

      final.push({
        type: "blank",
        isCommercial: true,
      });
      final.push({
        type: "blank",
        isCommercial: true,
      });
    } else {
      // ==========================================
      // MIXED MODE
      // ==========================================

      const pages = chunkArray(allRecords, recordsPerPage);
      const totalBundles = Math.ceil(pages.length / pagesPerBundle);

      for (let bundle = 1; bundle <= totalBundles; bundle++) {
        const start = (bundle - 1) * pagesPerBundle;
        const end = start + pagesPerBundle;
        const pagesForThisBundle = pages.slice(start, end);

        const coverProperties = pagesForThisBundle.reduce(
          (sum, p) => sum + p.length,
          0,
        );

        const pageFrom = globalPageNumber;
        const pageTo = globalPageNumber + pagesForThisBundle.length - 1;

        final.push({
          type: "cover",
          bundle,
          name: "",
          part: bundle,
          totalParts: totalBundles,

          fromStart: pagesForThisBundle[0][0][0],
          toEnd:
            pagesForThisBundle[pagesForThisBundle.length - 1][
            pagesForThisBundle[pagesForThisBundle.length - 1].length - 1
            ][0],

          // 👇 NEW
          coverProperties,
          pageFrom,
          pageTo,

          totalTabConn: totalTabConn,
        });

        pagesForThisBundle.forEach((records) => {
          final.push({
            type: "page",
            bundle,
            pageIndex: globalPageNumber - 1,
            pageRecords: records,
          });
          globalPageNumber++;
        });
      }

      final.push({
        type: "blank",
      });

      final.push({
        type: "blank",
      });
    }

    return final;
  }

  const handleDownloadExcel = () => {
    // Safe parsing helper function
    const safeParse = (val) => {
      try {
        return JSON.parse(val || "{}");
      } catch (e) {
        return {};
      }
    };

    const getNum = (val) => Number(val) || 0;

    // 1. Title Row
    const titleRow = [
      [
        `ગ્રામ્ય જળ અને સ્વચ્છતા સમિતિ - ખાસ પાણી નળ વેરા રજીસ્ટર વર્ષ ${project?.details?.taxYear || "2025/26"
        }`,
      ],
    ];

    // 2. Location Row (Distributed in 12 columns)
    const locationRow = [
      [
        `ગામ:- ${project?.spot?.gaam || ""}`, "", "", "",
        `તાલુકો:- ${project?.spot?.taluka || ""}`, "", "", "",
        `જિલ્લો:- ${project?.spot?.district || ""}`, "", "", "",
      ],
    ];

    // 3. Header Row (12 Columns exactly as per HTML table)
    const headerRow1 = [
      "ક્રમ નંબર",
      "વિસ્તારનું નામ",
      "કનેકશન નંબર",
      "નળ ધારકનું નામ તથા મોબાઈલ નંબર",
      "જુનો કનેક્શન નંબર",
      "નળની સંખ્યા",
      "પહોચ નં. / તારીખ રકમ",
      "વિગત",
      "પા.બા",
      "ચાલુ",
      "કુલ",
      "નોંધ",
    ];

    // 4. Numbering Row (1 to 12)
    const headerNumbers = [Array.from({ length: 12 }, (_, i) => i + 1)];

    const dataRows = [];

    // Merges configuration
    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Title span 12 cols
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },  // ગામ span
      { s: { r: 1, c: 4 }, e: { r: 1, c: 7 } },  // તાલુકો span
      { s: { r: 1, c: 8 }, e: { r: 1, c: 11 } }, // જિલ્લો span
    ];

    // Data starts at row index 4 (0: Title, 1: Location, 2: Header, 3: Numbers)
    let currentRowIndex = 4;

    // Variables for Grand Totals
    const grandTotals = {
      d_pb: 0, d_chalu: 0, d_kul: 0,
      r_pb: 0, r_chalu: 0, r_kul: 0,
      b_pb: 0, b_chalu: 0, b_kul: 0,
    };

    records?.forEach((record) => {
      const parsed21 = safeParse(record[21]);
      const parsed23 = safeParse(record[23]);
      const parsed24 = safeParse(record[24]);

      // Extract Common Record Info
      const kram = getNum(record[2]);
      const area = record[1] || "";
      const conn = getNum(record[0]);
      const nameMob = `${record[3] || ""}\n${record[6] || ""}`.trim();
      const oldConn = getNum(record[5]);
      const taps = getNum(record[12]);
      const note = record[14] || "";

      // Receipt details extraction
      const receipts = parsed24?.receipt;
      let pNo = "", dateStr = "", amountStr = "";

      const formatDate = (date) =>
        date ? date.replace(/"/g, "").trim().split("-").reverse().join("/") : "";

      if (Array.isArray(receipts)) {
        pNo = receipts.map((r) => r?.pNo).filter(Boolean).join(", ");
        dateStr = receipts.map((r) => formatDate(r?.date)).filter(Boolean).join(", ");
        amountStr = receipts.map((r) => r?.amount).filter(Boolean).join(", ");
      } else if (receipts) {
        pNo = receipts?.pNo || "";
        dateStr = formatDate(receipts?.date);
        amountStr = receipts?.amount || "";
      }

      // Calculations for Special Water Tax (as per HTML logic)
      const d_pb = getNum(parsed23?.special_water?.prev);
      const d_chalu = getNum(parsed21?.special_water?.curr);
      const d_kul = d_pb + d_chalu;

      const r_pb = getNum(parsed23?.special_water?.vasulat);
      const r_chalu = getNum(parsed21?.special_water?.vasulat);
      const r_kul = r_pb + r_chalu;

      const b_pb = d_pb - r_pb;
      const b_chalu = d_chalu - r_chalu;
      const b_kul = b_pb + b_chalu;

      // Update Grand Totals
      grandTotals.d_pb += d_pb;
      grandTotals.d_chalu += d_chalu;
      grandTotals.d_kul += d_kul;
      grandTotals.r_pb += r_pb;
      grandTotals.r_chalu += r_chalu;
      grandTotals.r_kul += r_kul;
      grandTotals.b_pb += b_pb;
      grandTotals.b_chalu += b_chalu;
      grandTotals.b_kul += b_kul;

      // ====== ROW 1: માંગણું ======
      const row1 = [
        kram, area, conn, nameMob, oldConn, taps, pNo, "માંગણું", d_pb, d_chalu, d_kul, note
      ];

      // ====== ROW 2: વસુલાત ======
      const row2 = [
        "", "", "", "", "", "", dateStr, "વસુલાત", r_pb, r_chalu, r_kul, ""
      ];

      // ====== ROW 3: બાકી ======
      const row3 = [
        "", "", "", "", "", "", amountStr, "બાકી", b_pb, b_chalu, b_kul, ""
      ];

      dataRows.push(row1, row2, row3);

      // Vertical Merges (spanning 3 rows) for columns: 0, 1, 2, 3, 4, 5, and 11
      [0, 1, 2, 3, 4, 5, 11].forEach((colIndex) => {
        merges.push({
          s: { r: currentRowIndex, c: colIndex },
          e: { r: currentRowIndex + 2, c: colIndex },
        });
      });

      currentRowIndex += 3;
    });

    // ====== FOOTER ROWS (Grand Totals) ======
    const footerRow1 = [
      "પાનાનું કુલ", "", "", "", "", "", "", "માંગણું",
      grandTotals.d_pb, grandTotals.d_chalu, grandTotals.d_kul, ""
    ];
    const footerRow2 = [
      "", "", "", "", "", "", "", "વસુલાત",
      grandTotals.r_pb, grandTotals.r_chalu, grandTotals.r_kul, ""
    ];
    const footerRow3 = [
      "", "", "", "", "", "", "", "બાકી",
      grandTotals.b_pb, grandTotals.b_chalu, grandTotals.b_kul, ""
    ];

    dataRows.push(footerRow1, footerRow2, footerRow3);

    // Merge Footer Text "પાનાનું કુલ" across col 0 to 6
    merges.push({
      s: { r: currentRowIndex, c: 0 },
      e: { r: currentRowIndex + 2, c: 6 },
    });

    // Merge Note block in footer
    merges.push({
      s: { r: currentRowIndex, c: 11 },
      e: { r: currentRowIndex + 2, c: 11 },
    });

    // Combine all arrays
    const worksheetData = [
      ...titleRow,
      ...locationRow,
      headerRow1,
      ...headerNumbers,
      ...dataRows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet["!merges"] = merges;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Water Tax Register");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(file, "Water_Tax_Register.xlsx");
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          disabled={pdfProgress.isGenerating} // Disable button while generating
        >
          {pdfProgress.isGenerating ? "Generating..." : "Download PDF"}
        </button>

        <button
          onClick={handleDownloadExcel}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 disabled:opacity-50"
        >
          Download Excel
        </button>
      </div>
      {pdfProgress.isGenerating && (
        // Progress Modal/Overlay
        <div className="fixed inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="p-2 rounded-xl shadow-2xl w-full max-w-sm bg-white">
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
              disabled={pdfProgress.isCancelled}
            >
              {pdfProgress.isCancelled ? "Cancelling..." : "Cancel Generation"}
            </button>
          </div>
        </div>
      )}
      <br /> <br />
      <button
        onClick={() => navigate(`/survay/watertaxform/${projectId}`)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Water Tax Entry Form
      </button>
      <br /> <br />
      <button
        onClick={calculateValue}
        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
      >
        Start Calculate
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
        style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          gap: "20px",

          position: "sticky",
          top: "20px",
          right: "20px",
          marginBottom: "30px",
          width: "100%",
          zIndex: "999",
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
      <br />
      <br />
      <div className="pdf-report-container">
        {!finalRenderPages ? "Loading" : null}

        {finalRenderPages.map((item, idx) => {
          if (
            pdfProgress.isGenerating &&
            (idx < chunkStart || idx >= chunkStart + CHUNK_SIZE)
          ) {
            return null;
          }

          const id = `report-page-${idx}`;

          if (item.type === "cover") {
            return (
              <div
                key={id}
                id={id}
                className={`report-page legal-landscape-dimensions ${project?.other?.status === "completed" && "cover-bg"}`}
                style={{
                  paddingLeft: "80px",
                  paddingRight: "50px",
                  maxHeight: "800px",
                }}
              >
                {project?.other?.status === "completed" ? (
                  <TaxIndex
                    part={item.bundle}
                    project={project}
                    totalHoouse={records?.length}
                    taxes={taxes}
                    title={item?.name} // Pass the dynamic title (Residential/Commercial)
                    commercial={item.commercial}
                    totalNormalBundles={item.totalNormalBundles || ""}
                    coverProperties={item.coverProperties}
                    pageFrom={item.pageFrom}
                    pageTo={item.pageTo}
                    fromStart={item.fromStart}
                    toEnd={item.toEnd}
                  />
                ) : (
                  <WaterTaxIndexRaw
                    part={item.bundle}
                    project={project}
                    totalHoouse={records?.length}
                    taxes={taxes}
                    title={item?.name} // Pass the dynamic title (Residential/Commercial)
                    commercial={item.commercial}
                    totalNormalBundles={item.totalNormalBundles || ""}
                    coverProperties={item.coverProperties}
                    pageFrom={item.pageFrom}
                    pageTo={item.pageTo}
                    fromStart={item.fromStart}
                    toEnd={item.toEnd}
                    totalTabConn={item?.totalTabConn || 0}
                  />
                )}
              </div>
            );
          }

          if (item.type === "blank") {
            return <WaterBlank9D item={item} project={project} id={id} />;
          }

          return (
            <div
              key={id}
              id={id}
              className="report-page legal-landscape-dimensions"
              style={{
                width: "1550px",
                paddingTop: "55px",
                paddingLeft: "50px",
                paddingRight: "50px",
                margin: "0 auto", // Centre alignment ke liye
              }}
            >
              <div
                className="watermark"
                style={{ minHeight: "100%", position: "relative" }}
              >
                <div className="page-header-container">
                  <span
                    className="page-number"
                    style={{
                      fontSize: "20px",
                      transform: "translate(80px, 42px)",
                      color: "#000",
                    }}
                  >
                    પાના નં. {toGujaratiNumber(item.pageIndex + 1)}
                  </span>

                  <h1 className="heading" style={{ marginTop: "32px" }}>
                    ગ્રામ્ય જળ અને સ્વચ્છતા સમિતિ - ખાસ પાણી નળ વેરા રજીસ્ટર
                    વર્ષ {project?.details?.taxYear || "૨૦૨૫/૨૬"}
                  </h1>

                  <div
                    className="location-info"
                    style={{
                      fontSize: "18px",
                      paddingInline: "50px",
                      marginTop: "5px",
                    }}
                  >
                    <span>ગામ:- {project?.spot?.gaam}</span>
                    <span>તાલુકો:- {project?.spot?.taluka}</span>
                    <span>જિલ્લો:- {project?.spot?.district}</span>
                  </div>
                </div>

                <table
                  className="report-table tax-register-table"
                  id="pdff"
                  style={{
                    background: "transparent",
                    borderCollapse: "collapse",
                    width: "100%",
                  }}
                >
                  <thead className="thead">
                    <tr>
                      <th className="th" style={{ maxWidth: "45px" }}>
                        <span className="formatting">ક્રમ નંબર</span>
                      </th>
                      <th className="th" style={{ maxWidth: "90px" }}>
                        <span className="formatting">વિસ્તારનું નામ</span>
                      </th>
                      <th className="th" style={{ maxWidth: "45px" }}>
                        <span className="formatting"> કનેકશન નંબર </span>
                      </th>
                      <th className="th" style={{ maxWidth: "160px" }}>
                        <span className="formatting">
                          નળ ધારકનું નામ તથા મોબાઈલ નંબર
                        </span>
                      </th>
                      <th className="th" style={{ maxWidth: "45px" }}>
                        <span className="formatting"> જુનો કનેક્શન નંબર </span>
                      </th>
                      <th className="th" style={{ maxWidth: "45px" }}>
                        <span className="formatting"> નળની સંખ્યા </span>
                      </th>
                      <th
                        className="th"
                        style={{ minWidth: "70px", maxWidth: "70px" }}
                      >
                        <span className="formatting">પહોચ નં. / તારીખ રકમ</span>
                      </th>
                      <th className="th" style={{ maxWidth: "90px" }}>
                        <span className="formatting"> વિગત </span>
                      </th>
                      <th className="th">
                        <span className="formatting"> પા.બા </span>
                      </th>
                      <th className="th">
                        <span className="formatting"> ચાલુ </span>
                      </th>
                      <th className="th">
                        <span className="formatting"> કુલ </span>
                      </th>
                      <th className="th">
                        <span className="formatting"> નોંધ </span>
                      </th>
                    </tr>

                    <tr>
                      {Array.from({ length: 11 }).map((_, index) => (
                        <th
                          className="text-xs font-medium uppercase tracking-wider"
                          style={{
                            textAlign: "center",
                            color: "black",
                            background: "white",
                          }}
                          key={index}
                        >
                          <span className="formatting">{index + 1}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {item.pageRecords.map((record, index) => {
                    return (
                      // Yahan tbody me border-bottom lagaya gaya hai
                      // taaki har 3 row ke baad (1 record hone par) ek bold divider line aaye.
                      <tbody
                        key={index}
                        style={{ borderBottom: "3px solid #000" }}
                      >
                        <tr style={{ maxHeight: "3px" }}>
                          <td
                            rowSpan="3"
                            style={{
                              textAlign: "center",
                              verticalAlign: "top",
                              maxWidth: "30px",
                              paddingTop: "5px",
                            }}
                          >
                            <span className="formatting">
                              {toGujaratiNumber(record[2])}
                            </span>
                          </td>

                          <td
                            rowSpan="3"
                            style={{ verticalAlign: "top", paddingTop: "5px" }}
                          >
                            <span className="formatting">{record[1]}</span>
                          </td>

                          <td
                            rowSpan="3"
                            style={{
                              textAlign: "center",
                              verticalAlign: "top",
                              maxWidth: "30px",
                              paddingTop: "5px",
                            }}
                          >
                            <span className="formatting">
                              {toGujaratiNumber(Number(record[0] || 0) || "")}
                            </span>
                          </td>

                          <td
                            rowSpan="3"
                            style={{
                              verticalAlign: "top",
                              maxWidth: "200px",
                              paddingTop: "5px",
                            }}
                          >
                            <span
                              className="formatting"
                              style={{
                                verticalAlign: "top",
                                maxWidth: "30px",
                                paddingTop: "5px",
                              }}
                            >
                              {record[3]}
                              <br />
                              {record[6]}
                            </span>
                          </td>

                          <td
                            rowSpan="3"
                            style={{ verticalAlign: "top", paddingTop: "5px" }}
                          >
                            <span
                              className="formatting"
                              style={{
                                verticalAlign: "top",
                                paddingTop: "5px",
                              }}
                            >
                              {toGujaratiNumber(Number(record[5] || 0) || "")}
                            </span>
                          </td>

                          <td
                            rowSpan="3"
                            style={{ verticalAlign: "top", paddingTop: "5px" }}
                          >
                            <span
                              className="formatting"
                              style={{
                                verticalAlign: "top",
                                paddingTop: "5px",
                              }}
                            >
                              {toGujaratiNumber(Number(record[12] || 0) || "")}
                            </span>
                          </td>

                          <td style={{ minWidth: "100px", maxWidth: "100px" }}>
                            <span className="formatting">
                              {(() => {
                                const receipt =
                                  JSON.parse(record[24] || "{}")?.receipt ||
                                  null;

                                return Array.isArray(receipt)
                                  ? receipt
                                    .map((r) => r?.pNo)
                                    .filter(Boolean)
                                    .join(", ")
                                  : receipt?.pNo || "";
                              })()}
                            </span>
                          </td>

                          <th className="td" style={{ textWrap: "nowrap" }}>
                            <span className="formatting">માંગણું</span>
                          </th>

                          <td
                            className="td"
                            style={{ textAlign: "right", minWidth: "60px" }}
                          >
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {toGujaratiNumber(
                                JSON.parse(record[23] || "{}")?.special_water
                                  ?.prev || " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {toGujaratiNumber(
                                JSON.parse(record[21] || "{}")?.special_water
                                  ?.curr || " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {toGujaratiNumber(
                                Number(
                                  JSON.parse(record[21] || "{}")?.special_water
                                    ?.curr || " ",
                                ) +
                                Number(
                                  JSON.parse(record[23] || "{}")
                                    ?.special_water?.prev || " ",
                                ),
                              )}
                            </span>
                          </td>

                          <td
                            rowSpan="3"
                            style={{ verticalAlign: "top", paddingTop: "5px" }}
                          >
                            <span className="formatting">{record[14]}</span>
                          </td>
                        </tr>

                        <tr style={{ maxHeight: "3px" }}>
                          <td style={{ minWidth: "100px", maxWidth: "100px" }}>
                            <span className="formatting">
                              {(() => {
                                const receipt =
                                  JSON.parse(record[24] || "{}")?.receipt ||
                                  null;

                                const formatDate = (date) =>
                                  date
                                    ? date
                                      .replace(/"/g, "")
                                      .trim()
                                      .split("-")
                                      .reverse()
                                      .join("/")
                                    : "";

                                return Array.isArray(receipt)
                                  ? receipt
                                    .map((r) => formatDate(r?.date))
                                    .filter(Boolean)
                                    .join(", ")
                                  : formatDate(receipt?.date) || "-";
                              })()}
                            </span>
                          </td>
                          <th className="td" style={{ maxHeight: "4x" }}>
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              વસુલાત
                            </span>
                          </th>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[23] || "{}")?.special_water
                                  ?.vasulat || " ",
                              )}
                            </span>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[21] || "{}")?.special_water
                                  ?.vasulat || " ",
                              )}
                            </span>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[23] || "{}")?.special_water
                                  ?.vasulat || " ") +
                                (JSON.parse(record[21] || "{}")?.special_water
                                  ?.vasulat || " "),
                              )}
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td style={{ minWidth: "100px", maxWidth: "100px" }}>
                            <span className="formatting">
                              {(() => {
                                const receipt = JSON.parse(
                                  record[24] || "{}",
                                )?.receipt;

                                return Array.isArray(receipt)
                                  ? receipt
                                    .map((r) => r?.amount)
                                    .filter(Boolean)
                                    .join(", ")
                                  : receipt?.amount || "";
                              })()}
                            </span>
                          </td>
                          <th className="td">
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              બાકી
                            </span>
                          </th>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                Number(
                                  JSON.parse(record[23] || "{}")?.special_water
                                    ?.prev,
                                ) -
                                Number(
                                  JSON.parse(record[23] || "{}")
                                    ?.special_water?.vasulat,
                                ) || " ",
                              )}
                            </span>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                Number(
                                  JSON.parse(record[21] || "{}")?.special_water
                                    ?.curr,
                                ) -
                                Number(
                                  JSON.parse(record[21] || "{}")
                                    ?.special_water?.vasulat,
                                ) || " ",
                              )}
                            </span>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                Number(
                                  JSON.parse(record[23] || "{}")?.special_water
                                    ?.prev,
                                ) -
                                Number(
                                  JSON.parse(record[23] || "{}")
                                    ?.special_water?.vasulat,
                                ) +
                                Number(
                                  JSON.parse(record[21] || "{}")
                                    ?.special_water?.curr,
                                ) -
                                Number(
                                  JSON.parse(record[21] || "{}")
                                    ?.special_water?.vasulat,
                                ) || " ",
                              )}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    );
                  })}

                  <tbody>
                    <tr>
                      <td colSpan="25" style={{ maxHeight: "4px" }}></td>
                    </tr>
                    <tr>
                      <td
                        colSpan="7"
                        rowSpan="3"
                        style={{
                          textAlign: "center",
                          color: "#000",
                          background: "transparent",
                        }}
                      >
                        પાનાનું કુલ
                      </td>
                      <th className="td">
                        <span className="formatting">માંગણું</span>
                      </th>
                      {Array.from({ length: 1 }).map((_, categoryIndex) => {
                        let prevForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            const taxData = JSON.parse(record[23] || "{}");
                            return (
                              sum + Number(taxData?.special_water?.prev || " ")
                            );
                          },
                          0,
                        );

                        let currForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            const taxData = JSON.parse(record[21] || "{}");
                            return (
                              sum + Number(taxData?.special_water?.curr || " ")
                            );
                          },
                          0,
                        );

                        return (
                          <React.Fragment key={categoryIndex}>
                            <td className="td" style={{ textAlign: "right" }}>
                              <span className="formatting">
                                {toGujaratiNumber(prevForCategory, 1) || ""}
                              </span>
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <span className="formatting">
                                {toGujaratiNumber(currForCategory)}
                              </span>
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <span className="formatting">
                                {toGujaratiNumber(
                                  prevForCategory + currForCategory,
                                )}
                              </span>
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className="td" rowSpan={3}></td>
                    </tr>
                    <tr>
                      <th className="td">
                        <span className="formatting">વસુલાત</span>
                      </th>
                      {Array.from({ length: 1 }).map((_, categoryIndex) => {
                        let prevForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            const taxData = JSON.parse(record[23] || "{}");
                            return (
                              sum +
                              Number(taxData?.special_water?.vasulat || " ")
                            );
                          },
                          0,
                        );

                        let currForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            const taxData = JSON.parse(record[21] || "{}");
                            return (
                              sum +
                              Number(taxData?.special_water?.vasulat || " ")
                            );
                          },
                          0,
                        );

                        return (
                          <React.Fragment key={categoryIndex}>
                            <td className="td" style={{ textAlign: "right" }}>
                              <span className="formatting">
                                {toGujaratiNumber(prevForCategory)}
                              </span>
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <span className="formatting">
                                {toGujaratiNumber(currForCategory)}
                              </span>
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <span className="formatting">
                                {toGujaratiNumber(
                                  Number(prevForCategory + currForCategory),
                                )}
                              </span>
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                    <tr>
                      <th className="td">
                        <span className="formatting">બાકી</span>
                      </th>
                      {Array.from({ length: 1 }).map((_, categoryIndex) => {
                        let prevForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            const taxData = JSON.parse(record[23] || "{}");
                            return (
                              sum +
                              (Number(taxData?.special_water?.prev || " ") -
                                Number(taxData?.special_water?.vasulat || " "))
                            );
                          },
                          0,
                        );

                        let currForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            const taxData = JSON.parse(record[21] || "{}");
                            return (
                              sum +
                              (Number(taxData?.special_water?.curr || " ") -
                                Number(taxData?.special_water?.vasulat || " "))
                            );
                          },
                          0,
                        );

                        return (
                          <React.Fragment key={categoryIndex}>
                            <td className="td" style={{ textAlign: "right" }}>
                              <span className="formatting">
                                {toGujaratiNumber(prevForCategory)}
                              </span>
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <span className="formatting">
                                {toGujaratiNumber(currForCategory)}
                              </span>
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <span className="formatting">
                                {toGujaratiNumber(
                                  prevForCategory + currForCategory,
                                )}
                              </span>
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaxRegister;
