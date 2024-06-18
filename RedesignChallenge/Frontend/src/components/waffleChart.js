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
    const [brushEnabled, setBrushEnabled] = useState(false);
    const [zoomEnabled, setZoomEnabled] = useState(false);
    const [waffleData, setWaffleData] = useState([]);
    const [brushedCoords, setBrushedCoords] = useState(null);
    const [resetZoom, setResetZoom] = useState(false);

    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const gridSize = spotDiameter * scalef;
    const cellSize = gridSize / 5;

    function showTooltip(data, position) {
        d3.select(".tooltip").remove();

        const tooltip = d3.select("body").append("div")
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

        const svg = tooltip.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);

        const xScale = d3.scaleBand()
            .domain(data.ratios.map((_, i) => `X${i + 1}`))
            .range([0, width])
            .padding(0.1);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale).ticks(5, "%");

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle");

        svg.append("g")
            .call(yAxis);

        svg.selectAll(".bar")
            .data(data.ratios)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => xScale(`X${i + 1}`))
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d) - 0.5)
            .attr("fill", (d, i) => officialColors[i]);
    }

    function hideTooltip() {
        d3.select(".tooltip").remove();
    }

    // zoom function
    const zoom = d3.zoom()
        .scaleExtent([1, 5])
        .on("zoom", (event) => {
            d3.select(svgRef.current).select('.tissue').attr('transform', event.transform);
        });

    // Function to reset zoom
    const resetZoomFunction = () => {
        const svgElement = d3.select(svgRef.current);
        svgElement.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    };

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

    // brush function
    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const svg = svgElement.select(".tissue");

        if (brushEnabled) {
            const brush = d3.brush()
                .extent([[0, 0], [600, 600]])
                .on("brush", brushMove);

            svg.append("g")
                .attr("class", "brush")
                .call(brush);
        } else {
            svg.select(".brush").remove();
            setBrushedCoords(null);
        }

        function brushMove(event) {
            const selection = event.selection;
            if (!event.sourceEvent || !selection) return;
            const [[x0, y0], [x1, y1]] = selection;
            setBrushedCoords({ x0, y0, x1, y1 });

            svg.selectAll("g.waffle-chart")
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

        mirrorGroup.attr("transform", `translate(${offsetX}, ${offsetY})`);

        svgElement.select("#clip-path-mirrored").remove();
        svgElement.append("clipPath")
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
                .classed("waffle-chart", true)
                .on("mouseover", (event) => {
                    svgElement.selectAll(`g[data-barcode='${d.barcode}']`)
                        .each(function () {
                            const firstChild = d3.select(this).select(':first-child');
                            const originalColor = firstChild.style("fill");
                            firstChild
                                .attr("data-original-color", originalColor)
                                .style("fill", "black");
                        });
                    const position = { x: event.pageX, y: event.pageY };
                    showTooltip({ ratios: d.ratios }, position);
                })
                .on("mouseout", () => {
                    svgElement.selectAll(`g[data-barcode='${d.barcode}']`)
                        .select(':first-child')
                        .style("fill", function () {
                            return d3.select(this).attr("data-original-color");
                        });
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
                <button onClick={() => setResetZoom(true)}>Reset Zoom</button>
            </div>
        </>
    );
};
