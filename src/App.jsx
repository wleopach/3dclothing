import { HashRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/Login";
import ClientPage from "./components/ClientPage";
import ProductSelectionForm from "./components/ProductSelectionForm";
import ColorSelectionForm from "./components/ColorSelectionForm";
import SizeSelectionForm from "./components/SizeSelectionForm";
import ControlPanel from "./components/ControlPanel";
import DetailsForm from "./components/DetailsForm";
import Cart from "./components/Cart";
import Orders from "./components/Orders.jsx";
import { Provider } from "./components/ui/provider"
import Home from "./components/Home";
import ModuleCurrentOrder from "./components/ModuleCurrentOrder";
import StatePersistence from "./components/StatePersistence";

function App() {
    return (
        <Provider>
            <StatePersistence />
            <HashRouter >
                <Routes>
                    <Route path="/" element={<LoginForm />} />
                    <Route path="/control-panel" element={<Home />}>
                        <Route index element={<ControlPanel />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="current-order" element={<ModuleCurrentOrder />}>
                            <Route path="client" element={<ClientPage />} />
                            <Route path="product" element={<ProductSelectionForm />} />
                            <Route path="color" element={<ColorSelectionForm />} />
                            <Route path="details" element={<DetailsForm />} />
                            <Route path="size" element={<SizeSelectionForm />} />
                            <Route path="cart" element={<Cart />} />
                        </Route>
                    </Route>
                </Routes>
            </HashRouter>
        </Provider>
    )
}

export default App
