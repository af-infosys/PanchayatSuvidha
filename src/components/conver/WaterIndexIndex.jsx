import React from "react";
import LogoImage from "../../assets/logo.png";
import WaleImage from "../../assets/wale.png";

// Utility component for the main text blocks
const TextBlock = ({ children }) => (
  <p
    className="text-gray-800 leading-relaxed mt-4 text-center"
    style={{ fontSize: "18px", lineHeight: "1.6" }}
  >
    {children}
  </p>
);

const WaterIndexIndex = ({
  part,
  nop,
  project,
  totalHoouse,
  commercial = undefined,
}) => {
  console.log(project);

  const housesPerBundle = nop * 100;
  const startHouseIndex = (part - 1) * housesPerBundle;
  const remainingHouses = totalHoouse - startHouseIndex;

  const registerHouseCount =
    remainingHouses >= housesPerBundle
      ? housesPerBundle
      : Math.max(remainingHouses, 0);

  const isLastBundle = remainingHouses <= housesPerBundle;
  const pagesInThisBundle = isLastBundle
    ? Math.ceil(registerHouseCount / nop)
    : 100;

  const startPage = (part - 1) * 100 + 1;
  const endPage = startPage + pagesInThisBundle - 1;
  const pageRange = `${startPage} થી ${endPage}`;

  return (
    <div
      style={{
        position: "relative",
        width: "210mm", // A4 Width
        minHeight: "297mm", // A4 Height
        padding: "5mm",
        margin: "0 auto",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",

        paddingLeft: "70px",
        paddingRight: "75px",
        overflow: "hidden",
      }}
    >
      <img
        src={WaleImage}
        style={{
          position: "absolute",
          top: "0",
          right: "-10px",
          height: "calc(100% + 50px)",
        }}
      />

      {/* -------------------- 1. Top Header -------------------- */}
      <header
        className="grid grid-cols-1 gap-4 text-2xl font-bold border-b-2 border-blue-800 pb-4"
        style={{ marginTop: "40px", marginInline: "20px" }}
      >
        <div className="flex justify-between text-blue-700">
          <span style={{ whiteSpace: "nowrap" }}>
            <span className="font-extrabold">મોજે : </span>
            {project?.spot?.gaam || "..."}
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            <span className="font-extrabold">તાલુકો : </span>
            {project?.spot?.taluka || "..."}
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            <span className="font-extrabold">જીલ્લો : </span>
            {project?.spot?.district || "..."}
          </span>
        </div>
      </header>

      {/* -------------------- 2. Main Title -------------------- */}
      <div className="text-center mt-2 mb-2">
        <h2 className="text-2xl font-semibold mt-4 text-gray-700 mb-4">
          ખાસ પાણી નળ વેરા રજીસ્ટર
        </h2>
        <h1
          className="text-4xl font-extrabold text-blue-900  border-blue-900 p-4 inline-block"
          style={{
            border: "8px double darkblue",
            borderRadius: "50px",
            padding: "8px 20px",
            paddingTop: "0px",
            paddingBottom: "20px",
            position: "relative",
            transform: "translateY(-15px)",
            marginTop: "20px",
          }}
        >
          Index Book - પાનોત્રી બુક{" "}
          {commercial ? "(કોમર્શિયલ)" : commercial === false ? "(રહેણાંક)" : ""}
        </h1>
        <h2 className="text-2xl font-semibold mt-2 text-gray-700">
          સને :- {project?.details?.taxYear || "2025/26"}
        </h2>
      </div>

      {/* -------------------- 3. Instruction Blocks -------------------- */}
      <div className="mt-0">
        <TextBlock>
          ગ્રામ પંચાયત આકારણી સર્વે, વાર્ષીક જમાબંધી જમીન મહેસુલ હિસાબ, પંચાયત
          કરવેરાનું ૯(ડી) રજીસ્ટર, ગામના નમુના નં.ર, લેમીનેશન, સ્કેનીંગ વર્ક
          ગ્રામ પંચાયતની તમામ પ્રકારની સ્ટેશનરી પંચાયત તથા રેવન્યુ ગામ નમુનાઓ
          મળશે.
        </TextBlock>
      </div>

      {/* -------------------- 4. Computerised By Block (Stacked for Portrait) -------------------- */}
      <div className="mt-6 p-6 border-4 border-dashed border-gray-400 rounded-lg w-full">
        <div className="text-center text-3xl font-bold text-gray-600">
          --: કોમ્પ્યુટરાઈઝ કરનાર :--
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "0px",
          }}
        >
          {/* Left Column (Address Details) */}
          <div className="col-span-2 space-y-4 pt-4 pr-6">
            <div className="text-base font-medium text-gray-800 space-y-1">
              <p
                style={{
                  fontSize: "21px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontSize: "24px", paddingBottom: "10px" }}>
                  એ.એફ. ઈન્ફોસીસ
                </span>
                <span>&bull; મુ:- સાવરકુંડલા. &bull; જીલ્લો:- અમરેલી.</span>
              </p>
              <p style={{ marginTop: "15px", fontSize: "18px" }}>
                <b>એડ્રેસ :</b> સેન્ટ્રલ પોઈન્ટ કોમ્પલેક્ષ, બીજા માળે, જુના
                બસસ્ટેન્ડ સામે, સાવરકુંડલા.
              </p>
              <p style={{ marginTop: "5px", fontSize: "17px" }}>
                પીન કોડ નં. ૩૬૪૫૧૫ સોરાષ્ટ્ર. (પશ્ચિમ ગુજરાત)
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-300 flex items-center justify-between text-lg font-semibold">
              <p>
                <span className="text-blue-600">af.infosys146@gmail.com</span>
              </p>
              <a
                href="https://www.afinfosys.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                www.afinfosys.com
              </a>
            </div>

            <div
              className="flex justify-start text-xl font-extrabold text-blue-900"
              style={{
                gap: "10px",
                marginTop: "10px",
                flexDirection: "column",
              }}
            >
              <p>શાહિદ કાલવા : 93764 43146</p>
              {/* <span className="text-gray-400">|</span> */}
              <p>સરફરાઝ કાલવા : 99247 82732</p>
            </div>
          </div>

          {/* Right Column (Logo) */}
          <div className="col-span-1 flex justify-center items-center">
            <img
              src={LogoImage}
              alt="A.F. Infosys Logo Placeholder"
              className="w-48 h-48 object-contain rounded-lg shadow-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/200x200/CCCCCC/000000?text=LOGO";
              }}
            />
          </div>
        </div>
      </div>

      {/* -------------------- 5. Footer Data/Counters -------------------- */}
      {/* <div
        className="mb-10 border-t-2 border-gray-300"
        style={{ paddingInline: "50px", marginTop: "30px", paddingTop: "30px" }}
      >
        <div className="grid grid-cols-2 gap-y-6 gap-x-10">
          <div className="flex justify-between items-center pb-1">
            <span className="text-xl font-bold">ભાગઃ–</span>
            <span className="text-xl font-extrabold">{part}</span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <span className="text-xl font-bold">પાના નંબરઃ–</span>
            <span className="text-xl font-extrabold">{pageRange}</span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <span className="text-xl font-bold">આ રજીસ્ટરના ઘરની સંખ્યા:-</span>
            <span className="text-xl font-extrabold">{registerHouseCount}</span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <span className="text-xl font-bold">ગામના કુલ ઘરની સંખ્યા:-</span>
            <span className="text-xl font-extrabold">{totalHoouse}</span>
          </div>
        </div>
      </div> */}

      <p
        className="absolute text-xs text-gray-800"
        style={{ bottom: "120px", right: "150px" }}
      >
        Cover - {part}
      </p>
    </div>
  );
};

export default WaterIndexIndex;
