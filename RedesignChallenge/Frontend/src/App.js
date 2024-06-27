import './App.css';
import React, { useEffect, useRef, useState } from "react";
import { KosaraChart } from './components/kosaraChart';
import { CellTypeChart } from './components/cellTypeChart';
import { GeneList } from './components/geneList';

function App() {
  const [selectedData, setSelectedData] = useState([]);

  return (
    <div className="App">
      <KosaraChart
        className="KosaraChart"
        setSelectedData={setSelectedData}
      />
      <CellTypeChart
        className="CellTypeChart"
        selectedData={selectedData}
      />
      <GeneList />
    </div>
  );
}

export default App;
