//import CanvasModel from './canvas'
//import Customizer from "./pages/Customizer.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/Login";
import ClientPage from "./components/ClientPage";
import ProductSelectionForm from "./components/ProductSelectionForm";
import ColorSelectionForm from "./components/ColorSelectionForm";
import SizeSelectionForm from "./components/SizeSelectionForm";
import ControlPanel from "./components/ControlPanel";
import Cart from "./components/Cart";
import Orders from "./components/Orders.jsx";
import {Provider} from "./components/ui/provider"
function App() {

    return (
    <Provider>
        <Router>
            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/control-panel" element={<ControlPanel />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/client" element={<ClientPage />} />
                <Route path="/product" element={<ProductSelectionForm />} />
                <Route path="/color" element={<ColorSelectionForm />} />
                <Route path="/size" element={<SizeSelectionForm />} />
                <Route path="/cart" element={<Cart />} />

            </Routes>
        </Router>
    </Provider>


    )
}

export default App
