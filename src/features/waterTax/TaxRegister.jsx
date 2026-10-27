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
import TaxIndexRaw from "../../components/conver/TaxIndexRaw";
import Blank9D from "../../components/Blank9D";

const TaxRegister = () => {
  const [count, setCount] = useState(5);
  const [PROPERTIES_PER_PAGE, SetPropertiesPerPage] = useState(6); // એક પેજ પર કેટલી લાઇન બતાવવી

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

  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchRecords = async () => {
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

      setRecords(result.data);
    } catch (err) {
      console.error("Error fetching records:", err);

      setError("ડેટા લાવવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.");
    } finally {
      setLoading(false);
    }
  };

  const [project, setProject] = useState([]);
  const { projectId } = useParams();
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
      toast.error(`Error Fetching Projects: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateValue = async () => {
    try {
      setLoading(true);
      toast.info("Calucating Values...");

      const data = await axios.put(
        `${await apiPath()}/api/sheet/ordervaluation/${projectId}`,
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
      toast.error(`Error Fetching Projects: ${error}`);
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
      console.log(fetchedData);

      if (fetchedData && fetchedData.length > 0) {
        setTaxes(fetchedData);
        toast.success("Tax Data Fetched Successfully.");
      } else {
        toast.info("No Tax Data Found! try adding new Data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error Fetching Taxes Data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchRecords();
    fetchTaxes();
  }, []);

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
        });

        pagesForThisBundle.forEach((pageRecs) => {
          final.push({
            type: "page",
            bundle: currentBundle,
            pageIndex: globalPageNumber - 1,
            pageRecords: pageRecs,
            isCommercial: false,
          });
          globalPageNumber++;
        });

        currentBundle++;
      }

      final.push({
        type: "blank",
        isCommercial: false,
      });
      final.push({
        type: "blank",
        isCommercial: false,
      });
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

    // 1. Title Row (Ab sabse pehle)
    const titleRow = [
      [
        `ગામનો નમુના નંબર ૯ ડી - કરવેરા રજીસ્ટર - સને ${project?.details?.taxYear || "2026/27"}`,
      ],
    ];

    // 2. Location Row (Title ke baad)
    const locationRow = [
      [
        `ગામ:- ${project?.spot?.gaam || ""}`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        `તાલુકો:- ${project?.spot?.taluka || ""}`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        `જિલ્લો:- ${project?.spot?.district || ""}`,
        "",
        "",
        "",
        "",
        "",
      ],
    ];

    // 3. Header Rows
    const headerRow1 = [
      "ખાતાનો નંબર",
      "પ્રોપર્ટી નંબર",
      "એરિયાનું નામ",
      "ખાતેદારનું નામ",
      "પહોંચ નંબર તારીખ રકમ",
      "વિગત",
      "ઘર વેરો",
      "",
      "",
      "સામાન્ય પાણી વેરો",
      "",
      "",
      "ખાસ પાણી નળ વેરો",
      "",
      "",
      "દિવાબતી લાઈટ વેરો",
      "",
      "",
      "સફાઈ વેરો",
      "",
      "",
      "કુલ એકંદર",
      "",
      "",
      "ગઈ સાલના જાદે",
    ];

    const headerRow2 = [
      "",
      "",
      "",
      "",
      "",
      "", // First 6 columns blank
      "પા.બા",
      "ચાલુ",
      "કુલ", // ઘર વેરો
      "પા.બા",
      "ચાલુ",
      "કુલ", // સામાન્ય પાણી વેરો
      "પા.બા",
      "ચાલુ",
      "કુલ", // ખાસ પાણી નળ વેરો
      "પા.બા",
      "ચાલુ",
      "કુલ", // દિવાબતી લાઈટ વેરો
      "પા.બા",
      "ચાલુ",
      "કુલ", // સફાઈ વેરો
      "પા.બા",
      "ચાલુ",
      "કુલ", // કુલ એકંદર
      "", // ગઈ સાલના જાદે
    ];

    // Numbering in English digits
    const headerNumbers = [Array.from({ length: 25 }, (_, i) => i + 1)];

    const dataRows = [];

    // Update Merges logic as per Title first
    const merges = [
      // Header Merges
      { s: { r: 0, c: 0 }, e: { r: 0, c: 24 } }, // Title (Now Row 0)
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // ગામ (Now Row 1)
      { s: { r: 1, c: 9 }, e: { r: 1, c: 18 } }, // તાલુકો
      { s: { r: 1, c: 19 }, e: { r: 1, c: 24 } }, // જિલ્લો

      // Column spans for Tax Headers (Row 2)
      { s: { r: 2, c: 6 }, e: { r: 2, c: 8 } },
      { s: { r: 2, c: 9 }, e: { r: 2, c: 11 } },
      { s: { r: 2, c: 12 }, e: { r: 2, c: 14 } },
      { s: { r: 2, c: 15 }, e: { r: 2, c: 17 } },
      { s: { r: 2, c: 18 }, e: { r: 2, c: 20 } },
      { s: { r: 2, c: 21 }, e: { r: 2, c: 23 } },

      // Row spans for Base Columns (Row 2 & 3)
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } }, // ખાતાનો નંબર
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } }, // પ્રોપર્ટી નંબર
      { s: { r: 2, c: 2 }, e: { r: 3, c: 2 } }, // એરિયાનું નામ
      { s: { r: 2, c: 3 }, e: { r: 3, c: 3 } }, // ખાતેદારનું નામ
      { s: { r: 2, c: 4 }, e: { r: 3, c: 4 } }, // પહોંચ નંબર
      { s: { r: 2, c: 5 }, e: { r: 3, c: 5 } }, // વિગત
      { s: { r: 2, c: 24 }, e: { r: 3, c: 24 } }, // ગઈ સાલના જાદે
    ];

    let currentRowIndex = 5;

    // Variables to hold Footer Totals
    const grandTotals = [
      Array(25).fill(0), // Demand totals
      Array(25).fill(0), // Recovery totals
      Array(25).fill(0), // Balance totals
    ];

    records?.forEach((record) => {
      const parsed21 = safeParse(record[21]);
      const parsed22 = safeParse(record[22]);
      const parsed23 = safeParse(record[23]);
      const parsed24 = safeParse(record[24]);
      const parsed25 = safeParse(record[25]);
      const parsed26 = safeParse(record[26]);

      const commonInfo = [
        record[0] || "", // 0: ખાતાનો નંબર
        record[2] || "", // 1: પ્રોપર્ટી નંબર
        record[1] || "", // 2: એરિયાનું નામ
        record[3] || "", // 3: ખાતેદારનું નામ
        "", // 4: પહોંચ નંબર (Will remain unmerged and blank)
      ];

      // ====== ROW 1: માંગણું (Demand) ======
      const r1_ghar_prev = getNum(record[22]);
      const r1_ghar_curr = getNum(record[20]);
      const r1_samanya_prev = getNum(parsed23?.normal_water?.prev);
      const r1_samanya_curr = getNum(parsed21?.normal_water?.curr);
      const r1_khas_prev = getNum(parsed23?.special_water?.prev);
      const r1_khas_curr = getNum(parsed21?.special_water?.curr);
      const r1_light_prev = getNum(parsed23?.light?.prev);
      const r1_light_curr = getNum(parsed21?.light?.curr);
      const r1_safai_prev = getNum(parsed23?.cleaning?.prev);
      const r1_safai_curr = getNum(parsed21?.cleaning?.curr);

      const r1_kul_prev =
        r1_ghar_prev +
        r1_samanya_prev +
        r1_khas_prev +
        r1_light_prev +
        r1_safai_prev;
      const r1_kul_curr =
        r1_ghar_curr +
        r1_samanya_curr +
        r1_khas_curr +
        r1_light_curr +
        r1_safai_curr;

      const row1 = [
        ...commonInfo,
        "માંગણું",
        r1_ghar_prev,
        r1_ghar_curr,
        r1_ghar_prev + r1_ghar_curr,
        r1_samanya_prev,
        r1_samanya_curr,
        r1_samanya_prev + r1_samanya_curr,
        r1_khas_prev,
        r1_khas_curr,
        r1_khas_prev + r1_khas_curr,
        r1_light_prev,
        r1_light_curr,
        r1_light_prev + r1_light_curr,
        r1_safai_prev,
        r1_safai_curr,
        r1_safai_prev + r1_safai_curr,
        r1_kul_prev,
        r1_kul_curr,
        r1_kul_prev + r1_kul_curr,
        "", // ગઈ સાલના જાદે
      ];

      // ====== ROW 2: વસુલાત (Recovery) ======
      const row2 = [
        "",
        "",
        "",
        "",
        "",
        "વસુલાત",
        getNum(parsed21?.[1]?.prev),
        getNum(parsed21?.[1]?.curr),
        getNum(parsed21?.[1]?.prev) + getNum(parsed21?.[1]?.curr),
        getNum(parsed22?.[1]?.prev),
        getNum(parsed22?.[1]?.curr),
        getNum(parsed22?.[1]?.prev) + getNum(parsed22?.[1]?.curr),
        getNum(parsed23?.[1]?.prev),
        getNum(parsed23?.[1]?.curr),
        getNum(parsed23?.[1]?.prev) + getNum(parsed23?.[1]?.curr),
        getNum(parsed24?.[1]?.prev),
        getNum(parsed24?.[1]?.curr),
        getNum(parsed24?.[1]?.prev) + getNum(parsed24?.[1]?.curr),
        getNum(parsed25?.[1]?.prev),
        getNum(parsed25?.[1]?.curr),
        getNum(parsed25?.[1]?.prev) + getNum(parsed25?.[1]?.curr),
        getNum(parsed26?.[1]?.prev),
        getNum(parsed26?.[1]?.curr),
        getNum(parsed26?.[1]?.prev) + getNum(parsed26?.[1]?.curr),
        "",
      ];

      // ====== ROW 3: બાકી (Balance) ======
      const row3 = [
        "",
        "",
        "",
        "",
        "",
        "બાકી",
        getNum(parsed21?.[1]?.prev),
        getNum(parsed21?.[1]?.curr),
        getNum(parsed21?.[1]?.prev) + getNum(parsed21?.[1]?.curr),
        getNum(parsed22?.[1]?.prev),
        getNum(parsed22?.[1]?.curr),
        getNum(parsed22?.[1]?.prev) + getNum(parsed22?.[1]?.curr),
        getNum(parsed23?.[1]?.prev),
        getNum(parsed23?.[1]?.curr),
        getNum(parsed23?.[1]?.prev) + getNum(parsed23?.[1]?.curr),
        getNum(parsed24?.[1]?.prev),
        getNum(parsed24?.[1]?.curr),
        getNum(parsed24?.[1]?.prev) + getNum(parsed24?.[1]?.curr),
        getNum(parsed25?.[1]?.prev),
        getNum(parsed25?.[1]?.curr),
        getNum(parsed25?.[1]?.prev) + getNum(parsed25?.[1]?.curr),
        getNum(parsed26?.[1]?.prev),
        getNum(parsed26?.[1]?.curr),
        getNum(parsed26?.[1]?.prev) + getNum(parsed26?.[1]?.curr),
        "",
      ];

      // Summing values into Grand Totals array (cols 6 to 23)
      for (let i = 6; i <= 23; i++) {
        grandTotals[0][i] += Number(row1[i]) || 0;
        grandTotals[1][i] += Number(row2[i]) || 0;
        grandTotals[2][i] += Number(row3[i]) || 0;
      }

      dataRows.push(row1, row2, row3);

      // Vertical Merges (Removed Index 4 - પહોંચ નંબર)
      [0, 1, 2, 3, 24].forEach((colIndex) => {
        merges.push({
          s: { r: currentRowIndex, c: colIndex },
          e: { r: currentRowIndex + 2, c: colIndex },
        });
      });

      currentRowIndex += 3;
    });

    // ====== FOOTER ROWS (Grand Totals) ======
    const footerRow1 = [
      "કુલ",
      "",
      "",
      "",
      "",
      "માંગણું",
      ...grandTotals[0].slice(6, 24),
      "",
    ];
    const footerRow2 = [
      "",
      "",
      "",
      "",
      "",
      "વસુલાત",
      ...grandTotals[1].slice(6, 24),
      "",
    ];
    const footerRow3 = [
      "",
      "",
      "",
      "",
      "",
      "બાકી",
      ...grandTotals[2].slice(6, 24),
      "",
    ];

    dataRows.push(footerRow1, footerRow2, footerRow3);

    // Merge the first 5 columns of the Footer to show "કુલ" dynamically centered
    merges.push({
      s: { r: currentRowIndex, c: 0 },
      e: { r: currentRowIndex + 2, c: 4 },
    });

    // Create Data Array
    const worksheetData = [
      ...titleRow, // Title first
      ...locationRow, // Location second
      headerRow1,
      headerRow2,
      ...headerNumbers,
      ...dataRows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet["!merges"] = merges;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Karvera Register");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(file, "Karvera_Register_9D.xlsx");
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
        onClick={() => navigate(`/survay/taxform/${projectId}`)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Tax Entry Form
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
                  <TaxIndexRaw
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
                )}
              </div>
            );
          }

          if (item.type === "blank") {
            return <Blank9D item={item} project={project} id={id} />;
          }

          return (
            <div
              key={id}
              id={id}
              className="report-page legal-landscape-dimensions"
              style={{
                width: "1700px",
                paddingTop: "55px",

                paddingLeft: "45px",
                paddingRight: "0px",
              }}
            >
              <div
                className="watermark"
                style={{ minHeight: "100%", position: "relative" }}
              >
                {/* Headers and Page Count */}

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
                    ગામનો નમુના નંબર ૯ડી કરવેરા રજીસ્ટર{" "}
                    {item.isCommercial === true
                      ? " - કોમર્શિયલ મિલ્કત"
                      : item.isCommercial === false
                        ? " - રહેણાંક મિલ્કત"
                        : ""}{" "}
                    | સને {project?.details?.taxYear || "૨૦૨૫/૨૬"}
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

                {/* Table Header using Divs */}
                <table
                  className="report-table tax-register-table"
                  id="pdff"
                  style={{ background: "transparent" }}
                >
                  <thead className="thead">
                    <tr>
                      <th
                        className="th"
                        rowSpan="2"
                        style={{ maxWidth: "45px" }}
                      >
                        <span
                          className="formatting"
                          style={{ fontSize: "12px" }}
                        >
                          ખાતાનો નંબર
                        </span>
                      </th>

                      <th
                        className="th"
                        rowSpan="2"
                        style={{ maxWidth: "45px" }}
                      >
                        <span
                          className="formatting"
                          style={{ fontSize: "12px" }}
                        >
                          {" "}
                          પ્રોપર્ટી નંબર
                        </span>
                      </th>

                      <th
                        className="th"
                        rowSpan="2"
                        style={{ maxWidth: "90px" }}
                      >
                        <span className="formatting">એરિયાનું નામ</span>
                      </th>

                      <th
                        className="th"
                        rowSpan="2"
                        style={{ maxWidth: "60px" }}
                      >
                        <span className="formatting">ખાતેદારનું નામ</span>
                      </th>

                      <th
                        className="th"
                        rowSpan="2"
                        style={{ maxWidth: "45px" }}
                      >
                        <span className="formatting"> જૂનો મિ.નં. </span>
                      </th>

                      <th
                        className="th"
                        rowSpan="2"
                        style={{ minWidth: "70px", maxWidth: "70px" }}
                      >
                        <span className="formatting">પહોચ નંબર તારીખ રકમ</span>
                      </th>

                      <th
                        className="th"
                        rowSpan="2"
                        style={{ maxWidth: "90px" }}
                      >
                        <span className="formatting">વિગત</span>
                      </th>

                      <th
                        className="th"
                        colSpan="3"
                        style={{ minWidth: "130px" }}
                      >
                        <span className="formatting">ઘર વેરો</span>
                      </th>

                      <th
                        className="th"
                        colSpan="3"
                        style={{ minWidth: "130px" }}
                      >
                        <span className="formatting">સામાન્ય પાણી વેરો</span>
                      </th>

                      <th
                        className="th"
                        colSpan="3"
                        style={{ minWidth: "130px" }}
                      >
                        <span className="formatting">ખાસ પાણી નળ વેરો</span>
                      </th>

                      <th
                        className="th"
                        colSpan="3"
                        style={{ minWidth: "130px" }}
                      >
                        <span className="formatting">દિવાબતી લાઈટ વેરો</span>
                      </th>

                      <th
                        className="th"
                        colSpan="3"
                        style={{ minWidth: "130px" }}
                      >
                        <span className="formatting">સફાઈ વેરો</span>
                      </th>

                      <th
                        className="th"
                        colSpan="3"
                        style={{ minWidth: "130px" }}
                      >
                        <span className="formatting">કુલ એકંદર</span>
                      </th>

                      <th
                        className="th"
                        style={{ maxWidth: "40px" }}
                        rowSpan="2"
                      >
                        <span
                          className="formatting"
                          style={{ fontSize: "12px" }}
                        >
                          ગઈ સાલના જાદે
                        </span>
                      </th>
                    </tr>

                    <tr>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <>
                          <th className="th">
                            <span className="formatting">પા.બા</span>
                          </th>

                          <th className="th">
                            <span className="formatting">ચાલુ</span>
                          </th>
                          <th className="th">
                            <span className="formatting">કુલ</span>
                          </th>
                        </>
                      ))}
                    </tr>

                    {/* Index Start */}
                    <tr>
                      {/* 1 to 18 th for index */}
                      {Array.from({ length: 26 }).map((_, index) => (
                        <th
                          className="text-xs font-medium text-gray-500 uppercase tracking-wider"
                          style={{
                            textAlign: "center",
                            color: "black",
                            background: "transparent",
                          }}
                          key={index}
                        >
                          <span className="formatting">{index + 1}</span>
                        </th>
                      ))}
                    </tr>
                    {/* Index End */}
                  </thead>

                  {/* Table Rows using Divs */}

                  {item.pageRecords.map((record, index) => {
                    return (
                      <tbody>
                        <tr key={index} style={{ maxHeight: "3px" }}>
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
                              {toGujaratiNumber(record[0])}
                            </span>
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
                            </span>
                          </td>

                          <td
                            rowSpan="3"
                            // style={{ maxWidth: "150px" }}
                            style={{ verticalAlign: "top", paddingTop: "5px" }}
                          >
                            <span
                              className="formatting"
                              style={{
                                verticalAlign: "top",
                                paddingTop: "5px",
                              }}
                            >
                              {toGujaratiNumber(record[5])}
                            </span>
                          </td>

                          <td style={{ minWidth: "100px", maxWidth: "100px" }}>
                            <span className="formatting">{""}</span>
                          </td>

                          <th className="td" style={{ textWrap: "nowrap" }}>
                            <span className="formatting">માંગણું</span>
                          </th>

                          {/* ઘર વેરો */}
                          <td
                            className="td"
                            style={{ textAlign: "right", minWidth: "60px" }}
                          >
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {toGujaratiNumber(Number(record[22]) || "")}
                            </span>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {/* {JSON.parse(record[24] || "{}")?.[0]?.curr || ' '} */}
                              {toGujaratiNumber(Number(record[20]) || "")}
                            </span>
                          </td>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {/* {(JSON.parse(record[23] || "{}")?.[0]?.curr ||
                                0) +
                                (JSON.parse(record[23] || "{}")?.[0]?.prev ||
                                  " ")} */}
                              {toGujaratiNumber(
                                Number(record[20] || " ") +
                                Number(record[22] || " "),
                              )}
                            </span>
                          </td>

                          {/* [{ "curr": 20, "prev": 0 }, { "curr": 0, "prev": 0 }, { "curr": 0, "prev": 0 }] */}
                          {/* સામાન્ય પાણી વેરો */}
                          <td
                            className="td"
                            style={{ textAlign: "right", minWidth: "60px" }}
                          >
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {toGujaratiNumber(
                                JSON.parse(record[23] || "{}")?.normal_water
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
                                JSON.parse(record[21] || "{}")?.normal_water
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
                                  JSON.parse(record[21] || "{}")?.normal_water
                                    ?.curr || " ",
                                ) +
                                Number(
                                  JSON.parse(record[23] || "{}")?.normal_water
                                    ?.prev || " ",
                                ),
                              )}
                            </span>
                          </td>

                          {/* ખાસ પાણી નળ વેરો */}
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

                          {/* દિવાબતી લાઈટ વેરો */}
                          <td
                            className="td"
                            style={{ textAlign: "right", minWidth: "60px" }}
                          >
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {toGujaratiNumber(
                                JSON.parse(record[23] || "{}")?.light?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {toGujaratiNumber(
                                JSON.parse(record[21] || "{}")?.light?.curr ||
                                " ",
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
                                  JSON.parse(record[21] || "{}")?.light?.curr ||
                                  " ",
                                ) +
                                Number(
                                  JSON.parse(record[23] || "{}")?.light
                                    ?.prev || " ",
                                ),
                              )}
                            </span>
                          </td>

                          {/* સફાઈ વેરો */}
                          <td
                            className="td"
                            style={{ textAlign: "right", minWidth: "60px" }}
                          >
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {toGujaratiNumber(
                                Number(
                                  JSON.parse(record[23] || "{}")?.cleaning
                                    ?.prev,
                                ) || " ",
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
                                  JSON.parse(record[21] || "{}")?.cleaning
                                    ?.curr,
                                ) || " ",
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
                                  JSON.parse(record[21] || "{}")?.cleaning
                                    ?.curr || " ",
                                ) +
                                Number(
                                  JSON.parse(record[23] || "{}")?.cleaning
                                    ?.prev || " ",
                                ),
                              )}
                            </span>
                          </td>

                          {/* કુલ એકંદર */}
                          <td
                            className="td"
                            style={{ textAlign: "right", minWidth: "60px" }}
                          >
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              {toGujaratiNumber(
                                Number(
                                  Number(record[22] || " ") +
                                  Number(
                                    JSON.parse(record[23] || "{}")
                                      ?.normal_water?.prev || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[23] || "{}")
                                      ?.special_water?.prev || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[23] || "{}")?.light
                                      ?.prev || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[23] || "{}")?.cleaning
                                      ?.prev || " ",
                                  ),
                                ) || " ",
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
                                  Number(record[20] || " ") +
                                  Number(
                                    JSON.parse(record[21] || "{}")
                                      ?.normal_water?.curr || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[21] || "{}")
                                      ?.special_water?.curr || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[21] || "{}")?.light
                                      ?.curr || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[21] || "{}")?.cleaning
                                      ?.curr || " ",
                                  ),
                                ) || "",
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
                                  Number(record[20] || " ") +
                                  Number(record[22] || " ") +
                                  Number(
                                    JSON.parse(record[21] || "{}")
                                      ?.normal_water?.curr || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[21] || "{}")
                                      ?.special_water?.curr || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[21] || "{}")?.light
                                      ?.curr || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[21] || "{}")?.cleaning
                                      ?.curr || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[23] || "{}")
                                      ?.normal_water?.prev || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[23] || "{}")
                                      ?.special_water?.prev || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[23] || "{}")?.light
                                      ?.prev || " ",
                                  ) +
                                  Number(
                                    JSON.parse(record[23] || "{}")?.cleaning
                                      ?.prev || " ",
                                  ),
                                ) || "",
                              )}
                            </span>
                          </td>

                          {/* ગઈ સાલના જાદે */}
                          <td className="td" rowSpan={3}></td>
                        </tr>

                        <tr style={{ maxHeight: "3px" }}>
                          <th>
                            <span className="formatting">{""}</span>
                          </th>

                          <th className="td" style={{ maxHeight: "4x" }}>
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              વસુલાત
                            </span>
                          </th>

                          {/* ઘર વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[21] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[21] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[21] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[21] || "{}")?.[1]?.prev ||
                                  " "),
                              )}
                            </span>
                          </td>

                          {/* સામાન્ય પાણી વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[22] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[22] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[22] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[22] || "{}")?.[1]?.prev ||
                                  " "),
                              )}
                            </span>
                          </td>

                          {/* ખાસ પાણી નળ વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[23] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[23] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[23] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[23] || "{}")?.[1]?.prev ||
                                  " "),
                              )}
                            </span>
                          </td>

                          {/* દિવાબતી લાઈટ વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[24] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[24] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[24] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[24] || "{}")?.[1]?.prev ||
                                  0),
                              )}
                            </span>
                          </td>

                          {/* સફાઈ વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[25] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[25] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[25] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[25] || "{}")?.[1]?.prev ||
                                  0),
                              )}
                            </span>
                          </td>

                          {/* કુલ એકંદર */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[26] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[26] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[26] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[26] || "{}")?.[1]?.prev ||
                                  0),
                              )}
                            </span>
                          </td>

                          {/* ગઈ સાલના જાદે */}
                          {/* <td className="td"></td> */}
                        </tr>

                        <tr>
                          <th>
                            <span className="formatting">{""}</span>
                          </th>

                          <th className="td">
                            <span
                              className="formatting"
                              style={{ textWrap: "nowrap" }}
                            >
                              બાકી
                            </span>
                          </th>

                          {/* ઘર વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[21] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[21] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[21] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[21] || "{}")?.[1]?.prev ||
                                  0),
                              )}
                            </span>
                          </td>

                          {/* સામાન્ય પાણી વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[22] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[22] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[22] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[22] || "{}")?.[1]?.prev ||
                                  0),
                              )}
                            </span>
                          </td>

                          {/* ખાસ પાણી નળ વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[23] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[23] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[23] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[23] || "{}")?.[1]?.prev ||
                                  0),
                              )}
                            </span>
                          </td>

                          {/* દિવાબતી લાઈટ વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[24] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[24] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[24] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[24] || "{}")?.[1]?.prev ||
                                  0),
                              )}
                            </span>
                          </td>

                          {/* સફાઈ વેરો */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[25] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[25] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[25] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[25] || "{}")?.[1]?.prev ||
                                  0),
                              )}
                            </span>
                          </td>

                          {/* કુલ એકંદર */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[26] || "{}")?.[1]?.prev ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                JSON.parse(record[26] || "{}")?.[1]?.curr ||
                                " ",
                              )}
                            </span>
                          </td>

                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                (JSON.parse(record[26] || "{}")?.[1]?.curr ||
                                  " ") +
                                (JSON.parse(record[26] || "{}")?.[1]?.prev ||
                                  0),
                              )}
                            </span>
                          </td>

                          {/* ગઈ સાલના જાદે */}
                          {/* <td className="td"></td> */}
                        </tr>
                      </tbody>
                    );
                  })}

                  <tr>
                    <td colSpan="25" style={{ maxHeight: "4px" }}></td>
                  </tr>

                  <tr>
                    <td
                      colSpan="6"
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
                    {Array.from({ length: 6 }).map((_, categoryIndex) => {
                      let prevForCategory = 0;

                      if (categoryIndex === 0) {
                        prevForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            return sum + Number(record[22] || " ");
                          },
                          0,
                        );
                      } else {
                        prevForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            const taxData = JSON.parse(record[23] || "{}");

                            if (categoryIndex === 1) {
                              return (
                                sum + Number(taxData?.normal_water?.prev || " ")
                              );
                            } else if (categoryIndex === 2) {
                              return (
                                sum +
                                Number(taxData?.special_water?.prev || " ")
                              );
                            } else if (categoryIndex === 3) {
                              return sum + Number(taxData?.light?.prev || " ");
                            } else if (categoryIndex === 4) {
                              return (
                                sum + Number(taxData?.cleaning?.prev || " ")
                              );
                            } else if (categoryIndex === 5) {
                              return (
                                sum +
                                (Number(taxData?.normal_water?.prev || " ") +
                                  Number(taxData?.special_water?.prev || " ") +
                                  Number(taxData?.light?.prev || " ") +
                                  Number(taxData?.cleaning?.prev || " ") +
                                  Number(record[22] || " "))
                              );
                            }
                          },
                          0,
                        );
                      }

                      let currForCategory = 0;

                      if (categoryIndex === 0) {
                        currForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            return sum + Number(record[20] || " ");
                          },
                          0,
                        );
                      } else {
                        currForCategory = item.pageRecords.reduce(
                          (sum, record) => {
                            const taxData = JSON.parse(record[21] || "{}");

                            if (categoryIndex === 1) {
                              return (
                                sum + Number(taxData?.normal_water?.curr || " ")
                              );
                            } else if (categoryIndex === 2) {
                              return (
                                sum +
                                Number(taxData?.special_water?.curr || " ")
                              );
                            } else if (categoryIndex === 3) {
                              return sum + Number(taxData?.light?.curr || " ");
                            } else if (categoryIndex === 4) {
                              return (
                                sum + Number(taxData?.cleaning?.curr || " ")
                              );
                            } else if (categoryIndex === 5) {
                              return (
                                sum +
                                (Number(taxData?.normal_water?.curr || " ") +
                                  Number(taxData?.special_water?.curr || " ") +
                                  Number(taxData?.light?.curr || " ") +
                                  Number(taxData?.cleaning?.curr || " ") +
                                  Number(record[20] || " "))
                              );
                            }
                          },
                          0,
                        );
                      }

                      return (
                        <React.Fragment key={categoryIndex}>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(prevForCategory, 1) || ""}
                            </span>
                          </td>

                          {/* પા.બા */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(currForCategory)}
                            </span>
                          </td>

                          {/* ચાલુ */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(
                                prevForCategory + currForCategory,
                              )}
                            </span>
                          </td>
                          {/* કુલ */}
                        </React.Fragment>
                      );
                    })}

                    <td className="td" rowSpan={3}></td>

                    {/* The last 'કુલ એકંદર' Demand totals (already calculated in pageTotals.demand) */}
                    {/* <td className="td">{pageTotals.demand.prev}</td> 
                  <td className="td">{pageTotals.demand.curr}</td>  
                  <td className="td">{pageTotals.demand.total}</td>  */}
                  </tr>

                  <tr>
                    <th className="td">
                      <span className="formatting">વસુલાત</span>
                    </th>

                    {Array.from({ length: 6 }).map((_, categoryIndex) => {
                      const recordColumnIndex = 21 + categoryIndex;
                      const totalForCategory = item.pageRecords.reduce(
                        (sum, record) => {
                          const taxData = JSON.parse(
                            record[recordColumnIndex] || "{}",
                          );
                          return (
                            sum +
                            (taxData?.[1]?.prev || " ") +
                            (taxData?.[1]?.curr || " ")
                          );
                        },
                        0,
                      );
                      const prevForCategory = item.pageRecords.reduce(
                        (sum, record) => {
                          const taxData = JSON.parse(
                            record[recordColumnIndex] || "{}",
                          );
                          return sum + (taxData?.[1]?.prev || " ");
                        },
                        0,
                      );
                      const currForCategory = item.pageRecords.reduce(
                        (sum, record) => {
                          const taxData = JSON.parse(
                            record[recordColumnIndex] || "{}",
                          );
                          return sum + (taxData?.[1]?.curr || " ");
                        },
                        0,
                      );

                      return (
                        <React.Fragment key={categoryIndex}>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(prevForCategory)}
                            </span>
                          </td>{" "}
                          {/* પા.બા */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(currForCategory)}
                            </span>
                          </td>{" "}
                          {/* ચાલુ */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(totalForCategory)}
                            </span>
                          </td>{" "}
                          {/* કુલ */}
                        </React.Fragment>
                      );
                    })}

                    {/* <td className="td"></td> */}

                    {/* 'કુલ એકંદર' Collection totals */}
                    {/* <td className="td">{pageTotals.collection.prev}</td>
                  <td className="td">{pageTotals.collection.curr}</td>
                  <td className="td">{pageTotals.collection.total}</td> */}
                  </tr>

                  {/* Outstanding Row: બાકી */}
                  <tr>
                    <th className="td">
                      <span className="formatting">બાકી</span>
                    </th>
                    {Array.from({ length: 6 }).map((_, categoryIndex) => {
                      const recordColumnIndex = 21 + categoryIndex;
                      const totalForCategory = item.pageRecords.reduce(
                        (sum, record) => {
                          const taxData = JSON.parse(
                            record[recordColumnIndex] || "{}",
                          );
                          return (
                            sum +
                            (taxData?.[2]?.prev || " ") +
                            (taxData?.[2]?.curr || " ")
                          );
                        },
                        0,
                      );
                      const prevForCategory = item.pageRecords.reduce(
                        (sum, record) => {
                          const taxData = JSON.parse(
                            record[recordColumnIndex] || "{}",
                          );
                          return sum + (taxData?.[2]?.prev || " ");
                        },
                        0,
                      );
                      const currForCategory = item.pageRecords.reduce(
                        (sum, record) => {
                          const taxData = JSON.parse(
                            record[recordColumnIndex] || "{}",
                          );
                          return sum + (taxData?.[2]?.curr || " ");
                        },
                        0,
                      );

                      return (
                        <React.Fragment key={categoryIndex}>
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(prevForCategory)}
                            </span>
                          </td>{" "}
                          {/* પા.બા */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(currForCategory)}
                            </span>
                          </td>{" "}
                          {/* ચાલુ */}
                          <td className="td" style={{ textAlign: "right" }}>
                            <span className="formatting">
                              {toGujaratiNumber(totalForCategory)}
                            </span>
                          </td>{" "}
                          {/* કુલ */}
                        </React.Fragment>
                      );
                    })}

                    {/* <td className="td"></td> */}

                    {/* 'કુલ એકંદર' Outstanding totals */}
                    {/* <td className="td">{pageTotals.outstanding.prev}</td> 
                  <td className="td">{pageTotals.outstanding.curr}</td> 
                  <td className="td">{pageTotals.outstanding.total}</td> */}
                  </tr>
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
