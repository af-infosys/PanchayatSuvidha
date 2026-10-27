// import {
//   Cell,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   LabelList,
// } from "recharts"; // ગ્રાફ માટે

// import House1 from "../assets/icon/analytics/House.png";
// import House2 from "../assets/icon/analytics/PakaMakan.png";
// import House3 from "../assets/icon/analytics/KachaMakan.png";

// import houseTax from "../assets/icon/tax/houseTax.png";
// import waterTax from "../assets/icon/tax/waterTax.png";
// import specialTax from "../assets/icon/tax/specialTax.png";
// import lightTax from "../assets/icon/tax/lightTax.png";
// import cleanTax from "../assets/icon/tax/cleanTax.png";

// const TarijChart = ({ project, total, totalResidence, name }) => {
//   console.log("Tarij", total);

//   return (
//     <div id="pdf-content-wrapper" className="watermark">
//       <h1
//         className="text-xl font-bold text-center mb-0 text-gray-800"
//         style={{ paddingTop: "80px" }}
//       >
//         {name} | સને {project?.details?.taxYear || ""}
//       </h1>

//       <div
//         className="location-info-visible"
//         style={{
//           paddingInline: "200px",
//           marginTop: "10px",
//           marginBottom: "10px",
//         }}
//       >
//         <h3>ગામ: {project?.spot?.gaam}</h3>

//         <h3>તાલુકો: {project?.spot?.taluka}</h3>

//         <h3>જિલ્લો: {project?.spot?.district}</h3>
//       </div>

//       <div style={{ display: "flex", justifyContent: "center" }}>
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: "20px",
//             justifyContent: "flex-end",
//             maxWidth: "50px",
//             paddingBottom: "30px",
//           }}
//         >
//           <img src={House1} style={{ width: "100%" }} />
//           <img src={House2} style={{ width: "100%" }} />
//           <img src={House3} style={{ width: "100%" }} />
//         </div>

//         <div className="flex flex-col items-center">
//           {/* <h3 className="text-xl font-bold mb-4"></h3> */}
//           <BarChart
//             width={150}
//             height={400}
//             margin={{ top: 30 }}
//             data={[
//               {
//                 name: `કુલ ઘર `,
//                 count: totalResidence || 0,
//               },
//             ]}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="count" barSize={60}>
//               <Cell fill="#c4b28f" />

//               <LabelList
//                 dataKey="count"
//                 position="top"
//                 style={{ fill: "#000", fontSize: 14, fontWeight: "700" }}
//               />
//             </Bar>
//           </BarChart>
//         </div>

//         <div
//           className="flex flex-col items-center"
//           style={{ marginLeft: "50px" }}
//         >
//           {/* <h3 className="text-xl font-bold mb-4"></h3> */}
//           <BarChart
//             width={800}
//             height={400}
//             margin={{ top: 30 }}
//             data={[
//               {
//                 name: `ઘર વેરો`,
//                 count: total?.houseTax?.curr || 0,
//               },
//               {
//                 name: `સામાન્ય પાણી વેરો`,
//                 count: total?.waterTax?.curr || 0,
//               },
//               {
//                 name: `ખાસ પાણી વેરો`,
//                 count: total?.specialTax?.curr || 0,
//               },
//               {
//                 name: `લાઈટ વેરો`,
//                 count: total?.lightTax?.curr || 0,
//               },
//               {
//                 name: `સફાઈ વેરો`,
//                 count: total?.cleanTax?.curr || 0,
//               },
//               {
//                 name: `કુલ વેરો`,
//                 count:
//                   total?.houseTax?.curr +
//                     total?.waterTax?.curr +
//                     total?.specialTax?.curr +
//                     total?.lightTax?.curr +
//                     total?.cleanTax?.curr || 0,
//               },
//             ]}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="count" barSize={60}>
//               <Cell fill="#2ECC71" />
//               <Cell fill="#E74C3C" />
//               <Cell fill="#F39C12" />
//               <Cell fill="#9B59B6" />
//               <Cell fill="#FCD34D" />
//               <Cell fill="#3B82F6" />

//               <LabelList
//                 dataKey="count"
//                 position="top"
//                 style={{ fill: "#000", fontSize: 14, fontWeight: "700" }}
//               />
//             </Bar>
//           </BarChart>
//         </div>
//       </div>

//       <div
//         style={{
//           display: "flex",
//           gap: "72px",
//           justifyContent: "center",
//           maxHeight: "70px",
//           paddingLeft: "340px",
//           paddingRight: "0px",

