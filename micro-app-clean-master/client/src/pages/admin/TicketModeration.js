import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import Layout from "../front/Layout";
import { toast } from "react-toastify";
import { alpha } from "@mui/material/styles";

const statusChip = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "approved") return <Chip label="Publié" color="success" size="small" />;
  if (v === "rejected") return <Chip label="Refusé" color="error" size="small" />;
  return <Chip label="En attente" color="warning" size="small" />;
};

const TicketModeration = () => {
  const [tab, setTab] = useState(0);
  const [pending, setPending] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPending = async () => {
    const res = await fetch("/api/tickets/admin/pending", { credentials: "include" });
    const body = await res.json().catch(() => []);
    if (!res.ok) {
      setError(body?.errors?.[0]?.message || "Erreur serveur");
      setPending([]);
      return;
    }
    setPending(Array.isArray(body) ? body : []);
  };

  const loadAll = async () => {
    const res = await fetch("/api/tickets/admin/list", { credentials: "include" });
    const body = await res.json().catch(() => []);
    if (!res.ok) {
      setError(body?.errors?.[0]?.message || "Erreur serveur");
      setAllTickets([]);
      return;
    }
    setAllTickets(Array.isArray(body) ? body : []);
  };

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadPending(), loadAll()]);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chargement initial uniquement
  }, []);

  const approveTicket = async (id) => {
    const res = await fetch(`/api/tickets/admin/${id}/approve`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.errors?.[0]?.message || "Échec de validation");
      return;
    }
    toast.success("Billet validé");
    setPending((prev) => prev.filter((t) => t.id !== id));
    loadAll();
  };

  const deleteTicket = async (id) => {
    const res = await fetch(`/api/tickets/admin/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.errors?.[0]?.message || "Échec de suppression");
      return;
    }
    toast.success("Billet supprimé");
    setPending((prev) => prev.filter((t) => t.id !== id));
    loadAll();
  };

  return (
    <Layout>
      <Box sx={{ py: 4, bgcolor: "background.default", minHeight: "calc(100vh - 64px)" }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h4" fontWeight={700}>
              Gestion des billets
            </Typography>
            <Button variant="outlined" onClick={loadTickets} disabled={loading}>
              Actualiser
            </Button>
          </Stack>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="En attente de validation" />
            <Tab label="Tous les billets" />
          </Tabs>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          {tab === 0 ? (
            loading ? (
              <Typography>Chargement...</Typography>
            ) : pending.length === 0 ? (
              <Alert severity="info">Aucun billet en attente.</Alert>
            ) : (
              <Stack spacing={2}>
                {pending.map((ticket) => (
                  <Paper key={ticket.id} sx={{ p: 2.5 }}>
                    <Stack spacing={1.5}>
                      <Typography variant="h6">{ticket.title}</Typography>
                      <Typography color="text.secondary">
                        Prix: {Number(ticket.price).toFixed(2)} USD · vendeur: {ticket.userId}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" color="success" onClick={() => approveTicket(ticket.id)}>
                          Accepter
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => deleteTicket(ticket.id)}>
                          Supprimer
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`, borderRadius: 2, overflow: "auto" }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Titre</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Prix
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Statut
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Lieu / carte
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Vendeur
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5}>Chargement…</TableCell>
                    </TableRow>
                  ) : allTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>Aucun billet</TableCell>
                    </TableRow>
                  ) : (
                    allTickets.map((t) => (
                      <TableRow key={t.id} hover>
                        <TableCell>{t.title}</TableCell>
                        <TableCell align="right">{Number(t.price).toFixed(2)} USD</TableCell>
                        <TableCell>{statusChip(t.approvalStatus)}</TableCell>
                        <TableCell>
                          {t.venue || "—"}
                          {t.lat != null && t.lng != null ? ` · ${Number(t.lat).toFixed(4)}, ${Number(t.lng).toFixed(4)}` : ""}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{t.userId}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default TicketModeration;
