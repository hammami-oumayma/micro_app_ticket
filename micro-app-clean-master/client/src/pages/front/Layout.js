import { Box } from "@mui/material";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Box sx={{ flex: 1 }}>{children}</Box>
        <Footer />
      </Box>
    </>
  );
};

export default Layout;
