import React, { useMemo, useState } from "react";
import "./TaxRegisterReport.css";
import TinyLoader from "../TinyLoader/TinyLoader";

// Works with the existing sheet API's array-based records.
// There are deliberately no changes to the backend field positions.
const parseField = (value) => {
  if (value === null || value === undefined || value === "") return {};
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const gujaratiDigits = "૦૧૨૩૪૫૬૭૮૯";

const toNumber = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const normalized = String(value)
    .replace(/[૦-૯]/g, (digit) => String(gujaratiDigits.indexOf(digit)))
    .replace(/[₹,\s]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const displayText = (value) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "—"
    : String(value);

const formatMoney = (value) => {
  const number = toNumber(value);
  return number === null
    ? displayText(value)
    : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
        number,
      );
};

const formatReceiptDate = (date) => {
  if (!date) return "—";
  const text = String(date);
  // Format ISO dates only; leave DD/MM/YYYY and other backend formats intact.
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(text);
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : text;
};

const taxData = (value) => {
  const parsed = parseField(value);
  if (Array.isArray(parsed)) {
    return parsed.find((item) => item?.special_water)?.special_water ?? {};
  }
  return parsed?.special_water ?? {};
};

const receiptData = (value) => {
  const parsed = parseField(value);
  const item = Array.isArray(parsed) ? parsed[0] : parsed;
  return item?.receipt ?? item ?? {};
};

const makeRow = (record, index, projectId) => {
  const previous = taxData(record[23]);
  const current = taxData(record[21]);
  const receipt = receiptData(record[24]);
  const previousRaw = parseField(record[23]);

  // Original report reads outstanding balances from record[23][1].
  // If the API does not provide those fields, show a dash rather than guess.
  const balance = previousRaw?.[1] ?? {};

  const total = (a, b) => {
    const left = toNumber(a);
    const right = toNumber(b);
    return left === null && right === null ? null : (left ?? 0) + (right ?? 0);
  };

  const encodedId = encodeURIComponent(projectId ?? "");
  const encodedRowId = encodeURIComponent(record[0] ?? "");

  // Support both receipt array and full receipt object
  const receiptList = Array.isArray(receipt?.receipt)
    ? receipt.receipt
    : Array.isArray(receipt)
      ? receipt
      : [];

  // Helper for comma-separated values
  const joinReceiptValues = (key, formatter) =>
    receiptList
      .map((item) => item?.[key])
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map(formatter)
      .join(", ") || "—";

  return {
    key: `${record[0] ?? "row"}-${index}`,
    serial: displayText(record[0]),
    area: displayText(record[1]),
    connection: displayText(record[2]),
    // NOTE: the supplied report uses record[2] for both connection and old number.
    // Change this index only after confirming your API's actual old-number column.
    oldNumber: displayText(record[5]),
    owner: displayText(record[3]),
    mobile: displayText(record[6]),
    tapCount: displayText(record[12]),
    receiptNo: joinReceiptValues("pNo", displayText),
    receiptDate: joinReceiptValues("date", formatReceiptDate),
    receiptAmount: joinReceiptValues("amount", formatMoney),
    demand: [
      previous?.prev,
      current?.curr,
      total(previous?.prev, current?.curr),
    ],
    collection: [
      previous?.vasulat,
      current?.vasulat,
      total(previous?.vasulat, current?.vasulat),
    ],
    balance: [
      balance?.prev,
      balance?.curr,
      total(balance?.prev, balance?.curr),
    ],
    waterLink: `/water/taxentry/${encodedRowId}`,
    taxLink: `/water/taxentry/${encodedRowId}`,
  };
};

const price = (value) => (
  <span className="trr-number">{formatMoney(value)}</span>
);

const ReceiptDetails = ({ row }) => (
  <div className="trr-receipt">
    <div className="trr-receipt-line">
      <span>પહોંચ નં.</span>
      <strong>{row.receiptNo}</strong>
    </div>
    <div className="trr-receipt-line">
      <span>તારીખ</span>
      <strong>{row.receiptDate}</strong>
    </div>
    <div className="trr-receipt-line trr-receipt-amount">
      <span>રકમ</span>
      <strong>
        {row.receiptAmount === "—" ? "—" : `₹${row.receiptAmount}`}
      </strong>
    </div>
  </div>
);

const TaxSummary = ({ row }) => (
  <table className="trr-mini-table" aria-label={`કરવેરાની વિગત ${row.serial}`}>
    <thead>
      <tr>
        <th>વિગત</th>
        <th>પા.બા</th>
        <th>ચાલુ</th>
        <th>કુલ</th>
      </tr>
    </thead>
    <tbody>
      {[
        ["માંગણું", row.demand],
        ["વસુલાત", row.collection],
        ["બાકી", row.balance],
      ].map(([label, values]) => (
        <tr key={label}>
          <th scope="row">{label}</th>
          {values.map((value, index) => (
            <td key={index}>{price(value)}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

/**
 * Usage inside your existing TaxRegister component:
 * <TaxRegisterReport
 *   records={records}
 *   project={project}
 *   projectId={projectId}
 *   loading={loading}
 *   error={error}
 * />
 */
export default function TaxRegisterReport({
  records = [],
  project = {},
  projectId,
  loading = false,
  error = null,
  year = "૨૦૨૫/૨૬",
}) {
  const [search, setSearch] = useState("");

  const allRows = useMemo(
    () =>
      (Array.isArray(records) ? records : [])
        .filter(Array.isArray)
        .map((record, index) => makeRow(record, index, projectId)),
    [records, projectId],
  );

  const visibleRows = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    if (!keyword) return allRows;
    return allRows.filter((row) =>
      [row.serial, row.area, row.connection, row.owner, row.mobile]
        .join(" ")
        .toLocaleLowerCase()
        .includes(keyword),
    );
  }, [allRows, search]);

  return (
    <section className="trr-page" aria-label="કરવેરા રજીસ્ટર">
      <header className="trr-header">
        <div className="trr-heading">
          <span className="trr-eyebrow">ગ્રામ્ય જળ અને સ્વચ્છતા સમિતિ</span>
          <h1>ખાસ પાણી નળ વેરા રજીસ્ટર</h1>
          <p>વર્ષ {year} • (માંગણાં રજીસ્ટર)</p>
        </div>
      </header>

      <div className="trr-location" aria-label="ગામની માહિતી">
        <div>
          <span>ગામ</span>
          <strong>{displayText(project?.spot?.gaam)}</strong>
        </div>
        <div>
          <span>તાલુકો</span>
          <strong>{displayText(project?.spot?.taluka)}</strong>
        </div>
        <div>
          <span>જિલ્લો</span>
          <strong>{displayText(project?.spot?.district)}</strong>
        </div>
      </div>

      <div className="trr-toolbar">
        <div className="trr-count">
          <strong>{visibleRows.length}</strong> રેકોર્ડ
          {search && <span>({allRows.length} માંથી)</span>}
        </div>
        <label className="trr-search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="નામ, વિસ્તાર કે કનેક્શન શોધો..."
            aria-label="રેકોર્ડ શોધો"
          />
        </label>
      </div>

      {loading && allRows.length === 0 ? (
        <div className="trr-status" role="status">
          <TinyLoader /> રેકોર્ડ લોડ થઈ રહ્યા છે...
        </div>
      ) : error && allRows.length === 0 ? (
        <div className="trr-status trr-error" role="alert">
          <TinyLoader /> {error}
        </div>
      ) : visibleRows.length === 0 ? (
        <div className="trr-status">
          {search ? "આ શોધ માટે કોઈ રેકોર્ડ મળ્યો નથી." : <TinyLoader />}
        </div>
      ) : (
        <>
          <div className="trr-table-wrap">
            <table className="trr-table">
              <thead>
                <tr>
                  {[
                    "ક્રમ નં.",
                    "વિસ્તારનું નામ",
                    "કનેક્શન નં.",
                    "જુનો મિ.નં.",
                    "નળ ધારકનું નામ તથા મોબાઈલ",
                    "નળની સંખ્યા",
                    "પહોંચની વિગત",
                    "વિગત",
                    "પા.બા",
                    "ચાલુ",
                    "કુલ",
                  ].map((title) => (
                    <th scope="col" key={title}>
                      {title}
                    </th>
                  ))}
                </tr>
                <tr className="trr-index-row">
                  {Array.from({ length: 11 }, (_, index) => (
                    <th key={index}>{index + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <React.Fragment key={row.key}>
                    <tr className="trr-entry-start">
                      <td rowSpan={3} className="trr-serial">
                        {row.serial}
                      </td>
                      <td rowSpan={3} className="trr-area">
                        {row.area}
                      </td>
                      <td rowSpan={3}>{row.connection}</td>
                      <td rowSpan={3}>{row.oldNumber}</td>
                      <td rowSpan={3} className="trr-owner">
                        <a
                          href={row.waterLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="પાણી વેરા ફોર્મ ખોલો"
                        >
                          {row.owner}
                        </a>
                        <span>{row.mobile}</span>
                      </td>
                      <td rowSpan={3} className="trr-center">
                        {row.tapCount}
                      </td>
                      <td rowSpan={3} className="trr-receipt-cell">
                        <ReceiptDetails row={row} />
                      </td>
                      <th scope="row" className="trr-detail">
                        માંગણું
                      </th>
                      {row.demand.map((value, index) => (
                        <td className="trr-amount" key={index}>
                          {price(value)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th scope="row" className="trr-detail">
                        <a
                          href={row.taxLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="કરવેરા ફોર્મ ખોલો"
                        >
                          વસુલાત
                        </a>
                      </th>
                      {row.collection.map((value, index) => (
                        <td className="trr-amount" key={index}>
                          {price(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="trr-entry-end">
                      <th scope="row" className="trr-detail trr-balance-label">
                        <a
                          href={row.taxLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="કરવેરા ફોર્મ ખોલો"
                        >
                          બાકી
                        </a>
                      </th>
                      {row.balance.map((value, index) => (
                        <td
                          className="trr-amount trr-balance-value"
                          key={index}
                        >
                          {price(value)}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="trr-mobile-list">
            {visibleRows.map((row) => (
              <article className="trr-card" key={row.key}>
                <div className="trr-card-head">
                  <div>
                    <span className="trr-card-kicker">
                      ક્રમ નં. {row.serial}
                    </span>
                    <h2>{row.owner}</h2>
                    <span className="trr-card-subtitle">{row.area}</span>
                  </div>
                  <span className="trr-connection">#{row.connection}</span>
                </div>
                <dl className="trr-meta-grid">
                  <div>
                    <dt>મોબાઈલ</dt>
                    <dd>{row.mobile}</dd>
                  </div>
                  <div>
                    <dt>જુનો મિ.નં.</dt>
                    <dd>{row.oldNumber}</dd>
                  </div>
                  <div>
                    <dt>નળની સંખ્યા</dt>
                    <dd>{row.tapCount}</dd>
                  </div>
                </dl>
                <div className="trr-card-section-label">પહોંચની વિગત</div>
                <ReceiptDetails row={row} />
                <div className="trr-card-section-label">કરવેરાની વિગત</div>
                <TaxSummary row={row} />
                <div className="trr-card-actions">
                  <a
                    href={row.waterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    પાણી વેરો ફોર્મ ↗
                  </a>
                  {/* <a
                    href={row.taxLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    કરવેરા ફોર્મ ↗
                  </a> */}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
