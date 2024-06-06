import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import data from "../data/piechart.csv";
import scaleJson from "../data/scalefactors_json.json";
import hiresTissuePic from '../data/tissue_hires_image.png'
import lowresTissuePic from '../data/tissue_lowres_image.png'

const officialColors = ["#EF3819", "#F39A2E", "#A4F93F", "#41F63D", "#4BF7A7", "#459CF9", "#3821F6", "#A031F7", "#F23C9D"]

export const PieChart = () => {
    const svgRef = useRef(null);
    const [showBackgroundImage, setShowBackgroundImage] = useState(true);

    // lowres scale factor
    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const radius = (spotDiameter * scalef / 2);

    useEffect(() => {
        const svgElement = d3.select(svgRef.current);
        svgElement.selectAll("*").remove();

        const svg = svgElement
            .attr("width", 600)
            .attr("height", 600);

        // Define the zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", (event) => {
                contentGroup.attr("transform", event.transform);
            });

        svg.call(zoom);

        const contentGroup = svg.append("g");

        if (showBackgroundImage) {
            contentGroup.append("image")
                .attr("href", lowresTissuePic)
                .attr("width", 600)
                .attr("height", 600);
        }

        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const pie = d3.pie().value(d => parseFloat(d[1]));

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
            data.forEach((d) => {
                const ratios = Object.entries(d.ratios);
                const arcs = pie(ratios);
                const color = d3.scaleOrdinal(officialColors);

                const group = contentGroup.append("g")
                    .attr("transform", `translate(${d.x}, ${d.y})`);

                group.selectAll('path')
                    .data(arcs)
                    .enter()
                    .append('path')
                    .attr('d', arc)
                    .attr('fill', (d, index) => color(index))
            });
        })
    }, [showBackgroundImage]);

    return (
        <>
            <svg ref={svgRef}></svg>
            <button onClick={() => setShowBackgroundImage(!showBackgroundImage)}>
                {showBackgroundImage ? "Hide Background Image" : "Show Background Image"}
            </button>
        </>
    );
};
