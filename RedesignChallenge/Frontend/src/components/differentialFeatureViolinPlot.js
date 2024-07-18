import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const DifferentialFeatureViolinPlot = () => {
    const [violinPlotData, setViolinPlotData] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        fetch('/getLog2ViolinPlotData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ gene: 'Xkr4' })
        })
            .then(response => response.json())
            .then(data => {
                setViolinPlotData(data);
                console.log(data);
            });
    }, []);

    useEffect(() => {
        if (violinPlotData) {
            drawViolinPlot();
        }
    }, [violinPlotData]);

    // const drawViolinPlot = () => {
    //     const svg = d3.select(ref.current);
    //     svg.selectAll("*").remove();

    //     const width = 800; // Set static width or use ref to get dynamic width
    //     const height = 400; // Set static height or use ref to get dynamic height
    //     const margin = { top: 10, right: 20, bottom: 50, left: 50 };

    //     svg.attr("viewBox", `0 0 ${width} ${height}`);

    //     const xScale = d3.scaleBand()
    //         .domain(violinPlotData.categories)
    //         .range([margin.left, width - margin.right])
    //         .padding(0.1);

    //     const yScale = d3.scaleLinear()
    //         .domain([0, d3.max(violinPlotData.values, cluster => d3.max(cluster))])
    //         .range([height - margin.bottom, margin.top]);

    //     // Axes
    //     svg.append("g")
    //         .attr("transform", `translate(0,${height - margin.bottom})`)
    //         .call(d3.axisBottom(xScale));

    //     svg.append("g")
    //         .attr("transform", `translate(${margin.left},0)`)
    //         .call(d3.axisLeft(yScale));

    //     const kernelDensityEstimator = (kernel, X) => {
    //         return V => X.map(x => ({ x, y: d3.mean(V, v => kernel(x - v)) }));
    //     };

    //     const kernelEpanechnikov = k => {
    //         return v => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    //     };

    //     const kde = kernelDensityEstimator(kernelEpanechnikov(7), yScale.ticks(40));

    //     violinPlotData.categories.forEach((category, i) => {
    //         const kdeData = kde(violinPlotData.values[i]);
    //         console.log(kdeData, '?????');
    //         const area = d3.area()
    //             .curve(d3.curveCatmullRom)
    //             .x0(d => xScale(category) + xScale.bandwidth() / 2)
    //             .x1(d => xScale(category) + xScale.bandwidth() / 2 - (d.y ? yScale(d.y) : 0))
    //             .y(d => yScale(d.x));

    //         svg.append("path")
    //             .datum(kdeData)
    //             .attr("d", area)
    //             .style("fill", "steelblue")
    //             .style("opacity", 0.6)
    //             .style("stroke", "black")
    //             .style("stroke-width", "1px");
    //     });
    // };
    const drawViolinPlot = () => {
        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();
    
        const width = 800; // Static width
        const height = 400; // Static height
        const margin = { top: 10, right: 20, bottom: 50, left: 50 };
    
        svg.attr("viewBox", `0 0 ${width} ${height}`);
    
        const xScale = d3.scaleBand()
            .domain(violinPlotData.categories)
            .range([margin.left, width - margin.right])
            .padding(0.1);
    
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(violinPlotData.values.flat())])  // Make sure to flatten the values for proper max calculation
            .range([height - margin.bottom, margin.top]);
    
        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));
    
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));
    
        const kernelDensityEstimator = (kernel, X) => {
            return V => X.map(x => ({ x, y: d3.mean(V, v => kernel(x - v)) }));
        };
    
        const kernelEpanechnikov = k => {
            return v => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    
        const kde = kernelDensityEstimator(kernelEpanechnikov(7), yScale.ticks(40));
    
        violinPlotData.categories.forEach((category, i) => {
            const kdeData = kde(violinPlotData.values[i]);
            console.log(kdeData); // Check the output here
            const area = d3.area()
                .curve(d3.curveCatmullRom)
                .x0(d => xScale(category) + xScale.bandwidth() / 2 - 30 * d.y)  // Adjust scaling factor for KDE visualization
                .x1(d => xScale(category) + xScale.bandwidth() / 2 + 30 * d.y)  // Adjust scaling factor for KDE visualization
                .y(d => yScale(d.x));
    
            svg.append("path")
                .datum(kdeData)
                .attr("d", area)
                .style("fill", "steelblue")
                .style("opacity", 0.6)
                .style("stroke", "black")
                .style("stroke-width", "1px");
        });
    };
    

    return (
        <svg ref={ref} width="100%" height="100%"></svg>
    );
};
