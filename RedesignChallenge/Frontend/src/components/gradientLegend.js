import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export const GradientLegend = ({ min, max, selectedGene, showKosaraCharts }) => {
    const ref = useRef();

    useEffect(() => {
        const svgElement = ref.current;
        const svg = d3.select(svgElement);
        const boundingRect = svgElement.getBoundingClientRect();
        const width = boundingRect.width;
        const height = 20;

        svg.selectAll("*").remove();

        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d3.interpolateBlues(0));

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d3.interpolateBlues(1));

        // Add rectangle filled with gradient
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "url(#gradient)");

        // Add text labels for min and max
        svg.append("text")
            .attr("x", 0)
            .attr("y", height + 15)
            .text(min)
            .attr("font-size", "12px");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 15)
            .text(selectedGene ? selectedGene : "")
            .attr("font-size", "12px")
            .style("text-anchor", "middle");

        svg.append("text")
            .attr("x", width)
            .attr("y", height + 15)
            .text(max)
            .attr("font-size", "12px")
            .style("text-anchor", "end");

    }, [min, max, selectedGene, showKosaraCharts]);

    return (
        <svg ref={ref} style={{ width: "100%", height: "60px" }} />
    )
};