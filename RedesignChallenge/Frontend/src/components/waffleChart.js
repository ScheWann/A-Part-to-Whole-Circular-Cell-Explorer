import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import data from "../data/piechart.csv";
import scaleJson from "../data/scalefactors_json.json";
import lowresTissuePic from '../data/tissue_lowres_image.png';

const officialColors = ["#EF3819", "#F39A2E", "#A4F93F", "#41F63D", "#4BF7A7", "#459CF9", "#3821F6", "#A031F7", "#F23C9D"];

export const WaffleChart = () => {
    const svgRef = useRef(null);
    const detailSvgRef = useRef(null);
    const [showBackgroundImage, setShowBackgroundImage] = useState(true);
    const [showWaffleCharts, setShowWaffleCharts] = useState(false);
    const [waffleData, setWaffleData] = useState([]);
    const [selectedData, setSelectedData] = useState([]);

    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const gridSize = spotDiameter * scalef / 2;
    const cellSize = gridSize / 10;

    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const svg = svgElement
            .attr("width", 600)
            .attr("height", 600)
            .append("g")
            .classed("tissue", true);
    }, []);

    // Setup brush
    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const brush = d3.brush()
            .extent([[0, 0], [600, 600]])
            .on("brush", (event) => {
                const selection = event.selection;
                if (!selection) {
                    setSelectedData([]);
                    return;
                }
                const [[x0, y0], [x1, y1]] = selection;
                const selected = waffleData.filter(d => d.x >= x0 && d.x <= x1 && d.y >= y0 && d.y <= y1);
                setSelectedData(selected);
            });
        const brushGroup = svgElement.select(".tissue").append("g").attr("class", "brush");
        brushGroup.call(brush);
    }, [waffleData]);

    // Load data and scale positions
    useEffect(() => {
        d3.csv(data, d => ({
            barcode: d.barcode,
            x: +d.x * scalef,
            y: +d.y * scalef,
            ratios: [ +d.X1, +d.X2, +d.X3, +d.X4, +d.X5, +d.X6, +d.X7, +d.X8, +d.X9 ]
        })).then(data => {
            setWaffleData(data);
        });
    }, []);

    // Background image control
    useEffect(() => {
        const tissueGroup = d3.select(svgRef.current).select(".tissue");
        const backgroundGroup = tissueGroup.select(".background").empty() ? tissueGroup.append("g").attr("class", "background") : tissueGroup.select(".background");

        if (showBackgroundImage) {
            backgroundGroup.selectAll("image").remove();
            backgroundGroup.append("image")
                .attr("href", lowresTissuePic)
                .attr("width", 600)
                .attr("height", 600)
                .attr("class", "background-image");
        } else {
            backgroundGroup.select(".background-image").remove();
        }
    }, [showBackgroundImage]);

    // Render waffle charts
    useEffect(() => {
        const tissueGroup = d3.select(svgRef.current).select(".tissue");
        const contentGroup = tissueGroup.select(".content").empty() ? tissueGroup.append("g").attr("class", "content") : tissueGroup.select(".content");

        contentGroup.selectAll("g").remove();
        waffleData.forEach((d) => {
            const group = contentGroup.append("g")
                .attr("transform", `translate(${d.x}, ${d.y})`)
                .attr("data-barcode", d.barcode)
                .attr("data-x", d.x)
                .attr("data-y", d.y)
                .classed("waffle-chart", true);

            if (showWaffleCharts) {
                let totalCells = 100;
                let filledCells = 0;

                for (let i = 0; i < d.ratios.length; i++) {
                    let cells = Math.round(d.ratios[i] * totalCells);
                    for (let j = 0; j < cells; j++) {
                        if (filledCells >= totalCells) break;
                        const row = Math.floor(filledCells / 10);
                        const col = filledCells % 10;

                        group.append("rect")
                            .attr("x", col * cellSize)
                            .attr("y", row * cellSize)
                            .attr("width", cellSize)
                            .attr("height", cellSize)
                            .attr("fill", officialColors[i]);

                        filledCells++;
                    }
                }
            } else {
                group.append("rect")
                    .attr("width", gridSize)
                    .attr("height", gridSize)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.1);
            }
        });
    }, [showWaffleCharts, waffleData]);

    // Render the detailed SVG for brushed area
    useEffect(() => {
        const svgDetail = d3.select(detailSvgRef.current);
        const svg = svgDetail
            .attr("width", 600)
            .attr("height", 600)

        svgDetail.selectAll("g").remove();

        selectedData.forEach((d) => {
            const group = svgDetail.append("g")
                .attr("transform", `translate(${(d.x % 600)}, ${(d.y % 600)})`) // Adjust positions to fit in the detail SVG
                .classed("detail-waffle-chart", true);

            let totalCells = 100;
            let filledCells = 0;
            for (let i = 0; i < d.ratios.length; i++) {
                let cells = Math.round(d.ratios[i] * totalCells);
                for (let j = 0; j < cells; j++) {
                    if (filledCells >= totalCells) break;
                    const row = Math.floor(filledCells / 10);
                    const col = filledCells % 10;

                    group.append("rect")
                        .attr("x", col * cellSize)
                        .attr("y", row * cellSize)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", officialColors[i]);

                    filledCells++;
                }
            }
        });
    }, [selectedData]);

    return (
        <>
            <svg ref={svgRef}></svg>
            <svg ref={detailSvgRef} style={{ border: "1px solid black" }}></svg>
            <div>
                <button onClick={() => setShowBackgroundImage(!showBackgroundImage)}>
                    {showBackgroundImage ? "Hide Background Image" : "Show Background Image"}
                </button>
                <button onClick={() => setShowWaffleCharts(!showWaffleCharts)}>
                    {showWaffleCharts ? "Hide Waffle Charts" : "Show Waffle Charts"}
                </button>
            </div>
        </>
    );
};
