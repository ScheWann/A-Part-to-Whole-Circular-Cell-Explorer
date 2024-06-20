import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import data from "../data/kosaraChart.csv";
import scaleJson from "../data/scalefactors_json.json";
import lowresTissuePic from '../data/tissue_lowres_image.png';

const officialColors = {
    X1: "#EF3819",
    X2: "#F39A2E",
    X3: "#A4F93F",
    X4: "#41F63D",
    X5: "#4BF7A7",
    X6: "#459CF9",
    X7: "#3821F6",
    X8: "#A031F7",
    X9: "#F23C9D"
}

export const KosaraChart = () => {
    const svgRef = useRef(null);
    const [showBackgroundImage, setShowBackgroundImage] = useState(true);
    const [showPieCharts, setShowPieCharts] = useState(true);

    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const radius = (spotDiameter * scalef / 2);

    function generateKosaraPath(pointX, pointY, angles) {
        let paths = [];
        let lastStartPointX, lastStartPointY, lastEndPointX, lastEndPointY = 0;
        let filteredAngles = angles.filter(item => item[1] !== 0);

        filteredAngles.forEach((angle, index) => {
            let startpointX = pointX - radius * Math.sin((45 + angle[1]) * Math.PI / 180);
            let startpointY = pointY - radius * Math.cos((45 + angle[1]) * Math.PI / 180);
            let endpointX = pointX - radius * Math.sin((45 - angle[1]) * Math.PI / 180);
            let endpointY = pointY - radius * Math.cos((45 - angle[1]) * Math.PI / 180);
    
            let path = '';

            if (index === 0) {
                path = `M ${startpointX} ${startpointY} A ${radius} ${radius} 0 0 0 ${endpointX} ${endpointY} A ${radius} ${radius} 0 0 0 ${startpointX} ${startpointY} Z`;
            } 
            else if (index === filteredAngles.length - 1) {
                path = `M ${lastStartPointX} ${lastStartPointY} A ${radius} ${radius} 0 0 0 ${lastEndPointX} ${lastEndPointY} A ${radius} ${radius} 0 1 1 ${lastStartPointX} ${lastStartPointY} Z`;
            } 
            else {
                path = `M ${lastStartPointX} ${lastStartPointY} A ${radius} ${radius} 0 0 0 ${lastEndPointX} ${lastEndPointY} A ${radius} ${radius} 0 0 1 ${endpointX} ${endpointY} A ${radius} ${radius} 0 0 1 ${startpointX} ${startpointY} A ${radius} ${radius} 0 0 1 ${lastStartPointX} ${lastStartPointY} Z`;
            }
    
            paths.push({path, color: officialColors[angle[0]]});

            lastStartPointX = startpointX;
            lastStartPointY = startpointY;
            lastEndPointX = endpointX;
            lastEndPointY = endpointY;
        })
        return paths;
    }

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
            },
            angles: {
                X1: +d.X1_angle,
                X2: +d.X2_angle,
                X3: +d.X3_angle,
                X4: +d.X4_angle,
                X5: +d.X5_angle,
                X6: +d.X6_angle,
                X7: +d.X7_angle,
                X8: +d.X8_angle,
                X9: +d.X9_angle
            }
        })).then(data => {
            contentGroup.selectAll("g").remove();
            if (showPieCharts) {
                data.forEach((d) => {
                    const angles = Object.entries(d.angles);
                    const group = contentGroup.append("g")
                    const paths = generateKosaraPath(d.x, d.y, angles);

                    paths.forEach(({ path, color }) => {
                        group.append('path')
                            .attr('d', path)
                            .attr('fill', color);
                    });
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
