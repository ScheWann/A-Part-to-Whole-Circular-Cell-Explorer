import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Switch } from "antd";
import * as d3 from "d3";
import data from "../data/piechart.csv";
import scaleJson from "../data/scalefactors_json.json";
import lowresTissuePic from "../data/tissue_lowres_image.png";

const officialColors = [
    "#EF3819",
    "#F39A2E",
    "#A4F93F",
    "#41F63D",
    "#4BF7A7",
    "#459CF9",
    "#3821F6",
    "#A031F7",
    "#F23C9D",
];

export const WaffleChart = () => {
    const svgRef = useRef(null);
    const thumbnailRef = useRef(null);
    const [showBackgroundImage, setShowBackgroundImage] = useState(true);
    const [showWaffleCharts, setShowWaffleCharts] = useState(false);
    const [brushEnabled, setBrushEnabled] = useState(false);
    const [zoomEnabled, setZoomEnabled] = useState(false);
    const [waffleData, setWaffleData] = useState([]);
    const [brushedCoords, setBrushedCoords] = useState(null);
    const [resetZoom, setResetZoom] = useState(false);
    const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);

    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const gridSize = spotDiameter * scalef;
    const cellSize = gridSize / 5;

    function showTooltip(data, position) {
        d3.select(".tooltip").remove();

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("left", `${position.x}px`)
            .style("top", `${position.y}px`)
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "10px")
            .style("pointer-events", "none");

        const margin = { top: 10, right: 5, bottom: 20, left: 35 },
            width = 200 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom;

        const svg = tooltip
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

        const xScale = d3
            .scaleBand()
            .domain(data.ratios.map((_, i) => `X${i + 1}`))
            .range([0, width])
            .padding(0.1);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale).ticks(5, "%");

        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle");

        svg.append("g").call(yAxis);

        svg
            .selectAll(".bar")
            .data(data.ratios)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => xScale(`X${i + 1}`))
            .attr("y", (d) => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => height - yScale(d) - 0.5)
            .attr("fill", (d, i) => officialColors[i]);
    }

    function hideTooltip() {
        d3.select(".tooltip").remove();
    }

    // zoom function
    const zoom = d3
        .zoom()
        .scaleExtent([1, 5])
        .on("zoom", (event) => {
            d3.select(svgRef.current)
                .select(".tissue")
                .attr("transform", event.transform);
            setZoomTransform(event.transform);
        });

    // Function to reset zoom
    const resetZoomFunction = () => {
        const svgElement = d3.select(svgRef.current);
        svgElement.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    };

    // Load data and initialize SVG
    useEffect(() => {
        d3.csv(data, (d) => ({
            barcode: d.barcode,
            x: +d.x * scalef,
            y: +d.y * scalef,
            ratios: [+d.X1, +d.X2, +d.X3, +d.X4, +d.X5, +d.X6, +d.X7, +d.X8, +d.X9],
        })).then((data) => setWaffleData(data));

        const svgElement = d3.select(svgRef.current);
        svgElement
            .attr("width", 600)
            .attr("height", 600)
            .append("g")
            .classed("tissue", true);

        const thumbnailSvg = d3
            .select(thumbnailRef.current)
            .attr("width", 120)
            .attr("height", 120);

        if (thumbnailSvg.selectAll("image").empty()) {
            thumbnailSvg
                .append("image")
                .attr("href", lowresTissuePic)
                .attr("width", 120)
                .attr("height", 120);
        }

        if (thumbnailSvg.selectAll("rect.brush-view").empty()) {
            thumbnailSvg
                .append("rect")
                .attr("class", "brush-view")
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 1)
                .style("display", "none");
        }
    }, []);

    // brush function
    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const thumbnailSvg = d3.select(thumbnailRef.current);
        const svg = svgElement.select(".tissue");

        if (brushEnabled) {
            const brush = d3
                .brush()
                .extent([
                    [0, 0],
                    [600, 600],
                ])
                .on("brush", brushMove);

            svg.append("g").attr("class", "brush").call(brush);
        } else {
            svg.select(".brush").remove();
            thumbnailSvg.select(".brush-view").style("display", "none");
            setBrushedCoords(null);
        }

        function brushMove(event) {
            const selection = event.selection;
            if (!event.sourceEvent || !selection) return;
            const [[x0, y0], [x1, y1]] = selection;

            setBrushedCoords({ x0, y0, x1, y1 });

            thumbnailSvg
                .select(".brush-view")
                .style("display", "block")
                .attr("x", (x0 / 600) * 120)
                .attr("y", (y0 / 600) * 120)
                .attr("width", ((x1 - x0) / 600) * 120)
                .attr("height", ((y1 - y0) / 600) * 120);
        }

        return () => {
            if (!brushEnabled) {
                svg.select(".brush").remove();
                thumbnailSvg.select(".brush-view").style("display", "none");
            }
        };
    }, [brushEnabled]);

    // background image
    useEffect(() => {
        const tissueGroup = d3.select(svgRef.current).select(".tissue");
        const backgroundGroup = tissueGroup.select(".background").empty()
            ? tissueGroup.append("g").attr("class", "background")
            : tissueGroup.select(".background");

        if (showBackgroundImage) {
            backgroundGroup.selectAll("image").remove();
            backgroundGroup
                .append("image")
                .attr("href", lowresTissuePic)
                .attr("width", 600)
                .attr("height", 600)
                .attr("class", "background-image");
        } else {
            backgroundGroup.select(".background-image").remove();
        }
    }, [showBackgroundImage]);

    // render waffle charts
    useEffect(() => {
        const tissueGroup = d3.select(svgRef.current).select(".tissue");
        const contentGroup = tissueGroup.select(".content").empty()
            ? tissueGroup.append("g").attr("class", "content")
            : tissueGroup.select(".content");

        contentGroup.selectAll("g").remove();
        waffleData.forEach((d) => {
            const group = contentGroup
                .append("g")
                .attr("transform", `translate(${d.x}, ${d.y})`)
                .attr("data-barcode", d.barcode)
                .attr("data-x", d.x)
                .attr("data-y", d.y)
                .classed("waffle-chart", true);

            if (showWaffleCharts) {
                let totalCells = 25;
                let filledCells = 0;

                for (let i = 0; i < d.ratios.length; i++) {
                    let cells = Math.round(d.ratios[i] * totalCells);
                    for (let j = 0; j < cells; j++) {
                        if (filledCells >= totalCells) break;
                        const row = Math.floor(filledCells / 5);
                        const col = filledCells % 5;

                        group
                            .append("rect")
                            .attr("x", col * cellSize)
                            .attr("y", row * cellSize)
                            .attr("width", cellSize)
                            .attr("height", cellSize)
                            .attr("fill", officialColors[i]);

                        filledCells++;
                    }
                }
            } else {
                group
                    .append("rect")
                    .attr("width", gridSize)
                    .attr("height", gridSize)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.1);
            }
        });
    }, [showWaffleCharts, waffleData]);

    // render mirrored waffle charts
    useEffect(() => {
        let svgElement = d3.select(svgRef.current);
        let mirrorGroup = svgElement.select(".mirrored");

        if (!brushEnabled) {
            mirrorGroup.remove();
            return;
        }

        if (!brushedCoords) return;

        if (mirrorGroup.empty()) {
            mirrorGroup = svgElement.append("g").attr("class", "mirrored");
        }

        const width = brushedCoords.x1 - brushedCoords.x0 + 5;
        const height = brushedCoords.y1 - brushedCoords.y0 + 5;

        mirrorGroup.selectAll("rect.background").remove();
        mirrorGroup
            .append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .attr("opacity", 0.8)
            .attr("stroke", "#333")
            .attr("fill", "#f0f0f0")
            .attr("x", 1)
            .attr("y", -2);

        mirrorGroup.attr(
            "transform",
            `translate(${brushedCoords.x1 * zoomTransform.k + zoomTransform.x}, 
            ${brushedCoords.y0 * zoomTransform.k + zoomTransform.y}) 
            scale(${zoomTransform.k})`
        );

        const filteredData = waffleData.filter((d) => {
            return (
                brushedCoords.x0 <= d.x &&
                d.x <= brushedCoords.x1 &&
                brushedCoords.y0 <= d.y &&
                d.y <= brushedCoords.y1
            );
        });

        mirrorGroup.selectAll("g.waffle-chart").remove();
        filteredData.forEach((d) => {
            const group = mirrorGroup
                .append("g")
                .attr(
                    "transform",
                    `translate(${d.x - brushedCoords.x0}, ${d.y - brushedCoords.y0})`
                )
                .classed("waffle-chart", true)
                .on("mouseover", (event) => {
                    svgElement
                        .selectAll(`g[data-barcode='${d.barcode}']`)
                        .selectAll("rect")
                        .each(function () {
                            const element = d3.select(this);
                            const originalStroke = element.style("stroke");
                            element
                                .attr("data-original-stroke", originalStroke)
                                .style("stroke", "red")
                                .style("stroke-width", 0.3);
                        });
                    const position = { x: event.pageX, y: event.pageY };
                    showTooltip({ ratios: d.ratios }, position);
                })
                .on("mouseout", () => {
                    svgElement
                        .selectAll(`g[data-barcode='${d.barcode}']`)
                        .selectAll("rect")
                        .style("stroke", "black")
                        .style("stroke-width", 0.1);
                    hideTooltip();
                });

            let totalCells = 25;
            let filledCells = 0;
            d.ratios.forEach((ratio, index) => {
                let cells = Math.round(ratio * totalCells);
                for (let j = 0; j < cells; j++) {
                    if (filledCells >= totalCells) break;
                    const row = Math.floor(filledCells / 5);
                    const col = filledCells % 5;

                    group
                        .append("rect")
                        .attr("x", col * cellSize)
                        .attr("y", row * cellSize)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", officialColors[index]);

                    filledCells++;
                }
            });
        });
        
    }, [brushEnabled, brushedCoords, waffleData, zoomTransform]);

    // zoom effect
    useEffect(() => {
        const svgElement = d3.select(svgRef.current);

        if (zoomEnabled) {
            svgElement.call(zoom);
        } else {
            svgElement.on(".zoom", null);
        }

        if (resetZoom) {
            resetZoomFunction();
            setResetZoom(false);
        }
    }, [zoomEnabled, resetZoom]);

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Button groups */}
            <Card
                size="small"
                title="Tools"
                style={{
                    width: 300,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <Switch style={{ margin: 2 }} onChange={() => setShowBackgroundImage(!showBackgroundImage)} checkedChildren="Show Background Image" unCheckedChildren="Hide Background Image" />
                    <Switch style={{ margin: 2 }} onChange={() => setShowWaffleCharts(!showWaffleCharts)} checkedChildren="Show Waffle Charts" unCheckedChildren="Hide Waffle Charts" />
                    <Switch
                        style={{ margin: 2 }}
                        onChange={() => {
                            if (!brushEnabled) {
                                setBrushEnabled(true);
                                setZoomEnabled(false);
                            } else {
                                setBrushEnabled(false);
                            }
                        }}
                        checked={brushEnabled}
                        checkedChildren="Enable Brush"
                        unCheckedChildren="Disable Brush"
                    />

                    <Switch
                        style={{ margin: 2 }}
                        onChange={() => {
                            if (!zoomEnabled) {
                                setZoomEnabled(true);
                                setBrushEnabled(false);
                            } else {
                                setZoomEnabled(false);
                            }
                        }}
                        checked={zoomEnabled}
                        checkedChildren="Enable Zoom"
                        unCheckedChildren="Disable Zoom"
                    />
                    <Button style={{ marginTop: 10 }} type="primary" onClick={() => setResetZoom(true)}>Reset Zoom</Button>
                </div>
            </Card>
            {/* SVG */}
            <div style={{ position: "relative", width: "600px", height: "600px" }}>
                <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
                <div
                    style={{
                        position: "absolute",
                        bottom: "5px",
                        left: "600px",
                        border: "1px solid black",
                        overflow: "hidden",
                        width: "120px",
                        height: "120px",
                    }}
                >
                    <svg ref={thumbnailRef}></svg>
                </div>
            </div>
        </div>
    );
};
