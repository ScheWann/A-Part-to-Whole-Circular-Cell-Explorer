import './App.css';
import React, { useEffect, useRef, useState } from "react";
import { Card, Slider, Switch, Checkbox } from "antd";
import { KosaraChart } from './components/kosaraChart';
import { CellTypeChart } from './components/cellTypeChart';

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
  const [opacity, setOpacity] = useState(1);

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
          <Switch style={{ margin: 2 }} onChange={() => setShowBackgroundImage(!showBackgroundImage)} checkedChildren="Hide Background Image" unCheckedChildren="Show Background Image" />
          <Switch style={{ margin: 2, backgroundColor: showKosaraCharts ? '#ED9121' : '#74C365' }} onChange={() => setShowKosaraCharts(!showKosaraCharts)} checked={showKosaraCharts} checkedChildren="Kosara Charts Mode" unCheckedChildren="Gene Mode" />
          <h5 style={{ marginBottom: 5, fontWeight: 500 }}>Kosara Chart Opacity</h5>
          <Slider style={{ margin: 0 }} defaultValue={1} onChange={opacityChange} disabled={!showKosaraCharts} step={0.1} max={1} min={0} />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10, justifyContent: 'space-between' }}>
            {Object.entries(officialColors).map(([key, color]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', marginRight: 10, marginBottom: 5 }}>
                <Checkbox checked={cellShownStatus[key]} onChange={onChangeShowCell(key)} style={{
                  "--background-color": color,
                  "--border-color": color,
                }} />
                <div style={{ width: 15, height: 15, backgroundColor: color, marginLeft: 3 }}></div>
                <span style={{ marginLeft: 5 }}>{key}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <KosaraChart
        className="KosaraChart"
        setSelectedData={setSelectedData}
        showBackgroundImage={showBackgroundImage}
        showKosaraCharts={showKosaraCharts}
        setCellShownStatus={setCellShownStatus}
        cellShownStatus={cellShownStatus}
        opacity={opacity}
        setOpacity={setOpacity}
      />
      <CellTypeChart
        className="CellTypeChart"
        selectedData={selectedData}
      />
    </div>
  );
}

export default App;
