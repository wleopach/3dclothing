import CanvasModel from './canvas'
import Customizer from "./pages/Customizer.jsx";
import Home from "./pages/Home";
import {Provider} from "./components/ui/provider"
function App() {
    return (
    <Provider>
        <main className="app  transition-all ease-in">
            <Home/>
            <CanvasModel/>
            <Customizer/>
        </main>
    </Provider>


    )
}

export default App
