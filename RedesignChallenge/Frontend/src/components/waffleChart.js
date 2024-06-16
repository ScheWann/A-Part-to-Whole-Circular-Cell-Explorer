import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import data from "../data/piechart.csv";
import scaleJson from "../data/scalefactors_json.json";
import lowresTissuePic from '../data/tissue_lowres_image.png';

const officialColors = ["#EF3819", "#F39A2E", "#A4F93F", "#41F63D", "#4BF7A7", "#459CF9", "#3821F6", "#A031F7", "#F23C9D"];

export const WaffleChart = () => {
    const svgRef = useRef(null);
    const [showBackgroundImage, setShowBackgroundImage] = useState(true);
    const [showWaffleCharts, setShowWaffleCharts] = useState(false);
    const [waffleData, setWaffleData] = useState([]);

    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const gridSize = spotDiameter * scalef / 2;
    const cellSize = gridSize / 10;

    // Setup zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", (event) => {
            const { transform } = event;
            const svgZoomable = d3.select(svgRef.current).select('.zoomable');
            svgZoomable.attr("transform", transform);
        });

    // Apply the zoom behavior to the SVG
    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const svg = svgElement
            .attr("width", 600)
            .attr("height", 600)
            .append("g") // Add a group to apply the zoom
            .classed("zoomable", true);

        svg.call(zoom);
    }, []);

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
        const zoomableGroup = d3.select(svgRef.current).select(".zoomable");
        const backgroundGroup = zoomableGroup.select(".background").empty() ? zoomableGroup.append("g").attr("class", "background") : zoomableGroup.select(".background");

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
        const zoomableGroup = d3.select(svgRef.current).select(".zoomable");
        const contentGroup = zoomableGroup.select(".content").empty() ? zoomableGroup.append("g").attr("class", "content") : zoomableGroup.select(".content");

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

    return (
        <>
            <svg ref={svgRef}></svg>
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
