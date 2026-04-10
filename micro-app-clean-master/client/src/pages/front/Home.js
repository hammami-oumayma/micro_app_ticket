import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import SortRounded from "@mui/icons-material/SortRounded";
import TicketCard from "../../components/TicketCard";
import Layout from "./Layout";
import useFetchData from "../../hooks/useFetchData";
import { alpha } from "@mui/material/styles";

const Home = () => {
  const [query, setQuery] = useState("");
  const [priceSort, setPriceSort] = useState("none");
  const [category, setCategory] = useState("all");

  const ticketsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("category", category);
    if (priceSort === "asc") params.set("sort", "price_asc");
    else if (priceSort === "desc") params.set("sort", "price_desc");
    const qs = params.toString();
    return `/api/tickets${qs ? `?${qs}` : ""}`;
  }, [query, category, priceSort]);

  const { data, loading, error, refetch } = useFetchData(ticketsUrl);
  const { data: categoryRows } = useFetchData("/api/tickets/categories");

  const categories = useMemo(() => {
    return Array.isArray(categoryRows) ? categoryRows : [];
  }, [categoryRows]);

  const filtered = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          background: (t) =>
            `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.08)} 0%, ${t.palette.background.default} 32%, ${t.palette.background.default} 100%)`,
        }}
      >
        <Box
          sx={{
            py: { xs: 4, md: 6 },
            px: { xs: 2, sm: 0 },
            color: "text.primary",
          }}
        >
          <Container maxWidth="lg">
            <Stack spacing={1} sx={{ mb: 4, maxWidth: 720 }}>
              <Typography
                variant="overline"
                sx={{ letterSpacing: ".2em", color: "primary.main", fontWeight: 700 }}
              >
                Plateforme événementielle
              </Typography>
              <Typography variant="h3" component="h1" color="primary.dark">
                Réservez vos billets en quelques clics
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Découvrez les événements disponibles : commande sécurisée, expiration
                automatique de la réservation si non payée, et paiement intégré.
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              sx={{ mb: 3 }}
            >
              <TextField
                fullWidth
                placeholder="Rechercher par titre..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  maxWidth: { md: 400 },
                  bgcolor: "background.paper",
                }}
              />
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <SortRounded fontSize="small" color="action" />
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={priceSort}
                  onChange={(_, v) => v != null && setPriceSort(v)}
                  color="primary"
                >
                  <ToggleButton value="none">Prix par défaut</ToggleButton>
                  <ToggleButton value="asc">Prix ↑</ToggleButton>
                  <ToggleButton value="desc">Prix ↓</ToggleButton>
                </ToggleButtonGroup>
                <Button variant="outlined" size="small" onClick={() => refetch()}>
                  Actualiser
                </Button>
              </Stack>
            </Stack>

            {categories.length > 0 && (
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Catégorie :
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={category}
                  onChange={(_, v) => v != null && setCategory(v)}
                  color="primary"
                >
                  <ToggleButton value="all">Toutes</ToggleButton>
                  {categories.map((c) => (
                    <ToggleButton key={c} value={c}>
                      {c}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Impossible de charger les billets. Vérifiez la connexion ou connectez-vous
                si la liste est réservée aux utilisateurs authentifiés.
              </Alert>
            )}

            {loading ? (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((k) => (
                  <Skeleton key={k} variant="rounded" height={160} sx={{ borderRadius: 2 }} />
                ))}
              </Box>
            ) : filtered.length === 0 ? (
              <Alert severity="info">
                Aucun billet ne correspond à votre recherche pour le moment.
              </Alert>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                }}
              >
                {filtered.map((ticket) => (
                  <TicketCard ticket={ticket} key={ticket.id} />
                ))}
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </Layout>
  );
};

export default Home;
