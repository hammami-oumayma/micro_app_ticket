import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Layout from "../front/Layout";

const AdminStats = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/admin/stats", { credentials: "include" });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        setError(
          "Accès refusé. Définissez ADMIN_EMAIL dans orders/.env (même email que votre compte) et redémarrez les conteneurs."
        );
        setData(null);
        return;
      }
      if (!res.ok) {
        setError(body?.message || "Erreur serveur");
        setData(null);
        return;
      }
      setData(body);
    } catch (e) {
      console.error(e);
      setError("Erreur réseau");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout>
      <Box sx={{ py: 4, bgcolor: "background.default", minHeight: "calc(100vh - 64px)" }}>
        <Container maxWidth="md">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>
              Statistiques admin
            </Typography>
            <Button variant="outlined" onClick={load} disabled={loading}>
              Actualiser
            </Button>
          </Stack>

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && !data && !error && <Typography>Chargement…</Typography>}

          {data && (
            <Stack spacing={2}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Commandes totales
                </Typography>
                <Typography variant="h3">{data.totalOrders}</Typography>
              </Paper>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Chiffre (commandes complétées)
                </Typography>
                <Typography variant="h3">
                  {Number(data.revenue || 0).toFixed(2)} USD
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.completedOrderCount} commande(s) payée(s)
                </Typography>
              </Paper>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Répartition par statut
                </Typography>
                <Stack spacing={1}>
                  {(data.byStatus || []).map((row) => (
                    <Typography key={row.status}>
                      <strong>{row.status}</strong> : {row.count}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default AdminStats;
