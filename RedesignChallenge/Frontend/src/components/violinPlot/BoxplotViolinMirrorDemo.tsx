import React, { useEffect, useState } from "react";
import { Empty, Typography, Select } from "antd";
import { BoxplotViolinMirror } from "./BoxplotViolinMirror.tsx";
import "../Styles/violinPlot.css";

const HEADER_HEIGHT = 70;
const FOOTER_HEIGHT = 50;

const options = [
  {
    value: 'linear',
    label: 'Linear',
  },
  {
    value: 'log2',
    label: 'Log2',
  },
  {
    value: 'logNorm',
    label: 'LogNorm',
  }
];

export const BoxplotViolinMirrorDemo = ({
  width = 700,
  height = 400,
  selectedGene,
}) => {
  const [mirrorPosition, setMirrorPosition] = useState(0.6);
  const [violinPlotData, setViolinPlotData] = useState(null);
  const [smoothing, setSmoothing] = useState(true);
  const [featureAnalysisType, setFeatureAnalysisType] = useState("log2");

  useEffect(() => {
    if(featureAnalysisType === "log2" && selectedGene) {
      fetch("/getLog2ViolinPlotData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gene: selectedGene }),
      })
        .then((response) => response.json())
        .then((data) => {
          setViolinPlotData(data.values);
        });
    } else if(featureAnalysisType === "logNorm" && selectedGene) {
      fetch("/getLogNormViolinPlotData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gene: selectedGene }),
      })
        .then((response) => response.json())
        .then((data) => {
          setViolinPlotData(data.values);
        });
    }


  }, [selectedGene, featureAnalysisType]);

  const handleChange = (value: string) => {
    setFeatureAnalysisType(value);
    console.log(`selected ${value}`);
  };

  return selectedGene ? (
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
        <div className="controlGroup">
          <input
            type="range"
            min={0}
            max={1}
            value={mirrorPosition}
            step={0.01}
            onChange={(e) => setMirrorPosition(Number(e.target.value))}
            style={{ height: 2, opacity: 0.5 }}
          />
          <Select size="small" defaultValue="log2" options={options} onChange={handleChange} />
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
  ) : (
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      imageStyle={{
        height: 60,
      }}
      description={
        <Typography.Text>
          Choosing a gene from the gene list to display the violin plot.
        </Typography.Text>
      }
    />
  );
};
