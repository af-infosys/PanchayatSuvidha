import React from "react";
import LogoImage from "../../assets/logo.png";

// import ContentImage from "../../assets/cover/9d-i/content.png";
// import IconImage from "../../assets/cover/9d-i/icon.png";
// import Icon2Image from "../../assets/cover/9d-ii/icon.png";

// import toGujaratiNumber from "../toGujaratiNumber";

import WaleImage from "../../assets/wale.png";
import WaleImage2 from "../../assets/wale2.png";

// Utility component for the main text blocks
const TextBlock = ({ children }) => (
  <p
    className="text-m text-gray-800 leading-relaxed mt-2"
    style={{ fontSize: "19px" }}
  >
    {children}
  </p>
);

const TaxIndexRaw = ({
  part,
  project,
  totalHoouse,
  taxes,
  title,
  commercial,
  totalNormalBundles,

  coverProperties,
  pageFrom,
  pageTo,

  fromStart = 0,
  toEnd = 0,

  totalTabConn,
}) => {
  return (
    <div
      style={{
        position: "relative",
        paddingInline: "0",
        margin: 0,
        paddingLeft: "0",
      }}
    >
      {/* -------------------- 1. Top Header (Village, Taluka, District) -------------------- */}

      <img
        src={WaleImage}
        style={{
          position: "absolute",
          top: "-50px",
          right: "-40px",
          height: "calc(100% + 20px + 100px)",
        }}
      />

      <img
        src={WaleImage}
        style={{
          position: "absolute",
          top: "-50px",
          left: "-35px",
          height: "calc(100% + 20px + 100px)",
          transform: "scaleX(-1)",
        }}
      />

      <img
        src={WaleImage2}
        style={{
          position: "absolute",
          top: "-50px",
          left: "10px",
          width: "calc(100% - 20px)",
        }}
      />

      <img
        src={WaleImage2}
        style={{
          position: "absolute",
          bottom: "-70px",
          left: "10px",
          width: "calc(100% - 20px)",
        }}
      />

      {/* <img
        src={ContentImage}
        style={{
          position: "absolute",
          top: "350px",
          left: "-10px",
          width: "calc(100%)",
        }}
      /> */}

      {/* {commercial ? (
        <img
          src={Icon2Image}
          style={{
            position: "absolute",
            top: "210px",
            left: "10px",
            width: "calc(100%)",
          }}
        />
      ) : (
        <img
          src={IconImage}
          style={{
            position: "absolute",
            top: "210px",
            left: "10px",
            width: "calc(100%)",
          }}
        />
      )} */}

      <header
        className="grid grid-cols-3 font-bold pb-2"
        style={{
          marginTop: "85px",
          paddingTop: "20px",
          fontSize: "33px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          className="text-left text-blue-700"
          style={{ whiteSpace: "nowrap" }}
        >
          <span className="font-bold">મોજે : </span>-{" "}
          {project?.spot?.gaam || "..."}
        </div>
        <div className="text-center text-blue-700">
          <span className="font-bold">તાલુકો : </span>-{" "}
          {project?.spot?.taluka || "..."}
        </div>
        <div className="text-right text-blue-700">
          <span className="font-bold">જીલ્લો : </span>-{" "}
          {project?.spot?.district || "..."}
        </div>
      </header>

      {/* -------------------- 2. Main Title and Subtitle -------------------- */}
      <div className="text-center mt-2 mb-2">
        <h1
          className="text-4xl font-extrabold text-black inline-block"
          style={{
            borderRadius: "50px",
            padding: "8px 20px",
            paddingTop: "0px",
            paddingBottom: "35px",
            position: "relative",
            transform: "translateY(-15px)",
            marginTop: "20px",
            paddingInline: "40px",
          }}
        >
          ખાસ પાણી નળ વેરા રજીસ્ટર {title ? `- ${title}` : ""}
        </h1>
        <h2
          className="text-2xl font-semibold text-gray-700"
          style={{ marginTop: "-20px", fontSize: "30px" }}
        >
          ગ્રામ્ય જળ અને સ્વચ્છતા સમિતિ વર્ષ :-{" "}
          {project?.details?.taxYear || "2025/26"} (માંગણાં રજીસ્ટર)
        </h2>
      </div>

      {/* -------------------- 3. Instruction/Description Blocks -------------------- */}
      <div className="mt-3 text-justify">
        <TextBlock>
          ગ્રામ પંચાયત આકારણી સર્વે, વાર્ષીક જમાબંધી જમીન મહેસુલ હિસાબ, પંચાયત
          કરવેરાનું ૯(ડી) રજીસ્ટર, ગામના નમુના નં.ર, લેમીનેશન, સ્કેનીંગ વર્ક
          ગ્રામ પંચાયતની તમામ
          <br />
          પ્રકારની સ્ટેશનરી પંચાયત તથા રેવન્યુ ગામ નમુનાઓ, તેમજ પંચાયત હિસાબ
          નમુના મળશે. કોમ્પ્યુટરાઈઝડ તમામ પ્રકારનું કામ પ્રિન્ટીંગ કામ માટે મળો.
          (ગ્રામપંચાયત ડીજીટલ) માટે{" "}
        </TextBlock>

        <p className="taxes-container">
          <span className="tax-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M19,10 C20.1045695,10 21,10.8954305 21,12 L21,14 C21,14.5522847 20.5522847,15 20,15 L19,15 L19,18 C19,20.209139 17.209139,22 15,22 C12.790861,22 11,20.209139 11,18 L11,15 L4,15 C3.44771525,15 3,14.5522847 3,14 L3,12 C3,10.8954305 3.8954305,10 5,10 L11,10 L11,8 L9,8 C8.44771525,8 8,7.55228475 8,7 L8,5 C8,4.44771525 8.44771525,4 9,4 L11,4 L11,2 L13,2 L13,4 L15,4 C15.5522847,4 16,4.44771525 16,5 L16,7 C16,7.55228475 15.5522847,8 15,8 L13,8 L13,10 L19,10 Z M13,18 L13,15 L17,15 L17,18 C17,19.1045695 16.1045695,20 15,20 C13.8954305,20 13,19.1045695 13,18 Z" />
            </svg>
            {taxes[1]?.name} : <b>{taxes[1]?.values?.residence}</b> |
          </span>

          <span className="tax-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M19,10 C20.1045695,10 21,10.8954305 21,12 L21,14 C21,14.5522847 20.5522847,15 20,15 L19,15 L19,18 C19,20.209139 17.209139,22 15,22 C12.790861,22 11,20.209139 11,18 L11,15 L4,15 C3.44771525,15 3,14.5522847 3,14 L3,12 C3,10.8954305 3.8954305,10 5,10 L11,10 L11,8 L9,8 C8.44771525,8 8,7.55228475 8,7 L8,5 C8,4.44771525 8.44771525,4 9,4 L11,4 L11,2 L13,2 L13,4 L15,4 C15.5522847,4 16,4.44771525 16,5 L16,7 C16,7.55228475 15.5522847,8 15,8 L13,8 L13,10 L19,10 Z M13,18 L13,15 L17,15 L17,18 C17,19.1045695 16.1045695,20 15,20 C13.8954305,20 13,19.1045695 13,18 Z" />
            </svg>
            કુલ નળની સં. : <b>{totalTabConn || 0}</b>
          </span>

          {taxes?.map((tax, index) => {
            if (index < 4) return null;

            if (
              tax?.values?.commonPlot !== 0 ||
              tax?.values?.nonResidence !== 0 ||
              tax?.values?.plot !== 0 ||
              tax?.values?.residence !== 0
            )
              return (
                <span>
                  | {tax?.name} : <b>{tax?.values?.residence}</b>
                </span>
              );
          })}
        </p>
      </div>

      <div style={{ display: "flex", marginTop: "0px" }}>
        <div
          className="mt-5 p-3 border-4 border-dashed border-gray-400 rounded-lg"
          style={{
            maxWidth: "fit-content",
            minWidth: "800px",
          }}
        >
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
            <div className="col-span-2 space-y-4 pt-2 pr-6">
              <div className="text-base font-medium text-gray-800 space-y-1">
                <p
                  style={{
                    fontSize: "21px",
                    display: "flex",
                    flexDirection: "column",
                    paddingBottom: "5px",
                  }}
                >
                  <span style={{ fontSize: "28px", paddingBottom: "15px" }}>
                    એ.એફ. ઈન્ફોસીસ
                  </span>
                  <span>&bull; મુ:- સાવરકુંડલા. &bull; જીલ્લો:- અમરેલી.</span>
                </p>
                <p style={{ marginTop: "10px", fontSize: "19px" }}>
                  <b>એડ્રેસ :</b> સેન્ટ્રલ પોઈન્ટ કોમ્પલેક્ષ, બીજા માળે, જુના
                  બસસ્ટેન્ડ સામે, સાવરકુંડલા.
                </p>
                <p style={{ fontSize: "19px" }}>
                  પીન કોડ નં. ૩૬૪૫૧૫ સોરાષ્ટ્ર. (પશ્ચિમ ગુજરાત)
                </p>
              </div>

              <div className="mt-4 pt-0 border-t border-gray-300 flex items-center justify-between text-lg font-semibold">
                <p>
                  E-mail :{" "}
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
                style={{ gap: "10px", marginTop: "10px" }}
              >
                <p>શાહિદ કાલવા : 93764 43146</p>
                <span className="text-gray-400">|</span>
                <p>સરફરાઝ કાલવા : 99247 82732</p>
              </div>
            </div>

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

        <div
          className="mt-3 pt-3 border-t border-gray-300"
          style={{ marginLeft: "40px", marginTop: "30px", paddingTop: "30px" }}
        >
          <div
            className="gap-x-12 gap-y-6"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <div
              className="flex items-center text-xl font-medium text-gray-700"
              style={{ justifyContent: "start" }}
            >
              <label style={{ maxWidth: "fit-content", fontSize: "21px" }}>
                ભાગ :-
                <b
                  style={{
                    // paddingBottom: "1px",
                    paddingInline: "5px",
                    marginLeft: "2px",
                    // borderBottom: "1px solid #000",
                  }}
                >
                  {part} | <span style={{ fontWeight: "500" }}>ક્રમ:</span>{" "}
                  {fromStart} <span style={{ fontWeight: "500" }}> થી </span>{" "}
                  {toEnd} <span style={{ fontWeight: "500" }}> સુધી </span>
                </b>
              </label>
            </div>

            <div className="flex items-center text-xl font-medium text-gray-700">
              <label style={{ maxWidth: "fit-content", fontSize: "21px" }}>
                પાના નંબર :-
                <b
                  style={{
                    // paddingBottom: "1px",
                    paddingInline: "5px",
                    marginLeft: "2px",
                    // borderBottom: "1px solid #000",
                  }}
                >
                  {`${pageFrom} થી ${pageTo}`}
                </b>
              </label>
            </div>

            <div className="flex items-center text-xl font-medium text-gray-700">
              <label style={{ maxWidth: "fit-content", fontSize: "21px" }}>
                આ રજીસ્ટર ના ઘરની સંખ્યા :-
                <b
                  style={{
                    // paddingBottom: "1px",
                    paddingInline: "5px",
                    marginLeft: "2px",
                    // borderBottom: "1px solid #000",
                  }}
                >
                  {coverProperties}
                </b>
              </label>
            </div>

            <div className="flex items-center text-xl font-medium text-gray-700">
              <label style={{ maxWidth: "fit-content", fontSize: "21px" }}>
                ગામના કુલ ઘરની સંખ્યા :-
                <b
                  style={{
                    // paddingBottom: "1px",
                    paddingInline: "5px",
                    marginLeft: "2px",
                    // borderBottom: "1px solid #000",
                  }}
                >
                  {totalHoouse}
                </b>
              </label>
            </div>
          </div>
        </div>
      </div>

      <p
        style={{
          position: "absolute",
          bottom: "0px",
          right: "30px",
          fontSize: "17px",
          fontWeight: "600",
          color: "blue",
        }}
      >
        Cover - 2 {commercial ? `+ 2 (Comm.)` : "(Res.)"}
      </p>
    </div>
  );
};

export default TaxIndexRaw;
