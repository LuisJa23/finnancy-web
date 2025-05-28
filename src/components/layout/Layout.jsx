import CustomNavbar from "../navbar/CustomNavbar";
import Footer from "../footer/Footer";
import "./Layout.css";

function Layout({ children }) {
  return (
    <>
      <CustomNavbar className="navbar" />
      <div className="main-container">{children}</div>
      <Footer className="footer" />
    </>
  );
}

export default Layout;