//           marginTop: "5px",
//         }}
//       >
//         <img src={houseTax} style={{ width: "50px" }} />
//         <img src={waterTax} style={{ width: "50px" }} />
//         <img src={specialTax} style={{ width: "50px" }} />
//         <img src={lightTax} style={{ width: "50px" }} />
//         <img src={cleanTax} style={{ width: "50px" }} />

//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             fontSize: "12px",
//             lineHeight: "15px",
//             paddingLeft: "15px",
//           }}
//         >
//           <span>ઘર વેરો</span>

//           <span>સામાન્ય પાણી વેરો</span>

//           <span>ખાસ પાણી વેરો</span>

//           <span>લાઈટ વેરો</span>

//           <span>સફાઈ વેરો</span>
//         </div>
//       </div>

//       <div
//         style={{
//           display: "flex",
//           gap: "72px",
//           justifyContent: "center",
//           maxHeight: "70px",
//           paddingLeft: "310px",
//           paddingRight: "0px",

//           marginTop: "15px",
//         }}
//       >
//         <span
//           style={{
//             border: "1px solid black",
//             padding: "5px 10px",
//             fontSize: "12px",
//             fontWeight: "700",
//             minWidth: "50px",
//             textAlign: "center",

//             paddingTop: 0,
//             paddingBottom: "10px",
//           }}
//         >
//           A
//         </span>
//         <span
//           style={{
//             border: "1px solid black",
//             padding: "5px 10px",
//             fontSize: "12px",
//             fontWeight: "700",
//             minWidth: "50px",
//             textAlign: "center",

//             paddingTop: 0,
//             paddingBottom: "10px",
//           }}
//         >
//           B
//         </span>
//         <span
//           style={{
//             border: "1px solid black",
//             padding: "5px 10px",
//             fontSize: "12px",
//             fontWeight: "700",
//             minWidth: "50px",
//             textAlign: "center",

//             paddingTop: 0,
//             paddingBottom: "10px",
//           }}
//         >
//           C
//         </span>
//         <span
//           style={{
//             border: "1px solid black",
//             padding: "5px 10px",
//             fontSize: "12px",
//             fontWeight: "700",
//             minWidth: "50px",
//             textAlign: "center",

//             paddingTop: 0,
//             paddingBottom: "10px",
//           }}
//         >
//           D
//         </span>
//         <span
//           style={{
//             border: "1px solid black",
//             padding: "5px 10px",
//             fontSize: "12px",
//             fontWeight: "700",
//             minWidth: "50px",
//             textAlign: "center",

//             paddingTop: 0,
//             paddingBottom: "10px",
//           }}
//         >
//           E
//         </span>{" "}
//         <span
//           style={{
//             border: "1px solid black",
//             padding: "5px 10px",
//             fontSize: "12px",
//             fontWeight: "700",
//             minWidth: "50px",
//             textAlign: "center",

//             paddingTop: 0,
//             paddingBottom: "10px",
//           }}
//         >
//           F
//         </span>
//       </div>
//     </div>
//   );
// };

// export default TarijChart;

import React from "react";
import {
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList,
    Legend, // <-- Legend ઇમ્પોર્ટ કરવાનું ભૂલશો નહીં
} from "recharts";

import House1 from "../assets/icon/analytics/House.png";
import House2 from "../assets/icon/analytics/PakaMakan.png";
import House3 from "../assets/icon/analytics/KachaMakan.png";

import houseTax from "../assets/icon/tax/houseTax.png";
import waterTax from "../assets/icon/tax/waterTax.png";
import specialTax from "../assets/icon/tax/specialTax.png";
import lightTax from "../assets/icon/tax/lightTax.png";
import cleanTax from "../assets/icon/tax/cleanTax.png";

