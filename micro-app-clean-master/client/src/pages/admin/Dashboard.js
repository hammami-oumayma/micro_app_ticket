import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Layout from "../front/Layout";
import useFetchData from "../../hooks/useFetchData";
import {
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyRounded from "@mui/icons-material/HourglassEmptyRounded";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import { Link as RouterLink } from "react-router-dom";
import { alpha } from "@mui/material/styles";

const statusChip = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "complete" || s === "completed") {
    return (
      <Chip icon={<CheckCircleOutline />} label={status} color="success" size="small" />
    );
  }
  if (s === "cancelled" || s === "canceled") {
    return <Chip icon={<CancelOutlined />} label={status} color="error" size="small" />;
  }
  return (
    <Chip icon={<HourglassEmptyRounded />} label={status} color="warning" size="small" />
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      border: (t) => `1px solid ${alpha(t.palette.divider, 0.15)}`,
      borderRadius: 2,
      height: "100%",
      background: (t) =>
        `linear-gradient(135deg, ${alpha(color || t.palette.primary.main, 0.08)} 0%, ${t.palette.background.paper} 100%)`,
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ color: color || "primary.main", opacity: 0.9 }}>{icon}</Box>
    </Stack>
  </Paper>
);

const Dashboard = () => {
  const { data, loading, error, refetch } = useFetchData("/api/orders");
  const [filter, setFilter] = React.useState("");

  const rows = React.useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (o) =>
        (o?.ticket?.title || "").toLowerCase().includes(q) ||
        (o.id || "").toLowerCase().includes(q)
    );
  }, [data, filter]);

  const stats = React.useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const total = list.length;
    const completed = list.filter((o) =>
      ["complete", "completed"].includes((o?.status || "").toLowerCase())
    ).length;
    const cancelled = list.filter((o) =>
      ["cancelled", "canceled"].includes((o?.status || "").toLowerCase())
    ).length;
    const pending = total - completed - cancelled;
    return { total, completed, cancelled, pending: Math.max(0, pending) };
  }, [data]);

  return (
    <Layout>
      <Box
        sx={{
          py: 4,
          background: (t) =>
            `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.06)} 0%, ${t.palette.background.default} 24%)`,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 3, gap: 2 }}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700}>
                Espace client
              </Typography>
              <Typography variant="h4" component="h1" gutterBottom={false}>
                Mes commandes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suivi des statuts, accès rapide au paiement et aux détails.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => refetch()}>
              Actualiser
            </Button>
          </Stack>

          {error && (
            <Paper sx={{ p: 2, mb: 2, borderColor: "error.main", border: 1 }}>
              <Typography color="error">Erreur lors du chargement des commandes.</Typography>
            </Paper>
          )}

          {loading ? (
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rounded" height={100} sx={{ flex: 1 }} />
                ))}
              </Stack>
              <Skeleton variant="rounded" height={320} />
            </Stack>
          ) : (
            <>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                  mb: 3,
                }}
              >
                <StatCard
                  title="Total commandes"
                  value={stats.total}
                  icon={<ReceiptLongRounded fontSize="large" />}
                  color="#1565c0"
                />
                <StatCard
                  title="Complétées"
                  value={stats.completed}
                  icon={<CheckCircleOutline fontSize="large" />}
                  color="#2e7d32"
                />
                <StatCard
                  title="En attente"
                  value={stats.pending}
                  icon={<HourglassEmptyRounded fontSize="large" />}
                  color="#ed6c02"
                />
                <StatCard
                  title="Annulées"
                  value={stats.cancelled}
                  icon={<CancelOutlined fontSize="large" />}
                  color="#d32f2f"
                />
              </Box>

              <TextField
                fullWidth
                placeholder="Filtrer par titre du billet ou ID commande..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ mb: 2, maxWidth: 480, bgcolor: "background.paper" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID commande</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Événement
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Prix (USD)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Statut
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows?.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell component="th" scope="row" sx={{ fontFamily: "monospace", fontSize: 13 }}>
                          {order.id}
                        </TableCell>
                        <TableCell align="right">{order?.ticket?.title}</TableCell>
                        <TableCell align="right">{order?.ticket?.price}</TableCell>
                        <TableCell align="right">{statusChip(order?.status)}</TableCell>
                        <TableCell align="right">
                          <Button
                            component={RouterLink}
                            to={`/orders/${order.id}`}
                            size="small"
                            variant="contained"
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default Dashboard;
