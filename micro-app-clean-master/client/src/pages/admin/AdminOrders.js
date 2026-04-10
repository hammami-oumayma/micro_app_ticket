import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Layout from "../front/Layout";
import { alpha } from "@mui/material/styles";

const statusChip = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "complete" || s === "completed") return <Chip label={status} color="success" size="small" />;
  if (s === "cancelled" || s === "canceled") return <Chip label={status} color="error" size="small" />;
  return <Chip label={status} color="warning" size="small" />;
};

const AdminOrders = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/admin/list", { credentials: "include" });
      const body = await res.json().catch(() => []);
      if (!res.ok) {
        setError(body?.errors?.[0]?.message || "Accès refusé ou erreur serveur");
        setRows([]);
        return;
      }
      setRows(Array.isArray(body) ? body : []);
    } catch {
      setError("Erreur réseau");
      setRows([]);
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
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700}>
                Administration
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                Commandes
              </Typography>
            </Box>
            <Button variant="outlined" onClick={load} disabled={loading}>
              Actualiser
            </Button>
          </Stack>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`, borderRadius: 2, overflow: "auto" }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Utilisateur</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Événement</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Prix
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Statut
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Code entrée
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Chargement…</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>Aucune commande</TableCell>
                  </TableRow>
                ) : (
                  rows.map((o) => (
                    <TableRow key={o.id} hover>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{o.id}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{o.userId}</TableCell>
                      <TableCell>{o.ticket?.title || "—"}</TableCell>
                      <TableCell align="right">{o.ticket?.price != null ? Number(o.ticket.price).toFixed(2) : "—"}</TableCell>
                      <TableCell align="right">{statusChip(o.status)}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: "monospace", fontSize: 12 }}>
                        {o.entryCode || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </Layout>
  );
};

export default AdminOrders;
