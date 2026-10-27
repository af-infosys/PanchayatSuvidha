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
}) => {
  // Houses
  // const housesPerBundle = nop * 100;

  // const startHouseIndex = (part - 1) * housesPerBundle;
  // const remainingHouses = totalHoouse - startHouseIndex;

  // const registerHouseCount =
  //   remainingHouses >= housesPerBundle
  //     ? housesPerBundle
  //     : Math.max(remainingHouses, 0);

  // // Pages Range
  // const isLastBundle = remainingHouses <= housesPerBundle;

  // const pagesInThisBundle = isLastBundle
  //   ? Math.ceil(registerHouseCount / nop)
  //   : 100;

  // const startPage = (part - 1) * 100 + 1;
  // const endPage = startPage + pagesInThisBundle - 1;

  // const pageRange = `${startPage} થી ${endPage}`;

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
          ગામના નમુના નંબર ૯(ડી) વેરા રજીસ્ટર {title ? `- ${title}` : ""}
        </h1>
        <h2
          className="text-2xl font-semibold text-gray-700"
          style={{ marginTop: "-20px", fontSize: "30px" }}
        >
          વર્ષ :- {project?.details?.taxYear || "2025/26"}
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
              <path d="M12,2 C16.9705627,2 21,6.02943725 21,11 C21,15.9705627 16.9705627,20 12,20 C8.89438596,20 6.16086392,18.4253386 4.60628526,16 L2,16 L2,14 L3.44299885,14 C3.15568576,13.0645632 3,12.0560377 3,11 C3,6.02943725 7.02943725,2 12,2 Z M12,4 C8.13400675,4 5,7.13400675 5,11 C5,14.8659932 8.13400675,18 12,18 C15.8659932,18 19,14.8659932 19,11 C19,7.13400675 15.8659932,4 12,4 Z M12,6 C12.5522847,6 13,6.44771525 13,7 L13,10.169 L15.1161165,12.2851165 C15.5066408,12.6756408 15.5066408,13.3088058 15.1161165,13.6993301 C14.7255922,14.0898544 14.0924272,14.0898544 13.7019029,13.6993301 L11.2928932,11.2903204 C11.1053568,11.102784 11,10.8484372 11,10.5831356 L11,7 C11,6.44771525 11.4477153,6 12,6 Z" />
            </svg>{" "}
            {taxes[0]?.name} : <b>{taxes[0]?.values?.residence}</b> |
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
              <path d="M9,2 L15,2 L15,4 L18,4 C19.6568542,4 21,5.34314575 21,7 L21,9 C21,10.6568542 19.6568542,12 18,12 L18,14 C18,15.1045695 17.1045695,16 16,16 L14,16 L14,22 L10,22 L10,16 L8,16 C6.8954305,16 6,15.1045695 6,14 L6,12 C4.34314575,12 3,10.6568542 3,9 L3,7 C3,5.34314575 4.34314575,4 6,4 L9,4 L9,2 Z M18,6 L6,6 L6,9 C6,9.55228475 6.44771525,10 7,10 L17,10 C17.5522847,10 18,9.55228475 18,9 L18,6 Z M12,11 C11.4477153,11 11,11.4477153 11,12 L11,13 C11,13.5522847 11.4477153,14 12,14 C12.5522847,14 13,13.5522847 13,13 L13,12 C13,11.4477153 12.5522847,11 12,11 Z" />
            </svg>
            {taxes[2]?.name} : <b>{taxes[2]?.values?.residence}</b> |
          </span>

          <span className="tax-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M19.035,4.929 L20.449,6.343 L9.949,16.843 C9.667,17.125 9.256,17.228 8.887,17.121 L5.121,18.878 L2.293,21.707 L0.879,20.293 L3.707,17.464 L5.464,13.698 C5.357,13.329 5.46,12.919 5.743,12.636 L19.035,4.929 Z M15.464,9.257 L16.879,7.843 L19.707,10.672 L18.293,12.086 L15.464,9.257 Z M13.343,11.379 L14.757,9.964 L16.879,12.086 L15.464,13.5 L13.343,11.379 Z M11.222,13.5 L12.636,12.086 L14.757,14.207 L13.343,15.621 L11.222,13.5 Z" />
            </svg>
            {taxes[3]?.name} : <b>{taxes[3]?.values?.residence}</b>
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

      {/* Tax */}

      {/* <b
        style={{
          position: "absolute",
          bottom: "-230px",
          left: "357px",
          fontSize: "25px",
          fontWeight: "600",
          color: "black",
        }}
      >
        {taxes[0]?.values?.residence}/-
      </b>

      <b
        style={{
          position: "absolute",
          bottom: "-230px",
          left: "740px",
          fontSize: "25px",
          fontWeight: "600",
          color: "black",
        }}
      >
        {taxes[1]?.values?.residence}/-
      </b>

      <b
        style={{
          position: "absolute",
          bottom: "-290px",
          left: "483px",
          fontSize: "25px",
          fontWeight: "600",
          color: "black",
        }}
      >
        {taxes[2]?.values?.residence}/-
      </b>

      <b
        style={{
          position: "absolute",
          bottom: "-290px",
          left: "745px",
          fontSize: "25px",
          fontWeight: "600",
          color: "black",
        }}
      >
        {taxes[3]?.values?.residence}/-
      </b> */}

      {/* {coverProperties} */}

      {/* <b
        style={{
          position: "absolute",
          bottom: "-350px",
          left: "90px",
          fontSize: "25px",
          fontWeight: "600",
          color: "black",
        }}
      >
        {part}
      </b>

      <b
        style={{
          position: "absolute",
          bottom: "-387px",
          left: "320px",
          fontSize: "25px",
          fontWeight: "600",
          color: "black",
        }}
      >
        {coverProperties}
      </b>

      <b
        style={{
          position: "absolute",
          bottom: "-420px",
          left: "155px",
          fontSize: "25px",
          fontWeight: "600",
          color: "black",
        }}
      >
        {`${pageFrom} થી ${pageTo}`}
      </b>

      <b
        style={{
          position: "absolute",
          bottom: "-462px",
          left: "290px",
          fontSize: "25px",
          fontWeight: "600",
          color: "black",
        }}
      >
        {totalHoouse}
      </b> */}

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