const WaterTarijChart = ({
    project,
    total,
    totalResidence,
    name,
    totalTabConn,
}) => {
    console.log("Tarij", total);

    // ટેક્સની ગણતરી કરવા માટેનું ફંક્શન (Remaining = Total - Recovery)
    // જો વસુલાતની key અલગ હોય તો 'vasulat' ની જગ્યાએ તે મૂકી દેવી
    const getTaxMetrics = (taxObj) => {
        const totalDemand = taxObj?.curr || 0; // કુલ માંગણું
        const recovery = taxObj?.vasulat?.curr || 0; // વસુલાત
        const remaining = totalDemand - recovery; // બાકી
        return { કુલ: totalDemand, વસુલાત: recovery, બાકી: remaining };
    };

    const specialMetrics = getTaxMetrics(total?.specialTax);
    // ચાર્ટ માટેનો ડેટા એરે
    const taxChartData = [{ name: "ખાસ પાણી નળ વેરો", ...specialMetrics }];

    return (
        <div id="pdf-content-wrapper" className="watermark">
            <h1
                className="text-xl font-bold text-center mb-0 text-gray-800"
                style={{ paddingTop: "80px" }}
            >
                ખાસ પાણી નળ વેરા {name} | સને {project?.details?.taxYear || ""}
            </h1>

            <div
                className="location-info-visible"
                style={{
                    paddingInline: "200px",
                    marginTop: "10px",
                    marginBottom: "10px",
                }}
            >
                <h3>ગામ: {project?.spot?.gaam}</h3>
                <h3>તાલુકો: {project?.spot?.taluka}</h3>
                <h3>જિલ્લો: {project?.spot?.district}</h3>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
                {/* House Icons */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        justifyContent: "flex-end",
                        maxWidth: "50px",
                        paddingBottom: "30px",
                    }}
                >
                    <img src={House1} style={{ width: "100%" }} alt="House 1" />
                    <img src={House2} style={{ width: "100%" }} alt="House 2" />
                    <img src={House3} style={{ width: "100%" }} alt="House 3" />
                </div>

                {/* Total Houses & Tap Connections Chart */}
                <div className="flex flex-col items-center">
                    <BarChart
                        width={250}
                        height={400}
                        margin={{ top: 30 }}
                        data={[
                            {
                                name: "કુલ ઘર",
                                count: totalResidence || 0,
                                fill: "#c4b28f",
                            },
                            {
                                name: "કુલ નળ",
                                count: totalTabConn || 0,
                                fill: "#60a5fa",
                            },
                        ]}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />

                        <Bar dataKey="count" barSize={60}>
                            <LabelList
                                dataKey="count"
                                position="top"
                                style={{
                                    fill: "#000",
                                    fontSize: 14,
                                    fontWeight: "700",
                                }}
                            />
                            <Cell fill="#c4b28f" />
                            <Cell fill="#60a5fa" />
                        </Bar>
                    </BarChart>
                </div>

                {/* Taxes Chart (Separated Bars for Total, Recovery, Remaining) */}
                <div
                    className="flex flex-col items-center"
                    style={{ marginLeft: "30px" }}
                >
                    <BarChart
                        width={500} // થોડી પહોળાઈ વધારી છે જેથી 3 Bars સારી રીતે સેટ થાય
                        height={400}
                        margin={{ top: 30, right: 10, left: 10, bottom: 5 }}
                        data={taxChartData}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={13} fontWeight="600" />
                        <YAxis />
                        <Tooltip cursor={{ fill: "transparent" }} />

                        {/* Legend દર્શાવશે કયો કલર શું છે */}
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />

                        {/* 1. કુલ માંગણું (Total Demand) - વાદળી રંગ */}
                        <Bar
                            dataKey="કુલ"
                            fill="#3B82F6"
                            name={`કુલ ${taxChartData[0]?.કુલ}`}
                        >
                            <LabelList
                                dataKey="કુલ"
                                position="top"
                                style={{ fill: "#3B82F6", fontSize: 12, fontWeight: "700" }}
                            />
                        </Bar>

                        {/* 2. વસુલાત (Recovery) - લીલો રંગ */}
                        <Bar
                            dataKey="વસુલાત"
                            fill="#2ECC71"
                            name={`વસુલાત ${taxChartData[0]?.વસુલાત}`}
                        >
                            <LabelList
                                dataKey="વસુલાત"
                                position="top"
                                style={{ fill: "#2ECC71", fontSize: 12, fontWeight: "700" }}
                            />
                        </Bar>

                        {/* 3. બાકી (Remaining) - લાલ રંગ */}
                        <Bar
                            dataKey="બાકી"
                            fill="#E74C3C"
                            name={`બાકી ${taxChartData[0]?.બાકી}`}
                        >
                            <LabelList
                                dataKey="બાકી"
                                position="top"
                                style={{ fill: "#E74C3C", fontSize: 12, fontWeight: "700" }}
                            />
                        </Bar>
                    </BarChart>
                </div>
            </div>

            {/* Tax Icons Legend Section */}
            <div
                style={{
                    display: "flex",
                    gap: "72px",
                    justifyContent: "center",
                    maxHeight: "70px",
                    paddingLeft: "340px",
                    paddingRight: "0px",
                    marginTop: "20px",
                }}
            >
                <img src={specialTax} style={{ width: "50px" }} alt="Special Tax" />
            </div>
        </div>
    );
};

export default WaterTarijChart;
