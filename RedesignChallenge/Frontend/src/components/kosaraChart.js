import React, { useEffect, useRef, useState } from "react";
import { Card, Slider, Switch } from "antd";
import * as d3 from "d3";
import data from "../data/kosaraChart.csv";
import scaleJson from "../data/scalefactors_json.json";
import lowresTissuePic from '../data/tissue_lowres_image.png';

const officialColors = {
    X1: '#007ed3',
    X2: '#FF004F',
    X3: '#9400D3',
    X4: '#FFC40C',
    X5: '#59260B',
    X6: '#40E0D0',
    X7: '#FF4F00',
    X8: '#C19A6B',
    X9: '#006D6F'
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

            paths.push({ path, color: officialColors[angle[0]], label: angle[0], percentage: angle[1] });

            lastStartPointX = startpointX;
            lastStartPointY = startpointY;
            lastEndPointX = endpointX;
            lastEndPointY = endpointY;
        })
        return paths;
    }

    function handleMouseOver(event, d) {
        const tooltip = d3.select(tooltipRef.current);
        tooltip
            .style("display", "block")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`)
            .html(d.map(item => `${item[0]}: ${(item[1] * 100).toFixed(2)}%`).join("<br>"));
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
                    const group = contentGroup.append("g")
                        .attr("class", "kosara-chart")
                        .attr("opacity", opacity)
                        .on("mouseover", (event) => handleMouseOver(event, Object.entries(d.ratios).filter(([key, value]) => value !== 0)))
                        .on("mouseout", handleMouseOut);

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
                        .attr("transform", `translate(${d.x}, ${d.y})`)
                        .attr("opacity", opacity)
                        .on("mouseover", (event) => handleMouseOver(event, Object.entries(d.ratios).filter(([key, value]) => value !== 0)))
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
                    <Slider style={{ margin: 0 }} defaultValue={1} onChange={onChange} step={0.1} max={1} min={0}/>
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
