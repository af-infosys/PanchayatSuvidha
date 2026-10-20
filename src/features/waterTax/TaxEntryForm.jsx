import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import apiPath from "../../isProduction.js";
import { X, CornerDownRight, CornerUpLeft, Search, Save } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../config/AuthContext.js";
const InputCell = ({ name, value, onChange, isYellow = false }) => (
  <td
    className="border border-gray-300 p-0 min-w-[70px]"
    style={{
      maxWidth: "70px",
    }}
  >
    <input
      type="number"
      name={name}
      value={Number(value) || ""}
      onChange={onChange}
      disabled={isYellow}
      data-entry-input={!isYellow ? "true" : undefined}
      className={`w-full h-full px-2 py-1.5 outline-none text-sm text-right transition-all focus:ring-2 focus:ring-blue-500 focus:z-10 relative
        ${isYellow ? "bg-yellow-50 text-gray-700 font-semibold cursor-not-allowed" : "bg-white hover:bg-gray-50"}
      `}
    />
  </td>
);
const TaxEntryForm = () => {
  const { mId } = useParams();
  const { user } = useAuth();
  const [projectId, setProjectId] = useState(null);

  const initialTaxes = [
    {
      id: "house",
      name: "ઘર વેરો",
      demand: { pb: 0, chalu: 0 },
      recovery: { pb: 0, chalu: 0 },
      advance: { last: 0, chalu: 0 },
    },
    {
      id: "water_gen",
      name: "સામાન્ય પાણી વેરો",
      demand: { pb: 0, chalu: 0 },
      recovery: { pb: 0, chalu: 0 },
      advance: { last: 0, chalu: 0 },
    },
    {
      id: "water_spl",
      name: "ખાસ પાણી વેરો",
      demand: { pb: 0, chalu: 0 },
      recovery: { pb: 0, chalu: 0 },
      advance: { last: 0, chalu: 0 },
    },
    {
      id: "light",
      name: "લાઇટ વેરો",
      demand: { pb: 0, chalu: 0 },
      recovery: { pb: 0, chalu: 0 },
      advance: { last: 0, chalu: 0 },
    },
    {
      id: "cleaning",
      name: "સફાઈ વેરો",
      demand: { pb: 0, chalu: 0 },
      recovery: { pb: 0, chalu: 0 },
      advance: { last: 0, chalu: 0 },
    },
  ];
  const [taxes, setTaxes] = useState(initialTaxes);
  // Receipt details are always an array, including when editing old records.
  const createEmptyReceipt = () => ({ pNo: "", date: "", amount: "" });
  const [receiptDetails, setReceiptDetails] = useState([createEmptyReceipt()]);
  const formRef = useRef(null);
  const accountNumberRef = useRef(null);
  const focusNewReceiptRef = useRef(false);
  // Keep keyboard focus on the first input after opening/changing records.
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      accountNumberRef.current?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [mId]);
  // Enter and Tab move through editable inputs in actual visual/DOM order.
  // Read-only, calculated/disabled cells and action buttons are skipped.
  const handleEntryKeyDown = (event) => {
    if (
      !["Enter", "Tab"].includes(event.key) ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.isComposing
    )
      return;
    if (!event.target.matches('input[data-entry-input="true"]')) return;
    const editableInputs = Array.from(
      formRef.current?.querySelectorAll('input[data-entry-input="true"]') || [],
    ).filter(
      (input) =>
        !input.disabled && !input.readOnly && input.getClientRects().length,
    );
    const index = editableInputs.indexOf(event.target);
    const step = event.key === "Tab" && event.shiftKey ? -1 : 1;
    const next = editableInputs[index + step];
    if (next) {
      event.preventDefault();
      next.focus();
      if (next.type === "text") next.select();
    } else if (event.key === "Enter") {
      // Prevent the form from submitting when Enter is pressed on its last input.
      event.preventDefault();
    }
  };
  // Automatically focus the receipt number in newly appended rows only.
  useEffect(() => {
    if (!focusNewReceiptRef.current) return;
    focusNewReceiptRef.current = false;
    const inputs = formRef.current?.querySelectorAll(
      'input[data-receipt-number="true"]',
    );
    inputs?.[inputs.length - 1]?.focus();
  }, [receiptDetails.length]);
  // Only the visible special-water tax contributes to the displayed total.
  // Other taxes stay in state and in the save payload, unchanged.
  const totalTax = taxes
    .filter((tax) => tax.id === "water_spl")
    .reduce(
      (acc, tax) => ({
        demand: {
          pb: acc.demand.pb + (Number(tax.demand.pb) || 0),
          chalu: acc.demand.chalu + (Number(tax.demand.chalu) || 0),
        },
        recovery: {
          pb: acc.recovery.pb + (Number(tax.recovery.pb) || 0),
          chalu: acc.recovery.chalu + (Number(tax.recovery.chalu) || 0),
        },
        advance: {
          last: acc.advance.last + (Number(tax.advance.last) || 0),
          chalu: acc.advance.chalu + (Number(tax.advance.chalu) || 0),
        },
      }),
      {
        demand: { pb: 0, chalu: 0 },
        recovery: { pb: 0, chalu: 0 },
        advance: { last: 0, chalu: 0 },
      },
    );
  const handleTaxChange = (index, section, field, value) => {
    const updatedTaxes = [...taxes];
    updatedTaxes[index][section][field] = Number(value);
    setTaxes(updatedTaxes);
    setIsSaved(false);
  };
  const handleReceiptChange = (index, event) => {
    const { name, value } = event.target;
    setReceiptDetails((prev) =>
      prev.map((receipt, i) =>
        i === index ? { ...receipt, [name]: value } : receipt,
      ),
    );
    setIsSaved(false);
  };
  const addReceipt = () => {
    focusNewReceiptRef.current = true;
    setReceiptDetails((prev) => [...prev, createEmptyReceipt()]);
    setIsSaved(false);
  };
  const removeReceipt = (index) => {
    setReceiptDetails((prev) => prev.filter((_, i) => i !== index));
    setIsSaved(false);
  };
  // Form state
  const [formData, setFormData] = useState({});
  const [query, setQuery] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [project, setProject] = useState([]);

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
  const fetchRecordForEdit = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await fetch(
        `${await apiPath()}/api/sheet/${mId}?workId=${projectId}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const record = result.data;
      if (record) {
        // Populate formData
        setFormData({
          serialNumber: record[0] || "",
          areaName: record[1] || "",
          propertyNumber: record[2] || "",
          oldNumber: record[5] || "",
          ownerName: record[3] || "",
          houseCategory: record[8] || "",
        });
        setQuery(Number(record[0]));
        setTaxes([
          {
            id: "house",
            name: "ઘર વેરો",
            demand: {
              pb: Number(record[22] || 0),
              chalu: Number(record[20] || 0),
            },
            recovery: {
              pb: Number(JSON.parse(record[24] || "{}")?.vasulat?.prevtax || 0),
              chalu: Number(
                JSON.parse(record[24] || "{}")?.vasulat?.currtax || 0,
              ),
            },
            advance: { last: 0, chalu: 0 },
          },
          {
            id: "water_gen",
            name: "સામાન્ય પાણી વેરો",
            demand: {
              pb: Number(
                JSON.parse(record[23] || "{}")?.normal_water?.prev || 0,
              ),
              chalu: Number(
                JSON.parse(record[21] || "{}")?.normal_water?.curr || 0,
              ),
            },
            recovery: {
              pb: Number(
                JSON.parse(record[23] || "{}")?.normal_water?.vasulat || 0,
              ),
              chalu: Number(
                JSON.parse(record[21] || "{}")?.normal_water?.vasulat || 0,
              ),
            },
            advance: { last: 0, chalu: 0 },
          },
          {
            id: "water_spl",
            name: "ખાસ પાણી વેરો",
            demand: {
              pb: Number(
                JSON.parse(record[23] || "{}")?.special_water?.prev || 0,
              ),
              chalu: Number(
                JSON.parse(record[21] || "{}")?.special_water?.curr || 0,
              ),
            },
            recovery: {
              pb: Number(
                JSON.parse(record[23] || "{}")?.special_water?.vasulat || 0,
              ),
              chalu: Number(
                JSON.parse(record[21] || "{}")?.special_water?.vasulat || 0,
              ),
            },
            advance: { last: 0, chalu: 0 },
          },
          {
            id: "light",
            name: "લાઇટ વેરો",
            demand: {
              pb: Number(JSON.parse(record[23] || "{}")?.light?.prev || 0),
              chalu: Number(JSON.parse(record[21] || "{}")?.light?.curr || 0),
            },
            recovery: {
              pb: Number(JSON.parse(record[23] || "{}")?.light?.vasulat || 0),
              chalu: Number(
                JSON.parse(record[21] || "{}")?.light?.vasulat || 0,
              ),
            },
            advance: { last: 0, chalu: 0 },
          },
          {
            id: "cleaning",
            name: "સફાઈ વેરો",
            demand: {
              pb: Number(JSON.parse(record[23] || "{}")?.cleaning?.prev || 0),
              chalu: Number(
                JSON.parse(record[21] || "{}")?.cleaning?.curr || 0,
              ),
            },
            recovery: {
              pb: Number(
                JSON.parse(record[23] || "{}")?.cleaning?.vasulat || 0,
              ),
              chalu: Number(
                JSON.parse(record[21] || "{}")?.cleaning?.vasulat || 0,
              ),
            },
            advance: { last: 0, chalu: 0 },
          },
        ]);
        // Support both the new receipt array and old single receipt object.
        const record24 =
          typeof record[24] === "string"
            ? JSON.parse(record[24] || "{}")
            : record[24] || {};
        const savedReceipts = record24.receipt ?? record24.receipts ?? [];
        const receiptArray = Array.isArray(savedReceipts)
          ? savedReceipts
          : [savedReceipts];
        setReceiptDetails(
          receiptArray.length
            ? receiptArray.map((receipt) => ({
                pNo: String(receipt?.pNo ?? ""),
                date: String(receipt?.date ?? "").slice(0, 10),
                amount: String(receipt?.amount ?? ""),
              }))
            : [createEmptyReceipt()],
        );
      } else {
        setFormError("રેકોર્ડ મળ્યો નથી.");
      }
    } catch (err) {
      console.error("Error fetching record for edit:", err);
      setFormError("રેકોર્ડ લાવવામાં નિષ્ફળ.");
    } finally {
      setFormLoading(false);
    }
  };

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

  // Step 1: Fetch projectId when user is available
  useEffect(() => {
    fetchWork();
  }, [user]);

  // Step 2: Fetch all data when projectId changes
  useEffect(() => {
    if (!projectId) return;

    fetchProject();
    fetchRecordForEdit();
  }, [projectId, mId]);

  const handleSubmit = async (e) => {
    if (formLoading) return;
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    // Update time just before submission
    const finalFormData = {
      formData,
      taxes,
      receiptDetails,
      workId: projectId,
    };
    try {
      const response = await fetch(`${await apiPath()}/api/sheet/tax/${mId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(finalFormData),
      });
      const result = await response.json();
      if (response.ok) {
        console.log("Success:", result.message);
        setIsSaved(true);
        alert(`Entry Saved ✅`);
      } else {
        console.error("Error submitting form:", result.message);
        setFormError(`ફોર્મ અપડેટ કરવામાં ભૂલ: ${result.message}`);
      }
    } catch (error) {
      console.error("Network error or unexpected issue:", error);
      setFormError("નેટવર્ક ભૂલ અથવા અણધારી સમસ્યા આવી.");
    } finally {
      setFormLoading(false);
    }
  };
  console.log(formData);
  // Render form
  return (
    <div className="form-container">
      {/* Added margin for sidebar */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Water Tax Entry Form
      </h1>
      <div className="flex justify-around text-sm font-medium text-gray-600 mb-4">
        <span>ગામ: {project?.spot?.gaam || "..."}</span>
        <span>તાલુકો: {project?.spot?.taluka || "..."}</span>
        <span>જિલ્લો: {project?.spot?.district || "..."}</span>
        <span>વર્ષ {project?.details?.taxYear || ".."}</span>
      </div>
      {formError && (
        <div className="text-center text-red-600 text-lg mb-4">{formError}</div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onKeyDown={handleEntryKeyDown}
        className="space-y-6"
      >
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 md:p-6 flex flex-col gap-6">
            {/* Main Title */}
            <div className="bg-[#c2a77a] text-white text-center py-2 rounded shadow-sm font-bold text-lg tracking-wide">
              ગામનો નમુનો નંબર ૯
            </div>
            {/* Header Inputs - Responsive Grid */}
            <div
              className="gap-4 text-sm items-center"
              style={{ display: "flex", flexWrap: "wrap" }}
            >
              <div className="md:col-span-2 md:text-right font-medium text-gray-700">
                ખાતા નંબર
              </div>
              <div
                className="md:col-span-2"
                style={{ display: "flex", gap: "10px" }}
              >
                <input
                  type="number"
                  name="serialNumber"
                  ref={accountNumberRef}
                  autoFocus
                  data-entry-input="true"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  style={{
                    width: "70px",
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    setFormData({});
                    window.location.href = `/survay/watertaxform/${projectId}/${query}`;
                  }}
                  style={{
                    width: "50px",
                    background: "#9e4fff",
                    borderRadius: "5px",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Search size={20} className="text-white" />
                </button>
              </div>
              <div className="md:col-span-2 md:text-right font-medium text-gray-700">
                ખાતેદાર નું નામ
              </div>
              <div className="md:col-span-3">
                <input
                  type="text"
                  name="ownerName"
                  readOnly
                  tabIndex={-1}
                  value={formData?.ownerName || ""}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-1 md:text-right font-medium text-gray-700">
                પ્રોપર્ટી નંબર
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="propertyNumber"
                  readOnly
                  tabIndex={-1}
                  value={formData?.propertyNumber || ""}
                  className="w-full border border-gray-300 bg-yellow-50 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  style={{
                    width: "70px",
                  }}
                />
              </div>
              <div className="md:col-span-1 md:text-right font-medium text-gray-700">
                જૂનો મિ. નં.
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="oldNumber"
                  data-entry-input="true"
                  value={formData?.oldNumber || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      oldNumber: Number(e.target.value),
                    });
                    setIsSaved(false);
                  }}
                  className="w-full border border-gray-300 bg-yellow-50 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  style={{
                    width: "70px",
                  }}
                />
              </div>
            </div>
            {/* Responsive Table Wrapper */}
            <div
              className="overflow-x-auto rounded border shadow-sm"
              style={{ maxWidth: "fit-content" }}
            >
              <table
                className="border-collapse text-sm"
                style={{ maxWidth: "fit-content" }}
              >
                <thead>
                  <tr className="text-center font-semibold bg-gray-100 text-gray-700">
                    <th className="border border-gray-300 p-2" rowSpan="2">
                      વેરાના નામો
                    </th>
                    <th className="border border-gray-300 p-2" colSpan="3">
                      માંગણું
                    </th>
                    <th className="border border-gray-300 p-2" colSpan="3">
                      કુલ વસૂલાત
                    </th>
                    <th className="border border-gray-300 p-2" colSpan="3">
                      બાકી
                    </th>
                    {/* <th className="border border-gray-300 p-2 text-xs leading-tight">*
  ગઈ સાલના*
  <br />*
  જમા*
  </th>*
  <th className="border border-gray-300 p-2 text-xs leading-tight">*
  ચાલુસાલના*
  <br />*
  જમા*
  </th> */}
                  </tr>
                  <tr className="text-center font-medium bg-gray-50 text-gray-600 text-xs">
                    <th className="border border-gray-300 py-1 px-2">
                      પા. બા.
                    </th>
                    <th className="border border-gray-300 py-1 px-2">ચાલુ</th>
                    <th className="border border-gray-300 py-1 px-2">કુલ</th>
                    <th className="border border-gray-300 py-1 px-2">
                      પા. બા.
                    </th>
                    <th className="border border-gray-300 py-1 px-2">ચાલુ</th>
                    <th className="border border-gray-300 py-1 px-2">કુલ</th>
                    <th className="border border-gray-300 py-1 px-2">
                      પા. બા.
                    </th>
                    <th className="border border-gray-300 py-1 px-2">ચાલુ</th>
                    <th className="border border-gray-300 py-1 px-2">કુલ</th>
                    {/* <th className="border border-gray-300"></th>*
  <th className="border border-gray-300"></th> */}
                  </tr>
                </thead>
                <tbody>
                  {taxes.map(
                    (tax, index) =>
                      tax.id === "water_spl" && (
                        <tr key={tax.id} className="hover:bg-gray-50">
                          <td
                            className="border border-gray-300 px-3 py-2 font-medium bg-gray-50 text-gray-700 whitespace-nowrap"
                            style={{ width: "70px" }}
                          >
                            {tax.name}
                          </td>
                          {/* DEMAND */}
                          <InputCell
                            name="demand.pb"
                            value={tax.demand.pb}
                            onChange={(e) =>
                              handleTaxChange(
                                index,
                                "demand",
                                "pb",
                                e.target.value,
                              )
                            }
                          />
                          <InputCell
                            name="demand.chalu"
                            value={tax.demand.chalu}
                            onChange={(e) =>
                              handleTaxChange(
                                index,
                                "demand",
                                "chalu",
                                e.target.value,
                              )
                            }
                          />
                          <InputCell
                            name="demand.total"
                            value={tax.demand.pb + tax.demand.chalu}
                            isYellow
                          />
                          {/* RECOVERY */}
                          <InputCell
                            name="recovery.pb"
                            value={tax.recovery.pb}
                            onChange={(e) =>
                              handleTaxChange(
                                index,
                                "recovery",
                                "pb",
                                e.target.value,
                              )
                            }
                          />
                          <InputCell
                            name="recovery.chalu"
                            value={tax.recovery.chalu}
                            onChange={(e) =>
                              handleTaxChange(
                                index,
                                "recovery",
                                "chalu",
                                e.target.value,
                              )
                            }
                          />
                          <InputCell
                            name="recovery.total"
                            value={tax.recovery.pb + tax.recovery.chalu}
                            isYellow
                          />
                          {/* BALANCE */}
                          <InputCell
                            name="balance.pb"
                            value={tax.demand.pb - tax.recovery.pb}
                            isYellow
                          />
                          <InputCell
                            name="balance.chalu"
                            value={tax.demand.chalu - tax.recovery.chalu}
                            isYellow
                          />
                          <InputCell
                            name="balance.total"
                            value={
                              tax.demand.pb -
                              tax.recovery.pb +
                              (tax.demand.chalu - tax.recovery.chalu)
                            }
                            isYellow
                          />
                          {/* ADVANCE */}
                          {/* <InputCell*
  name="advance.last"*
  value={tax.advance.last}*
  onChange={(e) =>*
  handleTaxChange(*
  index,*
  "advance",*
  "last",*
  e.target.value,*
  )*
  }*
  />*
  <InputCell*
  name="advance.chalu"*
  value={tax.advance.chalu}*
  onChange={(e) =>*
  handleTaxChange(*
  index,*
  "advance",*
  "chalu",*
  e.target.value,*
  )*
  }*
  /> */}
                        </tr>
                      ),
                  )}
                  {/* Total Row */}
                  <tr className="bg-gray-100">
                    <td className="border border-gray-300 px-3 py-2 font-bold text-gray-800 text-right">
                      એકંદર કુલ
                    </td>
                    <InputCell value={totalTax.demand.pb} isYellow />
                    <InputCell value={totalTax.demand.chalu} isYellow />
                    <InputCell
                      value={totalTax.demand.pb + totalTax.demand.chalu}
                      isYellow
                    />
                    <InputCell value={totalTax.recovery.pb} isYellow />
                    <InputCell value={totalTax.recovery.chalu} isYellow />
                    <InputCell
                      value={totalTax.recovery.pb + totalTax.recovery.chalu}
                      isYellow
                    />
                    <InputCell
                      value={totalTax.demand.pb - totalTax.recovery.pb}
                      isYellow
                    />
                    <InputCell
                      value={totalTax.demand.chalu - totalTax.recovery.chalu}
                      isYellow
                    />
                    <InputCell
                      value={
                        totalTax.demand.pb -
                        totalTax.recovery.pb +
                        (totalTax.demand.chalu - totalTax.recovery.chalu)
                      }
                      isYellow
                    />
                    {/* <InputCell value={totalTax.advance.last} isYellow />*
  <InputCell value={totalTax.advance.chalu} isYellow /> */}
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Bottom Section - Receipt */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2 w-fit max-w-full border border-gray-300 bg-gray-50 rounded p-3 shadow-sm">
                <div className="text-center font-bold text-gray-700 mb-3 text-sm border-b pb-2">
                  પહોંચની વિગત
                </div>
                <div className="overflow-x-auto">
                  <div className="w-max">
                    <div
                      className="grid gap-2 text-xs font-medium text-center text-gray-600 mb-1"
                      style={{ gridTemplateColumns: "56px 136px 88px 64px" }}
                    >
                      <div>પહોંચ નં</div>
                      <div>તારીખ</div>
                      <div>રૂપિયા</div>
                      <div>ક્રિયા</div>
                    </div>
                    {receiptDetails.map((receipt, index) => (
                      <div
                        key={index}
                        className="grid gap-2 items-center mb-2"
                        style={{ gridTemplateColumns: "56px 136px 88px 64px" }}
                      >
                        <input
                          type="text"
                          name="pNo"
                          aria-label={`પહોંચ નંબર ${index + 1}`}
                          data-entry-input="true"
                          data-receipt-number="true"
                          value={receipt.pNo}
                          onChange={(e) => handleReceiptChange(index, e)}
                          className="w-full min-w-0 border border-gray-300 rounded px-1 py-1 text-center outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                          type="date"
                          name="date"
                          aria-label={`પહોંચ તારીખ ${index + 1}`}
                          data-entry-input="true"
                          value={receipt.date}
                          onChange={(e) => handleReceiptChange(index, e)}
                          className="w-full min-w-0 border border-gray-300 rounded px-1 py-1 text-center outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                        />
                        <input
                          type="number"
                          name="amount"
                          aria-label={`પહોંચ રકમ ${index + 1}`}
                          data-entry-input="true"
                          min="0"
                          step="0.01"
                          value={receipt.amount}
                          onChange={(e) => handleReceiptChange(index, e)}
                          className="w-full min-w-0 border border-gray-300 rounded px-1 py-1 text-right outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => removeReceipt(index)}
                          disabled={receiptDetails.length === 1}
                          aria-label={`પહોંચ ${index + 1} દૂર કરો`}
                          className="rounded py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          દૂર કરો
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addReceipt}
                  className="mt-2 px-3 py-1.5 rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  + નવી પહોંચ ઉમેરો
                </button>
              </div>
              <div className="flex justify-start gap-2 flex-wrap">
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`px-8 py-2 rounded-lg text-white font-bold text-lg shadow-md transition-colors 
                ${formLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 active:bg-green-800"}`}
                  style={{
                    fontSize: "14px",
                    padding: "5px 15px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Save size={20} className="text-white" />
                  {formLoading ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  disabled={formLoading || mId <= 1}
                  className={`px-8 py-2 rounded-lg text-white font-bold text-lg shadow-md transition-colors 
                ${formLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"}`}
                  style={{
                    fontSize: "14px",
                    padding: "5px 15px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  onClick={() => {
                    if (mId > 1)
                      if (!isSaved) {
                        if (
                          window.confirm(
                            "Entry is Not Saved! Are you sure to go Back?",
                          ) === true
                        )
                          window.location.href = `/survay/watertaxform/${projectId}/${Number(mId) - 1}`;
                      } else
                        window.location.href = `/survay/watertaxform/${projectId}/${Number(mId) - 1}`;
                  }}
                >
                  <CornerUpLeft size={20} className="text-white-500" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={formLoading}
                  className={`px-8 py-2 rounded-lg text-white font-bold text-lg shadow-md transition-colors 
                ${formLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"}`}
                  style={{
                    fontSize: "14px",
                    padding: "5px 15px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  onClick={() => {
                    if (!isSaved) {
                      if (
                        window.confirm(
                          "Entry is Not Saved! Are you sure to go Next?",
                        ) === true
                      )
                        window.location.href = `/survay/watertaxform/${projectId}/${Number(mId) + 1}`;
                    } else
                      window.location.href = `/survay/watertaxform/${projectId}/${Number(mId) + 1}`;
                  }}
                >
                  <CornerDownRight size={20} className="text-white-500" />
                  Next
                </button>
                <button
                  type="button"
                  disabled={formLoading}
                  className={`px-8 py-2 rounded-lg text-white font-bold text-lg shadow-md transition-colors 
                ${formLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 active:bg-red-800"}`}
                  style={{
                    fontSize: "14px",
                    padding: "5px 15px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  onClick={() => {
                    if (!isSaved) {
                      if (
                        window.confirm(
                          "Entry is Not Saved! Are you sure to Cancle the Form?",
                        ) === true
                      )
                        window.location.href = `/survay/watertaxform/${projectId}`;
                    } else
                      window.location.href = `/survay/watertaxform/${projectId}`;
                  }}
                >
                  <X size={20} className="text-white-500" />
                  Cancle
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
export default TaxEntryForm;
