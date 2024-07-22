import * as d3 from "d3";
import React, { useState, useRef } from "react";

type VerticalViolinShapeProps = {
  data: number[];
  binNumber: number;
  yScale: d3.scaleLinear<number, number, never>;
  width: number;
  fill: string;
  smoothing: boolean;
};

export const VerticalViolinShape = ({
  data,
  yScale,
  width,
  binNumber,
  fill,
  smoothing,
}: VerticalViolinShapeProps) => {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const tooltip = useRef<null | d3.selection<HTMLDivElement, unknown, HTMLElement, any>>(null);
  const min = Math.min(...data);
  const max = Math.max(...data);

  const thresholds = d3.range(min, max, (max - min) / binNumber);
  if (thresholds[thresholds.length - 1] !== max) {
    thresholds.push(max);
  }
  
  const binBuilder = d3
    .bin()
    .domain([min, max])
    .thresholds(thresholds)
    .value((d) => d);
  const bins = binBuilder(data);
  if (!tooltip.current) {
    tooltip.current = d3
      .select("body")
      .append("div")
      .attr("class", "violinPlotTooltip")
      .style("opacity", 0);
  }
  const biggestBin = Math.max(...bins.map((b) => b.length));

  const wScale = d3
    .scaleLinear()
    .domain([-biggestBin, biggestBin])
    .range([0, width]);

  const areaBuilder = d3
    .area<d3.bin<number, number>>()
    .x0((d) => wScale(-d.length))
    .x1((d) => wScale(d.length))
    .y((d) => {
      return yScale(d.x0 || 0);
    })
    .curve(smoothing ? d3.curveBumpY : d3.curveStep);

  const areaPath = areaBuilder(bins);
  return (
    <>
      <path
        d={areaPath ? areaPath : ""}
        opacity={1}
        stroke="black"
        fill={fill}
        fillOpacity={1}
        strokeWidth={1}
        onMouseMove={(event) => {
          const info = `Min: ${min}, Max: ${max}`;
          setTooltipContent(info);
          tooltip.current?.html(info)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`)
            .style("opacity", 0.9);
        }}
        onMouseOut={() => {
          tooltip.current?.style("opacity", 0);
        }}
      />
    </>
  );
};
