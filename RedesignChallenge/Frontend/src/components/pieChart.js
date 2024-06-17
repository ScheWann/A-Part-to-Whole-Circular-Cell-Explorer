import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import data from "../data/piechart.csv";
import scaleJson from "../data/scalefactors_json.json";
import lowresTissuePic from '../data/tissue_lowres_image.png';

const officialColors = ["#EF3819", "#F39A2E", "#A4F93F", "#41F63D", "#4BF7A7", "#459CF9", "#3821F6", "#A031F7", "#F23C9D"];

export const PieChart = () => {
    const svgRef = useRef(null);
    const [showBackgroundImage, setShowBackgroundImage] = useState(true);
    const [showWaffleCharts, setShowWaffleCharts] = useState(false);
    const [brushEnabled, setBrushEnabled] = useState(false);
    const [zoomEnabled, setZoomEnabled] = useState(false);
    const [waffleData, setWaffleData] = useState([]);
    const [brushedCoords, setBrushedCoords] = useState(null);

    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const gridSize = spotDiameter * scalef;
    const cellSize = gridSize / 5;

    useEffect(() => {
        d3.csv(data, d => ({
            barcode: d.barcode,
            x: +d.x * scalef,
            y: +d.y * scalef,
            ratios: [+d.X1, +d.X2, +d.X3, +d.X4, +d.X5, +d.X6, +d.X7, +d.X8, +d.X9]
        })).then(data => setWaffleData(data));

        const svgElement = d3.select(svgRef.current);
        svgElement.attr("width", 600)
            .attr("height", 600)
            .append("g")
            .classed("tissue", true);
    }, []);

    // zoom and brush
    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const svg = svgElement.select(".tissue");

        if (brushEnabled) {
            const brush = d3.brush()
                .extent([[0, 0], [600, 600]])
                .on("brush", brushMoved);

            svg.append("g")
                .attr("class", "brush")
                .call(brush);
        } else {
            svg.select(".brush").remove();
            setBrushedCoords(null);
        }

        function brushMoved(event) {
            const selection = event.selection;
            if (!event.sourceEvent || !selection) return;
            const [[x0, y0], [x1, y1]] = selection;
            setBrushedCoords({ x0, y0, x1, y1 });

            const selected = svg.selectAll("g.waffle-chart")
                .filter(function () {
                    const transform = d3.select(this).attr("transform");
                    const translate = transform.substring(transform.indexOf("(") + 1, transform.indexOf(")")).split(",");
                    const cx = +translate[0];
                    const cy = +translate[1];
                    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                });
        }

        return () => {
            if (!brushEnabled) svg.select(".brush").remove();
        };
    }, [brushEnabled]);

    // background image
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
                let totalCells = 25;
                let filledCells = 0;

                for (let i = 0; i < d.ratios.length; i++) {
                    let cells = Math.round(d.ratios[i] * totalCells);
                    for (let j = 0; j < cells; j++) {
                        if (filledCells >= totalCells) break;
                        const row = Math.floor(filledCells / 5);
                        const col = filledCells % 5;

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
        const offsetX = brushedCoords.x1;
        const offsetY = brushedCoords.y0;
        console.log(offsetX, offsetY);
        mirrorGroup.attr("transform", `translate(${offsetX}, ${offsetY})`);

        svgElement.select("#clip-path-mirrored").remove();
        const clipPath = svgElement.append("clipPath")
            .attr("id", "clip-path-mirrored")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", brushedCoords.x1 - brushedCoords.x0)
            .attr("height", brushedCoords.y1 - brushedCoords.y0);

        mirrorGroup.selectAll("image").remove();
        mirrorGroup.append("image")
            .attr("href", lowresTissuePic)
            .attr("x", -brushedCoords.x0)
            .attr("y", -brushedCoords.y0)
            .attr("width", 600)
            .attr("height", 600)
            .attr("clip-path", "url(#clip-path-mirrored)");
        const filteredData = waffleData.filter(d => {
            return brushedCoords.x0 <= d.x && d.x <= brushedCoords.x1 && brushedCoords.y0 <= d.y && d.y <= brushedCoords.y1;
        });

        mirrorGroup.selectAll("g.waffle-chart").remove();
        filteredData.forEach(d => {
            const group = mirrorGroup.append("g")
                .attr("transform", `translate(${d.x - brushedCoords.x0}, ${d.y - brushedCoords.y0})`)
                .classed("waffle-chart", true);

            let totalCells = 25;
            let filledCells = 0;
            d.ratios.forEach((ratio, index) => {
                let cells = Math.round(ratio * totalCells);
                for (let j = 0; j < cells; j++) {
                    if (filledCells >= totalCells) break;
                    const row = Math.floor(filledCells / 5);
                    const col = filledCells % 5;

                    group.append("rect")
                        .attr("x", col * cellSize)
                        .attr("y", row * cellSize)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", officialColors[index]);

                    filledCells++;
                }
            });
        });
    }, [brushEnabled, brushedCoords, waffleData]);


    // zoom behavior for mirrored group
    useEffect(() => {
        if (!brushedCoords) return;

        const svgElement = d3.select(svgRef.current);
        const mirrorGroup = svgElement.select(".mirrored");

        const zoomed = (event) => {
            const transform = event.transform;
            if(transform.k === 1) {
                console.log(brushedCoords.x1, brushedCoords.y0, '?????????')
                mirrorGroup.attr("transform", `translate(${brushedCoords.x1},${brushedCoords.y0})`);
            } else {
                const limitedX = Math.min(Math.max(transform.x, -brushedCoords.x0), 600 - brushedCoords.x1);
                const limitedY = Math.min(Math.max(transform.y, -brushedCoords.y0), 600 - brushedCoords.y1);
                mirrorGroup.attr("transform", `translate(${limitedX + brushedCoords.x1},${limitedY + brushedCoords.y0}) scale(${transform.k})`);
            }
        };

        const zoom = d3.zoom()
            .extent([[0, 0], [600, 600]])
            .scaleExtent([1, 2.5])
            .on("zoom", zoomed);

        if (zoomEnabled) {
            svgElement.call(zoom);
        } else {
            svgElement.on(".zoom", null);
        }
    }, [zoomEnabled, brushedCoords, brushEnabled]);

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
                <button onClick={() => setBrushEnabled(!brushEnabled)}>
                    {brushEnabled ? "Disable Brush" : "Enable Brush"}
                </button>
                <button onClick={() => setZoomEnabled(!zoomEnabled)}>
                    {zoomEnabled ? "Disable Zoom" : "Enable Zoom"}
                </button>
            </div>
        </>
    );
};
