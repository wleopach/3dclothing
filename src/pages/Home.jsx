import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from "valtio";
import {
    CustomButton,
    Cart,
    ClientInfoForm,
    ProductSelectionForm,
    ColorSelectionForm,
    SizeSelectionForm,
    LoginForm
} from '../components';
import state from "../store";
import {
    headContainerAnimation,
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion';


const Home = () => {
    const snap = useSnapshot(state);
    console.log(snap);
    return (
        <AnimatePresence>
            {snap.isUnLogged ? (
                <LoginForm />
            ) : snap.showForm ? (
                <ClientInfoForm
                />
            ) : snap.showProductForm ? (
                <ProductSelectionForm/>



            )   : snap.pickColor  ? (

                    <ColorSelectionForm />



            )
                   : snap.pickSize ? (
                    <SizeSelectionForm />

            )
                    :  snap.showCart?(
                    <Cart />
            )

                : snap.intro &&
                (null
                // <motion.div key="intro" className="home" {...slideAnimation('left')}>
                //     <motion.header {...slideAnimation('down')}>
                //         <img src='./threejs.png' alt="logo" className="w-8 h-8 object-contain" />
                //     </motion.header>
                //
                //     <motion.div className="home-content" {...headContainerAnimation}>
                //         <motion.div {...headTextAnimation}>
                //             <h1 className="head-text">
                //                 LET'S <br className="xl:block hidden" /> DO IT.
                //             </h1>
                //         </motion.div>
                //         <motion.div {...headContentAnimation} className="flex flex-col gap-5">
                //             <p className="max-w-md font-normal text-gray-600 text-base">
                //                 Create your unique and exclusive shirt with our brand-new 3D customization
                //                 tool. <strong> Unleash your imagination </strong> {" "} and define your own style.
                //             </p>
                //             <CustomButton
                //                 type="filled"
                //                 title="Register Order"
                //                 handleClick={() => {
                //                     state.showForm = true;
                //                     state.color = '#EFBD48';
                //                 }}
                //                 customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                //             />
                //             <CustomButton
                //                 type="filled"
                //                 title="Customize It"
                //                 handleClick={() => state.intro = false}
                //                 customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                //             />
                //         </motion.div>
                //     </motion.div>
                // </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Home;
