import { data } from "./data.ts";
import React, { useEffect } from "react";
import { BoxplotViolinMirror } from "./BoxplotViolinMirror.tsx";
import { useState } from "react";

const HEADER_HEIGHT = 70;
const FOOTER_HEIGHT = 50;

export const BoxplotViolinMirrorDemo = ({ width = 700, height = 400 }) => {
  const [mirrorPosition, setMirrorPosition] = useState(0.6);
  const [violinPlotData, setViolinPlotData] = useState(null);
  const [smoothing, setSmoothing] = useState(true);

  useEffect(() => {
    fetch("/getLog2ViolinPlotData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gene: "Xkr4" }),
    })
      .then((response) => response.json())
      .then((data) => {
        setViolinPlotData(data.values);
        console.log(data.values);
      });
  }, []);

  return (
    <div style={{ height, width }}>
      <div
        style={{
          height: HEADER_HEIGHT,
          marginLeft: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div>
          <input
            type="range"
            min={0}
            max={1}
            value={mirrorPosition}
            step={0.01}
            onChange={(e) => setMirrorPosition(Number(e.target.value))}
            style={{ height: 2, opacity: 0.5 }}
          />
        </div>
      </div>
      {violinPlotData && (
        <BoxplotViolinMirror
          data={violinPlotData}
          width={width}
          height={height - HEADER_HEIGHT - FOOTER_HEIGHT}
          mirrorPosition={mirrorPosition}
          smoothing={smoothing}
        />
      )}
      <div style={{ height: FOOTER_HEIGHT }}>
        <i style={{ color: "grey", fontSize: 14 }}>
          You can use{" "}
          <span
            style={{ color: "purple", cursor: "pointer" }}
            onClick={() => setSmoothing(true)}
          >
            smoothing
          </span>{" "}
          or{" "}
          <span
            style={{ color: "purple", cursor: "pointer" }}
            onClick={() => setSmoothing(false)}
          >
            steps
          </span>
          .
        </i>
      </div>
    </div>
  );
};
