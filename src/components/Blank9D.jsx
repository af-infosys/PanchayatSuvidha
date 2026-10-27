import React from "react";
import toGujaratiNumber from "./toGujaratiNumber";

const Blank9D = ({ item, id, project }) => {
  return (
    <div
      key={id}
      id={id}
      className="report-page legal-landscape-dimensions"
      style={{
        width: "1700px",
        paddingTop: "55px",

        paddingLeft: "65px",
        paddingRight: "20px",
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
            પાના નં. ___
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
              <th className="th" rowSpan="2" style={{ maxWidth: "45px" }}>
                <span className="formatting" style={{ fontSize: "12px" }}>
                  ખાતાનો નંબર
                </span>
              </th>

              <th className="th" rowSpan="2" style={{ maxWidth: "45px" }}>
                <span className="formatting" style={{ fontSize: "12px" }}>
                  {" "}
                  પ્રોપર્ટી નંબર
                </span>
              </th>

              <th className="th" rowSpan="2" style={{ maxWidth: "90px" }}>
                <span className="formatting">એરિયાનું નામ</span>
              </th>

              <th className="th" rowSpan="2" style={{ maxWidth: "60px" }}>
                <span className="formatting">ખાતેદારનું નામ</span>
              </th>

              <th className="th" rowSpan="2" style={{ maxWidth: "45px" }}>
                <span className="formatting"> જૂનો મિ.નં. </span>
              </th>

              <th
                className="th"
                rowSpan="2"
                style={{ minWidth: "70px", maxWidth: "70px" }}
              >
                <span className="formatting">પહોચ નંબર તારીખ રકમ</span>
              </th>

              <th className="th" rowSpan="2" style={{ maxWidth: "90px" }}>
                <span className="formatting">વિગત</span>
              </th>

              <th className="th" colSpan="3" style={{ minWidth: "130px" }}>
                <span className="formatting">ઘર વેરો</span>
              </th>

              <th className="th" colSpan="3" style={{ minWidth: "130px" }}>
                <span className="formatting">સામાન્ય પાણી વેરો</span>
              </th>

              <th className="th" colSpan="3" style={{ minWidth: "130px" }}>
                <span className="formatting">ખાસ પાણી નળ વેરો</span>
              </th>

              <th className="th" colSpan="3" style={{ minWidth: "130px" }}>
                <span className="formatting">દિવાબતી લાઈટ વેરો</span>
              </th>

              <th className="th" colSpan="3" style={{ minWidth: "130px" }}>
                <span className="formatting">સફાઈ વેરો</span>
              </th>

              <th className="th" colSpan="3" style={{ minWidth: "130px" }}>
                <span className="formatting">કુલ એકંદર</span>
              </th>

              <th className="th" style={{ maxWidth: "40px" }} rowSpan="2">
                <span className="formatting" style={{ fontSize: "12px" }}>
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

          {Array.from({ length: 6 }).map((record, index) => {
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
                    <span className="formatting"></span>
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
                    <span className="formatting"></span>
                  </td>

                  <td
                    rowSpan="3"
                    style={{ verticalAlign: "top", paddingTop: "5px" }}
                  >
                    <span className="formatting"> </span>
                  </td>

                  <td
                    rowSpan="3"
                    style={{
                      verticalAlign: "top",
                      minWidth: "150px",
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
                    ></span>
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
                    ></span>
                  </td>

                  <td style={{ minWidth: "100px", maxWidth: "100px" }}>
                    <span className="formatting">{""}</span>
                  </td>

                  <th
                    className="td"
                    style={{ textWrap: "nowrap", maxWidth: "40px" }}
                  >
                    <span className="formatting">માંગણું</span>
                  </th>

                  {/* ઘર વેરો */}
                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>
                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>
                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  {/* ખાસ પાણી નળ વેરો */}
                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  {/* દિવાબતી લાઈટ વેરો */}
                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  {/* સફાઈ વેરો */}
                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  {/* કુલ એકંદર */}
                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  <td
                    className="td"
                    style={{ textAlign: "right", minWidth: "40px" }}
                  >
                    <span
                      className="formatting"
                      style={{ textWrap: "nowrap" }}
                    ></span>
                  </td>

                  {/* ગઈ સાલના જાદે */}
                  <td className="td" rowSpan={3}></td>
                </tr>

                <tr style={{ maxHeight: "3px" }}>
                  <th>
                    <span className="formatting">{""}</span>
                  </th>

                  <th className="td" style={{ maxHeight: "4x" }}>
                    <span className="formatting" style={{ textWrap: "nowrap" }}>
                      વસુલાત
                    </span>
                  </th>

                  {/* ઘર વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* સામાન્ય પાણી વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* ખાસ પાણી નળ વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* દિવાબતી લાઈટ વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* સફાઈ વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* કુલ એકંદર */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* ગઈ સાલના જાદે */}
                  {/* <td className="td"></td> */}
                </tr>

                <tr>
                  <th>
                    <span className="formatting">{""}</span>
                  </th>

                  <th className="td">
                    <span className="formatting" style={{ textWrap: "nowrap" }}>
                      બાકી
                    </span>
                  </th>

                  {/* ઘર વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* સામાન્ય પાણી વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* ખાસ પાણી નળ વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* દિવાબતી લાઈટ વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* સફાઈ વેરો */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* કુલ એકંદર */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>
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
              return (
                <React.Fragment key={categoryIndex}>
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* પા.બા */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>

                  {/* ચાલુ */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>
                  {/* કુલ */}
                </React.Fragment>
              );
            })}

            <td className="td" rowSpan={3}></td>
          </tr>

          <tr>
            <th className="td">
              <span className="formatting">વસુલાત</span>
            </th>

            {Array.from({ length: 6 }).map((_, categoryIndex) => {
              return (
                <React.Fragment key={categoryIndex}>
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>{" "}
                  {/* પા.બા */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>{" "}
                  {/* ચાલુ */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>{" "}
                  {/* કુલ */}
                </React.Fragment>
              );
            })}
          </tr>

          {/* Outstanding Row: બાકી */}
          <tr>
            <th className="td">
              <span className="formatting">બાકી</span>
            </th>
            {Array.from({ length: 6 }).map((_, categoryIndex) => {
              return (
                <React.Fragment key={categoryIndex}>
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>{" "}
                  {/* પા.બા */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>{" "}
                  {/* ચાલુ */}
                  <td className="td" style={{ textAlign: "right" }}>
                    <span className="formatting"></span>
                  </td>{" "}
                  {/* કુલ */}
                </React.Fragment>
              );
            })}
          </tr>
        </table>
      </div>
    </div>
  );
};

export default Blank9D;
