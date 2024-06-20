import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import data from "../data/piechart.csv";
import scaleJson from "../data/scalefactors_json.json";
import hiresTissuePic from '../data/tissue_hires_image.png';
import lowresTissuePic from '../data/tissue_lowres_image.png';

const officialColors = ["#EF3819", "#F39A2E", "#A4F93F", "#41F63D", "#4BF7A7", "#459CF9", "#3821F6", "#A031F7", "#F23C9D"];

export const KosaraChart = () => {
    const svgRef = useRef(null);
    const [showBackgroundImage, setShowBackgroundImage] = useState(true);
    const [showPieCharts, setShowPieCharts] = useState(true);

    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const radius = (spotDiameter * scalef / 2);

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
        const svg = svgElement
            .attr("width", 600)
            .attr("height", 600)
            .call(d3.zoom().scaleExtent([0.5, 10]).on("zoom", (event) => {
                svg.selectAll("g.content, g.background").attr("transform", event.transform);
            }));

        const contentGroup = svg.select(".content").empty() ? svg.append("g").attr("class", "content") : svg.select(".content");

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
                    console.log(d.ratios);
                    const arcs = d3.pie().value(d => parseFloat(d[1]))(ratios);
                    const color = d3.scaleOrdinal(officialColors);

                    const group = contentGroup.append("g")
                        .attr("transform", `translate(${d.x}, ${d.y})`);

                    group.selectAll('path')
                        .data(arcs)
                        .enter()
                        .append('path')
                        .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
                        .attr('fill', (d, index) => color(index));
                });
            } else {
                data.forEach((d) => {
                    const group = contentGroup.append("g")
                        .attr("transform", `translate(${d.x}, ${d.y})`);

                    group.append("circle")
                        .attr("r", radius)
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.1);
                });
            }
        });

    }, [showPieCharts]);

    return (
        <>
            <svg ref={svgRef}></svg>
            <button onClick={() => setShowBackgroundImage(!showBackgroundImage)}>
                {showBackgroundImage ? "Hide Background Image" : "Show Background Image"}
            </button>
            <button onClick={() => setShowPieCharts(!showPieCharts)}>
                {showPieCharts ? "Hide Pie Charts" : "Show Pie Charts"}
            </button>
        </>
    );
};