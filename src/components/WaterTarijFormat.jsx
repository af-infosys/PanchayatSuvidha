import React from "react";
import toGujaratiNumber from "./toGujaratiNumber";

const WaterTarijFormat = ({
    project,
    total,
    length,
    loading,
    error,
    name,
    totalTabConn,
}) => {
    console.log(total);
    return (
        <div id="pdf-content-wrapper" className="watermark">
            <h1
                className="text-xl font-bold text-center mb-0 text-gray-800"
                style={{ paddingTop: "30px" }}
            >
                ખાસ પાણી નળ વેરા કુલ મંગણાં તથા વસુલાતનો રિપોર્ટ (તારીજ){" "}
                {name && ` - ${name}`}
                <br />
                ગ્રામ્ય જળ અને સ્વચ્છતા સમિતિ સને {project?.details?.taxYear || ""}
            </h1>

            <div className="location-info-visible" style={{ paddingInline: "50px" }}>
                <h3>ગામ: {project?.spot?.gaam}</h3>

                <h3>તાલુકો: {project?.spot?.taluka}</h3>

                <h3>જિલ્લો: {project?.spot?.district}</h3>
            </div>

            <div className="table-responsive">
                <table className="report-table">
                    <thead className="thead">
                        <tr style={{ background: "transparent" }}>
                            <th
                                className="th"
                                colSpan="2"
                                rowSpan="2"
                                style={{
                                    minWidth: "70px",
                                    background: "transparent",
                                    color: "#000",
                                }}
                            >
                                <span className="formatting">વેરાઓના નામ</span>
                            </th>

                            <th
                                className="th"
                                colSpan="3"
                                style={{
                                    minWidth: "70px",
                                    background: "transparent",
                                    color: "#000",
                                }}
                            >
                                <span className="formatting">કુલ માંગણું</span>
                            </th>

                            <th
                                className="th"
                                colSpan="3"
                                style={{
                                    minWidth: "130px",
                                    background: "transparent",
                                    color: "#000",
                                }}
                            >
                                <span className="formatting">માંગણા પ્રમાણે વસુલાત</span>
                            </th>

                            <th
                                className="th"
                                colSpan="3"
                                style={{
                                    minWidth: "170px",
                                    background: "transparent",
                                    color: "#000",
                                }}
                            >
                                <span className="formatting">પહોંચ પ્રમાણે વસુલાત</span>
                            </th>

                            <th
                                className="th"
                                colSpan="3"
                                style={{
                                    minWidth: "100px",
                                    background: "transparent",
                                    color: "#000",
                                }}
                            >
                                <span className="formatting">કુલ બાકી</span>
                            </th>

                            <th
                                className="th"
                                rowSpan="2"
                                style={{
                                    // minWidth: "100px",
                                    background: "transparent",
                                    color: "#000",
                                }}
                            >
                                <span className="formatting">કુલ જાદે</span>
                            </th>
                        </tr>

                        <tr>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <>
                                    <th
                                        className="th"
                                        style={{ background: "transparent", color: "#000" }}
                                    >
                                        <span className="formatting">પા. બા</span>
                                    </th>

                                    <th
                                        className="th"
                                        style={{ background: "transparent", color: "#000" }}
                                    >
                                        <span className="formatting">ચાલુ</span>
                                    </th>

                                    <th
                                        className="th"
                                        style={{ background: "transparent", color: "#000" }}
                                    >
                                        <span className="formatting">કુલ</span>
                                    </th>
                                </>
                            ))}
                        </tr>

                        {/* Index Start */}
                        <tr>
                            {/* 1 to 14 th for index */}
                            {Array.from({ length: 14 }).map((_, index) => (
                                <th
                                    className="text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    style={{
                                        textAlign: "center",
                                        color: "black",
                                        background: "transparent",
                                    }}
                                    key={index}
                                    colSpan={index === 0 ? 2 : 1}
                                >
                                    <span className="formatting">
                                        {toGujaratiNumber(index + 1, 1)}
                                    </span>
                                </th>
                            ))}
                        </tr>
                        {/* Index End */}
                    </thead>

                    <tbody className="tbody">
                        {total?.houseTax ? (
                            <>
                                <tr>
                                    <td className="td">
                                        <span className="formatting">{toGujaratiNumber(1)}</span>
                                    </td>
                                    <td className="td">
                                        <span className="formatting">ખાસ પાણી નળ વેરો</span>
                                    </td>

                                    <td className="td">
                                        <span className="formatting">
                                            {toGujaratiNumber(total?.specialTax?.prev || " ", 1)}
                                        </span>
                                    </td>
                                    <td className="td">
                                        <span className="formatting">
                                            {toGujaratiNumber(total?.specialTax?.curr || " ", 1)}
                                        </span>
                                    </td>
                                    <td className="td">
                                        <span className="formatting">
                                            {toGujaratiNumber(
                                                (total?.specialTax?.prev || 0) +
                                                (total?.specialTax?.curr || 0),
                                                1,
                                            )}
                                        </span>
                                    </td>

                                    <td className="td">
                                        <span className="formatting"> </span>
                                    </td>
                                    <td className="td">
                                        <span className="formatting"> </span>
                                    </td>
                                    <td className="td">
                                        <span className="formatting"> </span>
                                    </td>

                                    <td className="td">
                                        <span className="formatting">
                                            {toGujaratiNumber(
                                                total?.specialTax?.vasulat?.prev || " ",
                                                1,
                                            )}
                                        </span>
                                    </td>
                                    <td className="td">
                                        <span className="formatting">
                                            {toGujaratiNumber(
                                                total?.specialTax?.vasulat?.curr || " ",
                                                1,
                                            )}
                                        </span>
                                    </td>
                                    <td className="td">
                                        <span className="formatting">
                                            {toGujaratiNumber(
                                                (total?.specialTax?.vasulat?.prev || 0) +
                                                (total?.specialTax?.vasulat?.curr || 0),
                                                1,
                                            )}
                                        </span>
                                    </td>

                                    <td className="td">
                                        <span className="formatting">
                                            {toGujaratiNumber(
                                                total?.specialTax?.prev -
                                                total?.specialTax?.vasulat?.prev || " ",
                                                1,
                                            )}
                                        </span>
                                    </td>
                                    <td className="td">
                                        <span className="formatting">
                                            {toGujaratiNumber(
                                                total?.specialTax?.curr -
                                                total?.specialTax?.vasulat?.curr || " ",
                                                1,
                                            )}
                                        </span>
                                    </td>
                                    <td className="td">
                                        <span className="formatting">
                                            {toGujaratiNumber(
                                                (total?.specialTax?.prev -
                                                    total?.specialTax?.vasulat?.prev || 0) +
                                                (total?.specialTax?.curr -
                                                    total?.specialTax?.vasulat?.curr || 0),
                                                1,
                                            )}
                                        </span>
                                    </td>

                                    <td className="td">
                                        <span className="formatting"> </span>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="td" colSpan="14" style={{ border: "none" }}>
                                        <span className="formatting">{""}</span>
                                    </td>
                                </tr>
                            </>
                        ) : (
                            <p>Loading house tax data... </p> // Or some other placeholder
                        )}
                        {/* </>
              ))} */}

                        {length === 0 && !loading && !error && (
                            <tr>
                                <td colSpan="14" className="td text-center">
                                    કોઈ રેકોર્ડ ઉપલબ્ધ નથી.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div
                className="location-info-visible"
                style={{ paddingInline: "50px", paddingTop: "10px" }}
            >
                <h3>કુલ મિલ્કતની સંખ્યા: {toGujaratiNumber(total?.totalCount)}</h3>

                <h3>કુલ પહોચની સંખ્યા: {toGujaratiNumber(total?.receiptCount)}</h3>

                <h3>કુલ નળની સંખ્યા: {toGujaratiNumber(totalTabConn)}</h3>

                {/* <h3>
                    વેરો લેવા પાત્ર મિલ્કતની સંખ્યા: {toGujaratiNumber(total?.countTax)}
                </h3> */}

                {/* <h3>
                    અન્ય મિલ્કત વેરો ન લેવાની મિલકતની સંખ્યા:{" "}
                    {toGujaratiNumber(total?.totalCount - total?.countTax)}
                </h3> */}
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "end",
                    paddingRight: "120px",
                    marginTop: "180px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <b style={{ fontSize: "18px" }}> તલાટી કમ મંત્રી </b>

                    <p>{project.spot?.gaam} ગ્રામપંચાયત </p>
                    <p style={{ display: "flex" }}>
                        <span>તા. {project?.spot?.taluka}</span>

                        <span style={{ marginLeft: "15px" }}>
                            જી. {project?.spot?.district}{" "}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WaterTarijFormat;
