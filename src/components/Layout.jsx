import { Outlet } from "react-router-dom";
 import { useSelector } from "react-redux";
 import Footer from "./Footer";
import Navbar from "./Navbar";

 
const Layout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};


export default Layout
 
