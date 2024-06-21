import React, { useEffect, useRef, useState } from "react";
import { Card, Slider, Switch } from "antd";
import * as d3 from "d3";
import data from "../data/kosaraChart.csv";
import scaleJson from "../data/scalefactors_json.json";
import lowresTissuePic from '../data/tissue_lowres_image.png';

const officialColors = {
    X1: '#FFC40C',
    X2: '#FF0800',
    X3: '#FDEE00',
    X4: '#007FFF',
    X5: '#32174D',
    X6: '#E5E4E2',
    X7: '#ED9121',
    X8: '#74C365',
    X9: '#355E3B'
}

export const KosaraChart = () => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);
    const [showBackgroundImage, setShowBackgroundImage] = useState(true);
    const [showKosaraCharts, setShowKosaraCharts] = useState(true);
    const [opacity, setOpacity] = useState(1);

    const scalef = scaleJson["tissue_lowres_scalef"];
    const spotDiameter = scaleJson["spot_diameter_fullres"];
    const radius = (spotDiameter * scalef / 2);

    function generateKosaraPath(pointX, pointY, angles, ratios) {
        const sequenceOrder = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9'];
        let paths = [];
        let lastStartPointX, lastStartPointY, lastEndPointX, lastEndPointY = 0;
        let topSixIndices = ratios.filter(item => item[1] !== 0).sort((a, b) => b[1] - a[1]).slice(0, 6).map(item => item[0]);
        let topSixAngles = topSixIndices.map(index => angles.find(item => item[0] === index));

        // TODO: angles for the first and middle spots are not very accurate, need to be fixed
        topSixAngles = topSixAngles.map(angle => [angle[0], angle[1] + 8]);
        topSixAngles.sort((a, b) => sequenceOrder.indexOf(a[0]) - sequenceOrder.indexOf(b[0]));

        console.log(angles, topSixAngles);
        topSixAngles.forEach((angle, index) => {
            let startpointX = pointX - radius * Math.sin((45 + angle[1]) * Math.PI / 180);
            let startpointY = pointY + radius * Math.cos((45 + angle[1]) * Math.PI / 180);
            let endpointX = pointX - radius * Math.sin((45 - angle[1]) * Math.PI / 180);
            let endpointY = pointY + radius * Math.cos((45 - angle[1]) * Math.PI / 180);

            let path = '';

            if (index === 0) {
                path = `M ${startpointX} ${startpointY} A ${radius} ${radius} 0 0 0 ${endpointX} ${endpointY} A ${radius} ${radius} 0 0 0 ${startpointX} ${startpointY} Z`;
            }
            else if (index === topSixAngles.length - 1) {
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
        })
        return paths;
    }

    function handleMouseOver(event, d) {
        const tooltip = d3.select(tooltipRef.current);
        const sequenceOrder = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9'];

        const topSix = d
            .filter(item => item[1] !== 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        topSix.sort((a, b) => sequenceOrder.indexOf(a[0]) - sequenceOrder.indexOf(b[0]));

        tooltip
            .style("display", "block")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`)
            .html(topSix.map(item => `${item[0]}: ${(item[1] * 100).toFixed(2)}%`).join("<br>"));
    }


    function handleMouseOut() {
        d3.select(tooltipRef.current).style("display", "none");
    }

    function onChange(value) {
        setOpacity(value);
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
            .call(d3.zoom().scaleExtent([0.5, 15]).on("zoom", (event) => {
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
            if (showKosaraCharts) {
                data.forEach((d) => {
                    const angles = Object.entries(d.angles);
                    const ratios = Object.entries(d.ratios);
                    const group = contentGroup.append("g")
                        .attr("class", "kosara-chart")
                        .attr("opacity", opacity)
                        .on("mouseover", (event) => handleMouseOver(event, ratios.filter(([key, value]) => value !== 0)))
                        .on("mouseout", handleMouseOut);

                    const paths = generateKosaraPath(d.x, d.y, angles, ratios);

                    paths.forEach(({ path, color }) => {
                        group.append('path')
                            .attr('d', path)
                            .attr('fill', color);
                    });
                });
            } else {
                data.forEach((d) => {
                    const ratios = Object.entries(d.ratios);
                    const group = contentGroup.append("g")
                        .attr("transform", `translate(${d.x}, ${d.y})`)
                        .attr("opacity", opacity)
                        .on("mouseover", (event) => handleMouseOver(event, ratios.filter(([key, value]) => value !== 0)))
                        .on("mouseout", handleMouseOut);

                    group.append("circle")
                        .attr("r", radius)
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.1);
                });
            }
        });

    }, [showKosaraCharts, opacity]);

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
                    <Switch style={{ margin: 2 }} onChange={() => setShowKosaraCharts(!showKosaraCharts)} checkedChildren="Show Kosara Charts" unCheckedChildren="Hide Kosara Charts" />
                    <h5 style={{ marginBottom: 5, fontWeight: 500 }}>Kosara Chart Opacity</h5>
                    <Slider style={{ margin: 0 }} defaultValue={1} onChange={onChange} step={0.1} max={1} min={0} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10, justifyContent: 'space-between' }}>
                        {Object.entries(officialColors).map(([key, color]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', marginRight: 10, marginBottom: 5 }}>
                                <div style={{ width: 18, height: 18, backgroundColor: color, marginRight: 5 }}></div>
                                <span>{key}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
            <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
            <div ref={tooltipRef} style={{ position: "absolute", backgroundColor: "white", border: "1px solid #ccc", padding: "10px", display: "none", pointerEvents: "none" }}></div>
        </div>
    );
};
