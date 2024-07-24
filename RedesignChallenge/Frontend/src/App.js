import './App.css';
import React, { useEffect, useState, useMemo } from "react";
import { Card, Slider, Switch, Checkbox, Tooltip } from "antd";
import { QuestionCircleOutlined } from '@ant-design/icons';
import { KosaraChart } from './components/kosaraChart';
import { CellAnalysisChart } from './components/cellAnalysisChart';
import { DifferentialChart } from './components/differentialChart';
import { GeneList } from './components/geneList';
import { GradientLegend } from './components/gradientLegend';

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

function App() {
  const [selectedData, setSelectedData] = useState([]);
  const [hoveronTSNECell, setHoveronTSNECell] = useState(null);
  const [showBackgroundImage, setShowBackgroundImage] = useState(true);
  const [showKosaraCharts, setShowKosaraCharts] = useState(true);
  const [UMITotalCounts, setUMITotalCounts] = useState({});
  const [opacity, setOpacity] = useState(1);
  const [selectedGene, setSelectedGene] = useState(null);
  const [relatedGeneData, setRelatedGeneData] = useState(null);
  const [geneExpressionScale, setGeneExpressionScale] = useState([]);
  const [showtSNECluster, setShowtSNECluster] = useState(false);
  const [tissueClusterData, setTissueClusterData] = useState([]);
  const [cellShownStatus, setCellShownStatus] = useState({
    X1: false,
    X2: false,
    X3: false,
    X4: false,
    X5: false,
    X6: false,
    X7: false,
    X8: false,
    X9: true
  });
  const [arrow, setArrow] = useState('Show');
  const mergedArrow = useMemo(() => {
    if (arrow === 'Hide') {
      return false;
    }
    if (arrow === 'Show') {
      return true;
    }
    return {
      pointAtCenter: true,
    };
  }, [arrow]);

  useEffect(() => {
    if (selectedGene !== null) {
      setShowKosaraCharts(false);
    }
  }, [selectedGene]);

  useEffect(() => {
    if (!showKosaraCharts && selectedGene === null && !showtSNECluster) {
      fetch("/getUMITotalCounts")
        .then(res => res.json())
        .then(data => {
          setUMITotalCounts(data);
        });
    } else {
      setUMITotalCounts({});
      fetch("./getCellClusterUMItsne")
        .then(res => res.json())
        .then(data => {
          setTissueClusterData(data);
        });
    }
  }, [showKosaraCharts, selectedGene]);

  function opacityChange(value) {
    setOpacity(value);
  }

  function kosaraChartsChange(value) {
    setShowKosaraCharts(value);
    setSelectedGene(null);
  }

  function onChangeShowCell(cell) {
    return (event) => {
      setCellShownStatus({ ...cellShownStatus, [cell]: event.target.checked });
    }
  }

  return (
    <div className="App">
      {/* Button groups */}
      <Card
        size="small"
        title={
        <span>
          Tools
          <Tooltip placement="right" title={"Control the entire inferface collection. In Kosara mode, you can select the cell type you are interested in to display. In Gene mode, you can display the number of UMIs of the gene you are interested in."} overlayInnerStyle={{ color: '#000' }} color={"white"}>
            <QuestionCircleOutlined style={{ marginLeft: 3, fontSize: 10 }} />
          </Tooltip>
        </span>}
        style={{
          width: "280px",
          height: "99vh",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Switch style={{ margin: 2 }} onChange={() => setShowBackgroundImage(!showBackgroundImage)} checkedChildren="Hide Background Image" unCheckedChildren="Show Background Image" checked={showBackgroundImage} />
          <Switch style={{ margin: 2, backgroundColor: showKosaraCharts ? '#ED9121' : '#74C365' }} onChange={kosaraChartsChange} checked={showKosaraCharts} checkedChildren="Kosara Charts Mode" unCheckedChildren="Gene Mode" />
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <h5 style={{ marginBottom: 5, marginTop: 5, fontWeight: 500 }}>Opacity</h5>
            <Tooltip placement="right" title={"Slided the bar to see the relationship of the cell types and the tissue"} overlayInnerStyle={{ color: '#000' }} color={"white"} arrow={mergedArrow}>
              <QuestionCircleOutlined style={{ marginLeft: 3, fontSize: 10 }} />
            </Tooltip>
          </div>
          <Slider style={{ margin: 0 }} defaultValue={1} onChange={opacityChange} step={0.1} max={1} min={0} />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10, justifyContent: 'space-between' }}>
            {Object.entries(officialColors).map(([key, color]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', marginRight: 10, marginBottom: 5 }}>
                <Checkbox checked={cellShownStatus[key]} onChange={onChangeShowCell(key)} disabled={!showKosaraCharts} style={{
                  "--background-color": color,
                  "--border-color": color,
                }} />
                <div style={{ width: 15, height: 15, backgroundColor: color, marginLeft: 3 }}></div>
                <span style={{ marginLeft: 5 }}>{key}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <h5 style={{ marginBottom: 5, marginTop: 5, fontWeight: 500 }}>UMI counts Legend</h5>
            <Tooltip placement="right" title={"Searching a gene and choose to show the specific gene expression value scale"} overlayInnerStyle={{ color: '#000' }} color={"white"} arrow={mergedArrow}>
              <QuestionCircleOutlined style={{ marginLeft: 3, fontSize: 10 }} />
            </Tooltip>
          </div>
          {showKosaraCharts || showtSNECluster ?
            <GradientLegend selectedGene={selectedGene} min={geneExpressionScale[0]} max={geneExpressionScale[geneExpressionScale.length - 1]} showKosaraCharts={showKosaraCharts} colorScaleType="Grey" />
            :
            <GradientLegend selectedGene={selectedGene} min={geneExpressionScale[0]} max={geneExpressionScale[geneExpressionScale.length - 1]} showKosaraCharts={showKosaraCharts} colorScaleType="Orange" />
          }
          <GeneList
            setShowtSNECluster={setShowtSNECluster}
            selectedGene={selectedGene}
            setSelectedGene={setSelectedGene}
            setRelatedGeneData={setRelatedGeneData}
          />
        </div>
      </Card>
      <KosaraChart
        className="KosaraChart"
        setSelectedData={setSelectedData}
        showBackgroundImage={showBackgroundImage}
        showKosaraCharts={showKosaraCharts}
        cellShownStatus={cellShownStatus}
        hoveronTSNECell={hoveronTSNECell}
        opacity={opacity}
        relatedGeneData={relatedGeneData}
        selectedGene={selectedGene}
        showtSNECluster={showtSNECluster}
        UMITotalCounts={UMITotalCounts}
        tissueClusterData={tissueClusterData}
        setGeneExpressionScale={setGeneExpressionScale}
      />
      <div className="analysisGroup">
        <CellAnalysisChart
          // className="CellTypeChart"
          showKosaraCharts={showKosaraCharts}
          setShowKosaraCharts={setShowKosaraCharts}
          selectedData={selectedData}
          setHoveronTSNECell={setHoveronTSNECell}
          showtSNECluster={showtSNECluster}
          setShowtSNECluster={setShowtSNECluster}
        />
        <DifferentialChart selectedGene={selectedGene} />
      </div>
    </div>
  );
}

export default App;
