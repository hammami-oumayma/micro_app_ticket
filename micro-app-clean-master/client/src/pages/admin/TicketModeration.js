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
import { toast } from "react-toastify";

const TicketModeration = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tickets/admin/pending", {
        credentials: "include",
      });
      const body = await res.json().catch(() => []);
      if (!res.ok) {
        setError(body?.errors?.[0]?.message || "Erreur serveur");
        setTickets([]);
        return;
      }
      setTickets(Array.isArray(body) ? body : []);
    } catch {
      setError("Erreur réseau");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
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
    setTickets((prev) => prev.filter((t) => t.id !== id));
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
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Layout>
      <Box sx={{ py: 4, bgcolor: "background.default", minHeight: "calc(100vh - 64px)" }}>
        <Container maxWidth="md">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>
              Modération des billets
            </Typography>
            <Button variant="outlined" onClick={loadTickets} disabled={loading}>
              Actualiser
            </Button>
          </Stack>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Typography>Chargement...</Typography>
          ) : tickets.length === 0 ? (
            <Alert severity="info">Aucun billet en attente.</Alert>
          ) : (
            <Stack spacing={2}>
              {tickets.map((ticket) => (
                <Paper key={ticket.id} sx={{ p: 2.5 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="h6">{ticket.title}</Typography>
                    <Typography color="text.secondary">
                      Prix: {Number(ticket.price).toFixed(2)} USD
                    </Typography>
                    <Typography color="text.secondary">
                      Créé par: {ticket.userId}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => approveTicket(ticket.id)}
                      >
                        Accepter
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => deleteTicket(ticket.id)}
                      >
                        Supprimer
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default TicketModeration;
