import { Box, Container, Link as MuiLink, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import GitHubIcon from "@mui/icons-material/GitHub";
import SchoolIcon from "@mui/icons-material/School";
import { alpha } from "@mui/material/styles";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: "auto",
        background: (t) =>
          `linear-gradient(180deg, ${t.palette.primary.dark} 0%, ${alpha(t.palette.primary.dark, 0.95)} 100%)`,
        color: "common.white",
        borderTop: (t) => `1px solid ${alpha(t.palette.common.white, 0.12)}`,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <SchoolIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700}>
                Projet de fin d&apos;études
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 420 }}>
              Plateforme événementielle événement-driven : réservation, expiration
              des commandes, paiement Stripe et architecture microservices.
            </Typography>
          </Box>
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            <MuiLink
              component={RouterLink}
              to="/about"
              color="inherit"
              underline="hover"
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              Documentation &amp; stack
            </MuiLink>
            <MuiLink
              href="https://github.com/gharbijihen/micro-app"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              underline="hover"
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <GitHubIcon sx={{ fontSize: 18 }} /> GitHub
            </MuiLink>
          </Stack>
        </Stack>
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 3, opacity: 0.65 }}
        >
          © {new Date().getFullYear()} EvtTickets — démo académique.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
