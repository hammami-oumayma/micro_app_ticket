import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { alpha, useTheme } from "@mui/material/styles";

const NavLink = ({ to, children, onClick }) => (
  <Button
    component={RouterLink}
    to={to}
    onClick={onClick}
    sx={{ color: "inherit", fontWeight: 500 }}
  >
    {children}
  </Button>
);

const Header = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const authenticated = !!user;

  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const logOutMethod = async () => {
    try {
      await fetch("/api/users/signout", { method: "POST" });
      logout();
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const mobileItems = authenticated
    ? user?.isAdmin
      ? [
          { label: "Accueil", to: "/" },
          { label: "Modération billets", to: "/admin/tickets" },
          { label: "Stats admin", to: "/admin/stats" },
          { label: "Profil", to: "/profile" },
          { label: "Déconnexion", action: "logout" },
        ]
      : [
          { label: "Accueil", to: "/" },
          { label: "Mes commandes", to: "/admin/orders" },
          { label: "Vendre un billet", to: "/create/ticket" },
          { label: "Profil", to: "/profile" },
          { label: "Déconnexion", action: "logout" },
        ]
    : [
        { label: "Accueil", to: "/" },
        { label: "Connexion", to: "/sign-in" },
        { label: "Inscription", to: "/sign-up" },
      ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${alpha(theme.palette.secondary.main, 0.85)} 160%)`,
        borderBottom: `1px solid ${alpha("#fff", 0.12)}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 0.5 }}>
          <EventAvailableRounded
            sx={{ display: { xs: "none", md: "flex" }, mr: 1, fontSize: 32 }}
          />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 3,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              letterSpacing: ".04em",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            EvtTickets
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
            >
              {mobileItems.map((item) =>
                item.action === "logout" ? (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      handleCloseNavMenu();
                      logOutMethod();
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ) : (
                  <MenuItem
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    onClick={handleCloseNavMenu}
                  >
                    {item.label}
                  </MenuItem>
                )
              )}
            </Menu>
          </Box>

          <EventAvailableRounded
            sx={{ display: { xs: "flex", md: "none" }, mr: 1, flexGrow: 0 }}
          />
          <Typography
            variant="subtitle1"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            EvtTickets
          </Typography>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              gap: 0.5,
              alignItems: "center",
            }}
          >
            <NavLink to="/">Accueil</NavLink>
            {!authenticated ? (
              <>
                <NavLink to="/sign-in">Connexion</NavLink>
                <NavLink to="/sign-up">Inscription</NavLink>
              </>
            ) : (
              user?.isAdmin ? (
                <>
                  <NavLink to="/admin/tickets">Modération billets</NavLink>
                  <NavLink to="/admin/stats">Stats admin</NavLink>
                  <NavLink to="/profile">Profil</NavLink>
                  <Button
                    onClick={logOutMethod}
                    sx={{ color: "inherit", fontWeight: 500 }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/admin/orders">Mes commandes</NavLink>
                  <NavLink to="/create/ticket">Vendre un billet</NavLink>
                  <NavLink to="/profile">Profil</NavLink>
                  <Button
                    onClick={logOutMethod}
                    sx={{ color: "inherit", fontWeight: 500 }}
                  >
                    Déconnexion
                  </Button>
                </>
              )
            )}
          </Box>

          <Tooltip
            title={
              user?.email
                ? `Connecté : ${user.email}`
                : "Profil"
            }
          >
            <IconButton sx={{ p: 0, ml: 1 }} onClick={() => navigate(authenticated ? "/profile" : "/sign-in")}>
              <Avatar
                alt="Profil"
                src="/static/images/avatar/2.jpg"
                sx={{
                  width: 40,
                  height: 40,
                  border: `2px solid ${alpha("#fff", 0.35)}`,
                }}
              />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
