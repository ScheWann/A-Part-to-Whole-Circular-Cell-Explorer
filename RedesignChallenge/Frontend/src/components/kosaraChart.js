import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { SelectOutlined } from "@ant-design/icons";
import * as d3 from "d3";
import scaleJson from "../data/scalefactors_json.json";
import hiresTissuePic from '../data/tissue_hires_image.png';
import './Styles/kosaraChart.css';

// Color palette
const officialColors = {
    X1: '#FFC40C',
    X2: '#FF0800',
    X3: '#FDEE00',
    X4: '#007FFF',
    X5: '#32174D',
    X6: '#79443B',
    X7: '#ED9121',
    X8: '#74C365',
    X9: '#355E3B'
}

export const KosaraChart = ({ setSelectedData, showBackgroundImage, showKosaraCharts, cellShownStatus, opacity, relatedGeneData, setGeneExpressionScale, selectedGene, UMITotalCounts, hoveronTSNECell, showtSNECluster, tissueClusterData, interestedCellType }) => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);
    const [kosaraData, setKosaraData] = useState([]);
    const [brushActive, setBrushActive] = useState(false);

    const hirescalef = 0.046594715;
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const radius = spotDiameter * hirescalef / 2;

    const unChckedCellTypes = (obj) => {
        let falseCount = 0;
        for (const key in obj) {
            if (obj[key] === false) {
                falseCount++;
            }
        }
        return falseCount;
    }

    const generateKosaraPath = (pointX, pointY, angles, ratios, cellShownStatus) => {
        const sequenceOrder = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9'];
        let paths = [];
        let cellTypes = [];
        let startpointX, startpointY, endpointX, endpointY = 0;
        let lastStartPointX, lastStartPointY, lastEndPointX, lastEndPointY = 0;

        // get selected cell types that are shown
        if(interestedCellType) {
            cellTypes.push(interestedCellType);
        } else {
            cellTypes = Object.entries(cellShownStatus).filter(([key, value]) => value).map(([key, value]) => key);
        }

        let cellIndices = ratios.filter(item => item[1] !== 0 && cellTypes.includes(item[0])).sort((a, b) => b[1] - a[1]).slice(0, 9).map(item => item[0]);
        let cellAngles = cellIndices.map(index => angles.find(item => item[0] === index));

        // If no selected cells are shown, draw an empty circle
        if (cellAngles.length === 0) {
            paths.push({ path: '', color: 'transparent' });
        } else {
            cellAngles = cellAngles.map(angle => [angle[0], angle[1]]);
            cellAngles.sort((a, b) => sequenceOrder.indexOf(a[0]) - sequenceOrder.indexOf(b[0]));

            // Calculate cumulative angles
            let cumulativeAngle = 0;
            let processedAngles = cellAngles.map(angle => {
                cumulativeAngle += angle[1];
                return [angle[0], cumulativeAngle];
            });
            
            processedAngles.forEach((angle, index) => {
                console.log(angle[1])
                if(angle[1] <= 45) {
                    startpointX = pointX - Math.abs(radius * Math.cos((45 - angle[1]) * Math.PI / 180));
                    startpointY = pointY + Math.abs(radius * Math.sin((45 - angle[1]) * Math.PI / 180));
                    endpointX = pointX - Math.abs(radius * Math.sin((45 - angle[1]) * Math.PI / 180));
                    endpointY = pointY + Math.abs(radius * Math.cos((45 - angle[1]) * Math.PI / 180));
                } else {
                    startpointX = pointX - Math.abs(radius * Math.sin((135 - angle[1]) * Math.PI / 180));
                    startpointY = pointY - Math.abs(radius * Math.cos((135 - angle[1]) * Math.PI / 180));
                    endpointX = pointX + Math.abs(radius * Math.cos((135 - angle[1]) * Math.PI / 180));
                    endpointY = pointY + Math.abs(radius * Math.sin((135 - angle[1]) * Math.PI / 180));
                }
                // let startpointX = pointX - radius * Math.cos((45 - angle[1]) * Math.PI / 180);
                // let startpointY = pointY + radius * Math.sin((45 - angle[1]) * Math.PI / 180);
                // let endpointX = pointX - radius * Math.sin((45 - angle[1]) * Math.PI / 180);
                // let endpointY = pointY + radius * Math.cos((45 - angle[1]) * Math.PI / 180);



                let path = '';

                if (index === 0) {
                    path = `M ${startpointX} ${startpointY} A ${radius} ${radius} 0 0 0 ${endpointX} ${endpointY} A ${radius} ${radius} 0 0 0 ${startpointX} ${startpointY} Z`;
                }
                else if (index === cellAngles.length - 1) {
                    path = `M ${lastStartPointX} ${lastStartPointY} A ${radius} ${radius} 0 1 1 ${lastEndPointX} ${lastEndPointY} A ${radius} ${radius} 0 0 0 ${lastStartPointX} ${lastStartPointY} Z`;
                } 
                else {
                    path = `M ${lastStartPointX} ${lastStartPointY} A ${radius} ${radius} 0 0 1 ${lastEndPointX} ${lastEndPointY} A ${radius} ${radius} 0 0 0 ${endpointX} ${endpointY} A ${radius} ${radius} 0 0 0 ${startpointX} ${startpointY} A ${radius} ${radius} 0 0 0 ${lastStartPointX} ${lastStartPointY} Z`;
                }

                paths.push({ path, color: officialColors[angle[0]] });

                lastStartPointX = startpointX;
                lastStartPointY = startpointY;
                lastEndPointX = endpointX;
                lastEndPointY = endpointY;
            });

            const lastAngle = processedAngles[cellAngles.length - 1][1];
            if (lastAngle < 90 && (unChckedCellTypes(cellShownStatus) > 0 || interestedCellType)) {
                let path = `M ${lastStartPointX} ${lastStartPointY} A ${radius} ${radius} 0 1 1 ${lastEndPointX} ${lastEndPointY} A ${radius} ${radius} 0 0 0 ${lastStartPointX} ${lastStartPointY} Z`;
                paths.push({ path, color: 'white' });
            }
        }
        return paths;
    }

    function handleKosaraMouseOver(event, d, angles) {
        const tooltip = d3.select(tooltipRef.current);
        const sequenceOrder = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9'];
        let cellTypes;
        if(!interestedCellType) {
            cellTypes = d
            .filter(item => item[1] !== 0 && cellShownStatus[item[0]] === true)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 9);
        } else {
            cellTypes = d
            .filter(item => item[1] !== 0 && item[0] === interestedCellType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 9);
        }

        console.log(cellTypes, angles)
        cellTypes.sort((a, b) => sequenceOrder.indexOf(a[0]) - sequenceOrder.indexOf(b[0]));
        tooltip
            .style("display", "block")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`)
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
            .style("z-index", "1000")
            .html(cellTypes.map(item => `${item[0]}: ${(item[1] * 100).toFixed(2)}%`).join("<br>"));
    }

    function handleGeneMouseOver(event, d) {
        const tooltip = d3.select(tooltipRef.current);
        tooltip
            .style("display", "block")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`)
            .style("font-size", "12px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("padding", "8px")
            .style("font-family", "sans-serif")
            .style("z-index", "1000")
            .html(`${d.selectedGene ? `Gene: ${d.selectedGene}<br>` : ''}Barcode: ${d.barcode}<br>${showtSNECluster ? `Cluster: ${d.cluster}` : `UMI Counts: ${d.relatedGeneValue}`}`);
    }

    function handleMouseOut() {
        d3.select(tooltipRef.current).style("display", "none");
    }

    function circleRender(data, svgGroup) {
        if (!showtSNECluster) {
            const minValue = Math.min(...Object.values(data));
            const maxValue = Math.max(...Object.values(data));

            setGeneExpressionScale([minValue, maxValue]);
            const colorScale = d3.scaleSequential(d3.interpolateOranges).domain([minValue, maxValue]);

            kosaraData.forEach((d) => {
                const relatedGeneValue = data[d.barcode];
                const color = relatedGeneValue ? colorScale(relatedGeneValue) : 'none';
                const group = svgGroup.append("g")
                    .attr("transform", `translate(${d.x}, ${d.y})`)
                    .attr("opacity", opacity)
                    .on("mouseover", (event) => handleGeneMouseOver(event, { selectedGene: selectedGene, barcode: d.barcode, relatedGeneValue: relatedGeneValue }))
                    .on("mouseout", handleMouseOut);

                group.append("circle")
                    .attr("r", radius)
                    .attr("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.1);
            });
        } else {
            const clusterColors = d3.scaleOrdinal(d3.schemeCategory10);
            kosaraData.forEach((d) => {
                const dataItem = data.find(item => item.barcode === d.barcode);
                const cluster = dataItem ? dataItem.cluster : null;
                const color = cluster !== null ? clusterColors(cluster) : 'none';
                const group = svgGroup.append("g")
                    .attr("transform", `translate(${d.x}, ${d.y})`)
                    .attr("opacity", opacity)
                    .on("mouseover", (event) => handleGeneMouseOver(event, { barcode: d.barcode, cluster: cluster }))
                    .on("mouseout", handleMouseOut);

                group.append("circle")
                    .attr("r", radius)
                    .attr("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.1);
            });
        }
    }

    // loading data
    useEffect(() => {
        fetch("/getKosaraData")
            .then(res => res.json())
            .then(data => {
                const indices = Object.keys(data.barcode);
                const transformedData = indices.map(index => ({
                    barcode: data.barcode[index],
                    x: +data.x[index] * hirescalef,
                    y: +data.y[index] * hirescalef,
                    ratios: {
                        X1: +data.X1[index],
                        X2: +data.X2[index],
                        X3: +data.X3[index],
                        X4: +data.X4[index],
                        X5: +data.X5[index],
                        X6: +data.X6[index],
                        X7: +data.X7[index],
                        X8: +data.X8[index],
                        X9: +data.X9[index]
                    },
                    angles: {
                        X1: +data.X1_angle[index],
                        X2: +data.X2_angle[index],
                        X3: +data.X3_angle[index],
                        X4: +data.X4_angle[index],
                        X5: +data.X5_angle[index],
                        X6: +data.X6_angle[index],
                        X7: +data.X7_angle[index],
                        X8: +data.X8_angle[index],
                        X9: +data.X9_angle[index]
                    }
                }));
                setKosaraData(transformedData);
            });
    }, []);


    // rendering background image
    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const backgroundGroup = svgElement.select(".background").empty() ? svgElement.append("g").attr("class", "background") : svgElement.select(".background");

        if (showBackgroundImage) {
            backgroundGroup.selectAll("image").remove();
            backgroundGroup.append("image")
                .attr("href", hiresTissuePic)
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("preserveAspectRatio", "xMidYMid slice")
                .attr("class", "background-image");
        } else {
            backgroundGroup.select(".background-image").remove();
        }
    }, [showBackgroundImage]);

    useEffect(() => {
        const svgElement = d3.select(svgRef.current);

        const brushEnded = (event) => {
            const selection = event.selection;
            if (!selection) return;

            const [[x0, y0], [x1, y1]] = selection;

            const brushedData = kosaraData.filter(d => {
                if (!d) return;
                const scaledX = d.x
                const scaledY = d.y
                return scaledX >= x0 && scaledX <= x1 && scaledY >= y0 && scaledY <= y1;
            });
            const selectedData = brushedData.map(d => ({
                barcode: d.barcode,
                x: d.x,
                y: d.y,
                ratios: Object.fromEntries(Object.entries(d.ratios).filter(([key, value]) => selectedCells.includes(key))),
            }));
            setSelectedData(selectedData);
        }

        const brush = d3.brush()
            .extent([[0, 0], [800, 800]])
            .on("brush", brushEnded);

        const svg = svgElement
            .attr("viewBox", "0 0 800 800")
            .attr("preserveAspectRatio", "xMidYMid meet")

        // remove duplicate brush
        svg.select(".brush").remove();

        if (showKosaraCharts && brushActive) {
            svg.append("g")
                .attr("class", "brush")
                .call(brush)
        }

        const selectedCells = Object.keys(cellShownStatus).filter(cell => cellShownStatus[cell]);
        setSelectedData(kosaraData.map(d => ({
            barcode: d.barcode,
            x: d.x,
            y: d.y,
            ratios: Object.fromEntries(Object.entries(d.ratios).filter(([key, value]) => selectedCells.includes(key))),
        })));

        const contentGroup = svg.select(".content").empty() ? svg.append("g").attr("class", "content") : svg.select(".content");

        contentGroup.selectAll("g").remove();
        if (showKosaraCharts) {
            kosaraData.forEach((d) => {
                const angles = Object.entries(d.angles);
                const ratios = Object.entries(d.ratios);
                const group = contentGroup.append("g")
                    .attr("class", "kosara-chart")
                    .attr("opacity", opacity)
                    .on("mouseover", (event) => handleKosaraMouseOver(event, ratios.filter(([key, value]) => value !== 0), angles.filter(([key, value]) => value !== 0)))
                    .on("mouseout", handleMouseOut);

                const paths = generateKosaraPath(d.x, d.y, angles, ratios, cellShownStatus);
                if (unChckedCellTypes(cellShownStatus) > 0 || interestedCellType) {
                    group.append("circle")
                        .attr("transform", `translate(${d.x}, ${d.y})`)
                        .attr("r", radius)
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .on("mouseover", (event) => handleGeneMouseOver(event, { selectedGene: selectedGene, barcode: d.barcode }))
                        .on("mouseout", handleMouseOut)
                        .attr("stroke-width", 0.1);
                }

                paths.forEach(({ path, color }) => {
                    group.append('path')
                        .attr('d', path)
                        .attr('fill', color)
                        .on("mouseover", (event) => handleGeneMouseOver(event, { selectedGene: selectedGene, barcode: d.barcode }))
                        .on("mouseout", handleMouseOut);
                });

                if (d.barcode === hoveronTSNECell) {
                    group.select("circle").attr("stroke", "#333").attr("stroke-width", 2);
                }
            });
        } else {
            if (relatedGeneData && !showtSNECluster) {
                circleRender(relatedGeneData, contentGroup);
            }

            if (Object.keys(UMITotalCounts).length !== 0 && !showtSNECluster) {
                circleRender(UMITotalCounts, contentGroup);
            }

            if (showtSNECluster) {
                circleRender(tissueClusterData, contentGroup);
            }
        }
    }, [showKosaraCharts, opacity, kosaraData, cellShownStatus, relatedGeneData, UMITotalCounts, hoveronTSNECell, showtSNECluster, brushActive, interestedCellType]);

    return (
        <>
            <div style={{ display: "flex", height: "99vh", position: "relative" }}>
                <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    padding: "10px",
                    zIndex: 1,
                }}>
                    <Button style={{ fontSize: 20, cursor: "pointer" }} icon={<SelectOutlined />} onClick={() => setBrushActive(!brushActive)} />
                </div>
            </div>
            <div ref={tooltipRef} className="kosaraTooltip"></div>
        </>
    );
};
