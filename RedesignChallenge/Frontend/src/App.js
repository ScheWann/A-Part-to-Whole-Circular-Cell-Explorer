import './App.css';
import { WaffleChart } from './components/waffleChart';
import { PieChart } from './components/pieChart';
import { KosaraChart } from './components/kosaraChart';

function App() {
  return (
    <div className="App">
      {/* <PieChart /> */}
      <KosaraChart />
      {/* <WaffleChart /> */}
    </div>
  );
}

export default App;
