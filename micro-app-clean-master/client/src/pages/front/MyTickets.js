import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Layout from "./Layout";
import useFetchData from "../../hooks/useFetchData";
import { alpha } from "@mui/material/styles";

const statusLabel = (t) => {
  const s = (t?.approvalStatus || "").toLowerCase();
  if (s === "approved") return { label: "Publié", color: "success" };
  if (s === "rejected") return { label: "Refusé", color: "error" };
  return { label: "En attente de modération", color: "warning" };
};

const MyTickets = () => {
  const { data, loading, error, refetch } = useFetchData("/api/tickets/mine");

  const rows = Array.isArray(data) ? data : [];

  return (
    <Layout>
      <Box
        sx={{
          py: 4,
          minHeight: "calc(100vh - 64px)",
          background: (t) =>
            `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.06)} 0%, ${t.palette.background.default} 28%)`,
        }}
      >
        <Container maxWidth="md">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700}>
                Espace vendeur
              </Typography>
              <Typography variant="h4" component="h1" fontWeight={800}>
                Mes billets
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Billets que vous avez créés : publication immédiate pour les admins, sinon validation par un modérateur.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => refetch()}>
              Actualiser
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Impossible de charger vos billets.
            </Alert>
          )}

          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} variant="rounded" height={120} />
              ))}
            </Stack>
          ) : rows.length === 0 ? (
            <Alert severity="info">
              Vous n&apos;avez pas encore créé de billet.{" "}
              <Button component={RouterLink} to="/create/ticket" size="small" sx={{ ml: 1 }}>
                Créer un billet
              </Button>
            </Alert>
          ) : (
            <Stack spacing={2}>
              {rows.map((t) => {
                const st = statusLabel(t);
                return (
                  <Paper
                    key={t.id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: (th) => `1px solid ${alpha(th.palette.divider, 0.12)}`,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} flexWrap="wrap" useFlexGap>
                        <Typography variant="h6" fontWeight={700}>
                          {t.title}
                        </Typography>
                        <Chip label={st.label} color={st.color} size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {t.category ? `${t.category} · ` : ""}
                        {t.venue ? `${t.venue} · ` : ""}
                        {Number(t.price).toFixed(2)} USD
                      </Typography>
                      {t.approvalStatus === "approved" ? (
                        <Button component={RouterLink} to={`/ticket/${t.id}`} size="small" variant="contained" sx={{ alignSelf: "flex-start" }}>
                          Voir la page publique
                        </Button>
                      ) : null}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default MyTickets;
