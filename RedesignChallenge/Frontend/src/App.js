import './App.css';
import React, { useEffect, useState, useMemo } from "react";
import { Card, Slider, Switch, Checkbox, Tooltip } from "antd";
import { QuestionCircleOutlined } from '@ant-design/icons';
import { KosaraChart } from './components/kosaraChart';
import { CellTypeChart } from './components/cellTypeChart';
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
  const [showBackgroundImage, setShowBackgroundImage] = useState(true);
  const [showKosaraCharts, setShowKosaraCharts] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [selectedGene, setSelectedGene] = useState(null);
  const [relatedGeneData, setRelatedGeneData] = useState();
  const [geneExpressionScale, setGeneExpressionScale] = useState([]);
  const [cellShownStatus, setCellShownStatus] = useState({
    X1: true,
    X2: true,
    X3: false,
    X4: false,
    X5: false,
    X6: false,
    X7: false,
    X8: false,
    X9: false
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

  function opacityChange(value) {
    setOpacity(value);
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
        title="Tools"
        style={{
          width: 300,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Switch style={{ margin: 2 }} onChange={() => setShowBackgroundImage(!showBackgroundImage)} checkedChildren="Hide Background Image" unCheckedChildren="Show Background Image" checked={showBackgroundImage} />
          <Switch style={{ margin: 2, backgroundColor: showKosaraCharts ? '#ED9121' : '#74C365' }} onChange={() => setShowKosaraCharts(!showKosaraCharts)} checked={showKosaraCharts} checkedChildren="Kosara Charts Mode" unCheckedChildren="Gene Mode" />
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <h5 style={{ marginBottom: 5, fontWeight: 500 }}>Kosara Chart Opacity</h5>
            <Tooltip placement="right" title={"Slided the bar to see the relationship of the cell types and the tissue"} overlayInnerStyle={{color: '#000'}} color={"white"} arrow={mergedArrow}>
              <QuestionCircleOutlined style={{ fontSize: 10 }} />
            </Tooltip>
          </div>
          <Slider style={{ margin: 0 }} defaultValue={1} onChange={opacityChange} disabled={!showKosaraCharts} step={0.1} max={1} min={0} />
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
            <h5 style={{ marginBottom: 5, fontWeight: 500 }}>UMI counts Legend</h5>
            <Tooltip placement="right" title={"Choosing a gene from the gene list first to show the specific gene expression value scale"} overlayInnerStyle={{color: '#000'}} color={"white"} arrow={mergedArrow}>
              <QuestionCircleOutlined style={{ fontSize: 10 }} />
            </Tooltip>
          </div>
          <GradientLegend selectedGene={selectedGene} min={geneExpressionScale[0]} max={geneExpressionScale[geneExpressionScale.length - 1]} />
        </div>
      </Card>
      <KosaraChart
        className="KosaraChart"
        setSelectedData={setSelectedData}
        showBackgroundImage={showBackgroundImage}
        showKosaraCharts={showKosaraCharts}
        cellShownStatus={cellShownStatus}
        opacity={opacity}
        relatedGeneData={relatedGeneData}
        selectedGene={selectedGene}
        setGeneExpressionScale={setGeneExpressionScale}
      />
      <div style={{ display: "flex", flexDirection: "column", width: "41%", height: "99vh" }}>
        <CellTypeChart
          className="CellTypeChart"
          selectedData={selectedData}
          selectedGene={selectedGene}
          setSelectedGene={setSelectedGene}
        />
        <GeneList
          selectedGene={selectedGene}
          setSelectedGene={setSelectedGene}
          setRelatedGeneData={setRelatedGeneData}
        />
      </div>
    </div>
  );
}

export default App;
