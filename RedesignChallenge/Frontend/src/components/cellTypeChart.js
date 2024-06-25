import React, { useEffect, useRef } from "react";
import { Card } from "antd";
import * as d3 from "d3";

export const CellTypeChart = ({ selectedData }) => {
    const svgRef = useRef(null);
    const labels = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9'];
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
    };

    useEffect(() => {
        if (!selectedData || selectedData.length === 0) return;

        const counts = labels.map(label => 
            selectedData.reduce((count, item) => count + (item.ratios[label] > 0 ? 1 : 0), 0)
        );

        // Set dimensions for the SVG canvas
        const svgElement = d3.select(svgRef.current);
        const parentWidth = svgRef.current.parentElement.clientWidth; // Get parent div width
        const width = parentWidth * 0.35; // Set SVG width to 50% of parent div width
        const height = 200; // Set the height of the SVG
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        
        svgElement.attr("width", width).attr("height", height);

        svgElement.selectAll("*").remove();

        const xScale = d3.scaleBand()
            .domain(labels)
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(counts)])
            .range([height - margin.bottom, margin.top]);

        svgElement.selectAll(".bar")
            .data(counts)
            .enter()
            .append("rect")
            .classed("bar", true)
            .attr("x", (d, i) => xScale(labels[i]))
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - margin.bottom - yScale(d))
            .attr("fill", (d, i) => officialColors[labels[i]]);

        svgElement.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        svgElement.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

    }, [selectedData]);

    return (
        <svg ref={svgRef}></svg>
    );
};
