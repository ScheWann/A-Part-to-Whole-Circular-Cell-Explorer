import React, { useEffect, useRef, useState } from "react";
import { Card, Tabs } from "antd";
import * as d3 from "d3";
import "./Styles/cellTypeChart.css";

export const CellTypeChart = ({ selectedData }) => {
    const svgRef = useRef(null);
    const [tabKey, setTabKey] = useState("cellTypeTab");

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

    const tabList = [
        {
            key: "cellTypeTab",
            tab: "Cell Type Counts"
        },
        {
            key: "tSNETab",
            tab: "t-SNE Plot"
        }
    ]
    const chartList = {
        "cellTypeTab": <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>,
        "tSNETab": <div>123</div>
    }

    const onChangeTabKey = (newTabKey) => {
        setTabKey(newTabKey);
        console.log(newTabKey);
    };

    useEffect(() => {
        if (!selectedData || selectedData.length === 0 || !svgRef.current) return;

        if (tabKey === "cellTypeTab") {
            const counts = labels.map(label =>
                selectedData.reduce((count, item) => count + (item.ratios[label] > 0 ? 1 : 0), 0)
            );

            const svgElement = d3.select(svgRef.current);
            svgElement.selectAll("*").remove();

            if (!svgRef.current) {
                console.log('SVG element is not yet available.');
                return;
            }

            const width = svgRef.current.clientWidth;
            const height = svgRef.current.clientHeight;
            const margin = { top: 10, right: 20, bottom: 80, left: 45 };

            svgElement.attr("viewBox", `0 0 ${width} ${height}`);

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

            // x-axis label
            svgElement.append("text")
                .attr("x", width / 2)
                .attr("y", height - margin.bottom / 2)
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .attr("font-size", "0.8em")
                .text("Cell Types");

            // y-axis label
            svgElement.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", margin.left / 5)
                .attr("font-weight", "bold")
                .attr("font-size", "0.8em")
                .attr("text-anchor", "middle")
                .text("Counts");

        }

    }, [selectedData, tabKey]);

    return (
        <Card
            size="small"
            tabList={tabList}
            activeTabKey={tabKey}
            onTabChange={onChangeTabKey}
            style={{ height: "50vh" }}
        >
            {chartList[tabKey]}
        </Card>
    );
};
