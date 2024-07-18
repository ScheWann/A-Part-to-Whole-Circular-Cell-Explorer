import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import "./Styles/differentialFeatureTable.css";

export const DifferentialFeatureHeatmap = ({ differentialChartData }) => {
    const ref = useRef();

    useEffect(() => {
        if (!differentialChartData) return;

        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();
        const width = ref.current.clientWidth;
        const height = ref.current.clientHeight;
        const margin = { top: 10, right: 20, bottom: 38, left: 50 };
        
        svg.attr("viewBox", `0 0 ${width} ${height}`);
        
        const data = differentialChartData.items.flatMap(feature => [
            { cluster: 'Cluster 1', gene: feature.FeatureName, value: feature.cluster1L2FC },
            { cluster: 'Cluster 2', gene: feature.FeatureName, value: feature.cluster2L2FC },
            { cluster: 'Cluster 3', gene: feature.FeatureName, value: feature.cluster3L2FC },
            { cluster: 'Cluster 4', gene: feature.FeatureName, value: feature.cluster4L2FC },
            { cluster: 'Cluster 5', gene: feature.FeatureName, value: feature.cluster5L2FC },
            { cluster: 'Cluster 6', gene: feature.FeatureName, value: feature.cluster6L2FC },
            { cluster: 'Cluster 7', gene: feature.FeatureName, value: feature.cluster7L2FC },
            { cluster: 'Cluster 8', gene: feature.FeatureName, value: feature.cluster8L2FC },
            { cluster: 'Cluster 9', gene: feature.FeatureName, value: feature.cluster9L2FC },
        ]);

        const xScale = d3.scaleBand()
            .domain(differentialChartData.items.map(d => d.FeatureName))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const yScale = d3.scaleBand()
            .domain(d3.range(9).map(i => `Cluster ${i + 1}`))
            .range([margin.top, height - margin.bottom])
            .padding(0.1);

        const colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRdYlBu)
            .domain(d3.extent(data, d => d.value));

        // Render heatmap cells
        svg.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => xScale(d.gene))
            .attr("y", d => yScale(d.cluster))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d.value));

        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yAxis);

    }, [differentialChartData]);

    return (
        <svg ref={ref} width="100%" height="100%"></svg>
    );
};
