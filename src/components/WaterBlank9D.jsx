import React from "react";

const WaterBlank9D = ({ item, id, project }) => {
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
                margin: "0 auto", // Centre alignment
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
                        ગ્રામ્ય જળ અને સ્વચ્છતા સમિતિ - ખાસ પાણી નળ વેરા રજીસ્ટર{" "}
                        {item?.isCommercial === true
                            ? " - કોમર્શિયલ મિલ્કત"
                            : item?.isCommercial === false
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

                {/* Table Header */}
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
                            <th className="th" rowSpan="2" style={{ maxWidth: "45px" }}>
                                <span className="formatting" style={{ fontSize: "12px" }}>
                                    ખાતાનો નંબર
                                </span>
                            </th>
                            <th className="th" rowSpan="2" style={{ maxWidth: "45px" }}>
                                <span className="formatting" style={{ fontSize: "12px" }}>
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
                                <React.Fragment key={index}>
                                    <th className="th">
                                        <span className="formatting">પા.બા</span>
                                    </th>
                                    <th className="th">
                                        <span className="formatting">ચાલુ</span>
                                    </th>
                                    <th className="th">
                                        <span className="formatting">કુલ</span>
                                    </th>
                                </React.Fragment>
                            ))}
                        </tr>

                        {/* Index Start */}
                        <tr>
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

                    {/* Table Rows: Each blank record gets its own tbody with a bottom border */}
                    {Array.from({ length: 6 }).map((_, index) => {
                        return (
                            <tbody key={index} style={{ borderBottom: "3px solid #000" }}>
                                {/* 1. માંગણું Row */}
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
                                        <span className="formatting"></span>
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
                                        <span className="formatting"></span>
                                    </td>

                                    <th
                                        className="td"
                                        style={{ textWrap: "nowrap", maxWidth: "40px" }}
                                    >
                                        <span className="formatting">માંગણું</span>
                                    </th>

                                    {/* 6 Categories * 3 Columns */}
                                    {Array.from({ length: 18 }).map((_, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className="td"
                                            style={{ textAlign: "right", minWidth: "40px" }}
                                        >
                                            <span
                                                className="formatting"
                                                style={{ textWrap: "nowrap" }}
                                            ></span>
                                        </td>
                                    ))}

                                    <td className="td" rowSpan={3}></td>
                                </tr>

                                {/* 2. વસુલાત Row */}
                                <tr style={{ maxHeight: "3px" }}>
                                    <th>
                                        <span className="formatting"></span>
                                    </th>
                                    <th className="td" style={{ maxHeight: "4x" }}>
                                        <span className="formatting" style={{ textWrap: "nowrap" }}>
                                            વસુલાત
                                        </span>
                                    </th>
                                    {Array.from({ length: 18 }).map((_, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className="td"
                                            style={{ textAlign: "right" }}
                                        >
                                            <span className="formatting"></span>
                                        </td>
                                    ))}
                                </tr>

                                {/* 3. બાકી Row */}
                                <tr>
                                    <th>
                                        <span className="formatting"></span>
                                    </th>
                                    <th className="td">
                                        <span className="formatting" style={{ textWrap: "nowrap" }}>
                                            બાકી
                                        </span>
                                    </th>
                                    {Array.from({ length: 18 }).map((_, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className="td"
                                            style={{ textAlign: "right" }}
                                        >
                                            <span className="formatting"></span>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        );
                    })}

                    {/* Totals Section */}
                    <tbody>
                        <tr>
                            <td colSpan="26" style={{ maxHeight: "4px" }}></td>
                        </tr>

                        {/* પાનાનું કુલ - માંગણું */}
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
                            {Array.from({ length: 18 }).map((_, idx) => (
                                <td key={idx} className="td" style={{ textAlign: "right" }}>
                                    <span className="formatting"></span>
                                </td>
                            ))}
                            <td className="td" rowSpan={3}></td>
                        </tr>

                        {/* પાનાનું કુલ - વસુલાત */}
                        <tr>
                            <th className="td">
                                <span className="formatting">વસુલાત</span>
                            </th>
                            {Array.from({ length: 18 }).map((_, idx) => (
                                <td key={idx} className="td" style={{ textAlign: "right" }}>
                                    <span className="formatting"></span>
                                </td>
                            ))}
                        </tr>

                        {/* પાનાનું કુલ - બાકી */}
                        <tr>
                            <th className="td">
                                <span className="formatting">બાકી</span>
                            </th>
                            {Array.from({ length: 18 }).map((_, idx) => (
                                <td key={idx} className="td" style={{ textAlign: "right" }}>
                                    <span className="formatting"></span>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WaterBlank9D;
