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

const modeLabel = (m) => {
  if (m === "stripe") return { label: "Carte (Stripe)", color: "primary" };
  if (m === "manual") return { label: "Test / manuel", color: "secondary" };
  if (m === "cash_on_delivery") return { label: "À la livraison", color: null };
  return { label: m || "—", color: null };
};

const AdminPayments = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/admin/list", { credentials: "include" });
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
                Paiements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Modes enregistrés : carte (Stripe), test instantané (manuel), paiement à la livraison (référence future).
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
                  <TableCell sx={{ fontWeight: 700 }}>ID paiement</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Commande</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Réf. Stripe / interne</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Mode
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Montant (USD)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Chargement…</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>Aucun paiement</TableCell>
                  </TableRow>
                ) : (
                  rows.map((p) => {
                    const md = modeLabel(p.paymentMode);
                    return (
                      <TableRow key={p.id} hover>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{p.id}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{p.orderId}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 11, wordBreak: "break-all" }}>
                          {p.stripeId}
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={md.label} color={md.color || undefined} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          {p.amount != null && !Number.isNaN(Number(p.amount)) ? Number(p.amount).toFixed(2) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </Layout>
  );
};

export default AdminPayments;
