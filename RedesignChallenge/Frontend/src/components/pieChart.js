import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import data from "../data/piechart.csv";
import scaleJson from "../data/scalefactors_json.json";
import lowresTissuePic from '../data/tissue_lowres_image.png';

const officialColors = ["#EF3819", "#F39A2E", "#A4F93F", "#41F63D", "#4BF7A7", "#459CF9", "#3821F6", "#A031F7", "#F23C9D"];

export const PieChart = () => {
    const svgRef = useRef(null);
    const [showBackgroundImage, setShowBackgroundImage] = useState(true);
    const [showPieCharts, setShowPieCharts] = useState(false);
    const [brushEnabled, setBrushEnabled] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const radius = (spotDiameter * scalef / 2);

    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const svg = svgElement
            .attr("width", 600)
            .attr("height", 600)
            .call(d3.zoom().scaleExtent([0.5, 10]).on("zoom", (event) => {
                if (brushEnabled) {
                    selectedItems.forEach(item => {
                        svg.select(`g[data-barcode="${item}"]`).attr("transform", event.transform);
                    });
                } else {
                    svg.selectAll("g.content, g.background").attr("transform", event.transform);
                }
            }));

        if (brushEnabled) {
            const brush = d3.brush()
                .extent([[0, 0], [600, 600]])
                .on("end", brushEnded);

            svg.append("g")
                .attr("class", "brush")
                .call(brush);
        } else {
            svg.select(".brush").remove();
        }

        function brushEnded(event) {
            const selection = event.selection;
            if (!event.sourceEvent || !selection) return;
            const [[x0, y0], [x1, y1]] = selection;

            const selected = svg.selectAll("g.pie-chart")
                .filter(function () {
                    const cx = +d3.select(this).attr("data-x");
                    const cy = +d3.select(this).attr("data-y");
                    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                });

            setSelectedItems(selected.nodes().map(node => d3.select(node).attr("data-barcode")));
        }

        return () => {
            if (!brushEnabled) svg.select(".brush").remove();
        };
    }, [brushEnabled]);

    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        const backgroundGroup = svgElement.select(".background").empty() ? svgElement.append("g").attr("class", "background") : svgElement.select(".background");

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
        const svgElement = d3.select(svgRef.current);
        const contentGroup = svgElement.select(".content").empty() ? svgElement.append("g").attr("class", "content") : svgElement.select(".content");

        d3.csv(data, d => ({
            barcode: d.barcode,
            x: +d.x * scalef,
            y: +d.y * scalef,
            ratios: {
                X1: +d.X1,
                X2: +d.X2,
                X3: +d.X3,
                X4: +d.X4,
                X5: +d.X5,
                X6: +d.X6,
                X7: +d.X7,
                X8: +d.X8,
                X9: +d.X9
            }
        })).then(data => {
            contentGroup.selectAll("g").remove();
            if (showPieCharts) {
                data.forEach((d) => {
                    const ratios = Object.entries(d.ratios);
                    const arcs = d3.pie().value(d => parseFloat(d[1]))(ratios);
                    const color = d3.scaleOrdinal(officialColors);

                    const group = contentGroup.append("g")
                        .attr("transform", `translate(${d.x}, ${d.y})`)
                        .attr("data-barcode", d.barcode)
                        .attr("data-x", d.x)
                        .attr("data-y", d.y)
                        .classed("pie-chart", true);

                    group.selectAll('path')
                        .data(arcs)
                        .enter()
                        .append('path')
                        .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
                        .attr('fill', (d, index) => color(index));
                });
            } else {
                data.forEach((d) => {
                    const isItemSelected = selectedItems.includes(d.barcode);
                    if (isItemSelected) {
                        const ratios = Object.entries(d.ratios);
                        const arcs = d3.pie().value(d => parseFloat(d[1]))(ratios);
                        const color = d3.scaleOrdinal(officialColors);

                        const group = contentGroup.append("g")
                            .attr("transform", `translate(${d.x}, ${d.y})`)
                            .attr("data-barcode", d.barcode)
                            .attr("data-x", d.x)
                            .attr("data-y", d.y)
                            .classed("pie-chart", true);

                        group.selectAll('path')
                            .data(arcs)
                            .enter()
                            .append('path')
                            .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
                            .attr('fill', (d, index) => color(index));
                    } else {
                        const group = contentGroup.append("g")
                            .attr("transform", `translate(${d.x}, ${d.y})`)
                            .attr("data-barcode", d.barcode)
                            .attr("data-x", d.x)
                            .attr("data-y", d.y)
                            .classed("pie-chart", true);

                        group.append("circle")
                            .attr("r", radius)
                            .attr("fill", "none")
                            .attr("stroke", "black")
                            .attr("stroke-width", 0.1);
                    }
                });
            }
        });
    }, [showPieCharts, selectedItems]);

    return (
        <>
            <svg ref={svgRef}></svg>
            <button onClick={() => setShowBackgroundImage(!showBackgroundImage)}>
                {showBackgroundImage ? "Hide Background Image" : "Show Background Image"}
            </button>
            <button onClick={() => setShowPieCharts(!showPieCharts)}>
                {showPieCharts ? "Hide Pie Charts" : "Show Pie Charts"}
            </button>
            <button onClick={() => setBrushEnabled(!brushEnabled)}>
                {brushEnabled ? "Disable Brush" : "Enable Brush"}
            </button>
        </>
    );
};
