import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
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
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Layout from "../front/Layout";
import { toast } from "react-toastify";
import { alpha } from "@mui/material/styles";

const AdminUsers = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users/admin/list", { credentials: "include" });
      const text = await res.text();
      let body;
      try {
        body = text ? JSON.parse(text) : [];
      } catch {
        setError(`Réponse invalide (${res.status}). Reconnectez-vous en admin.`);
        setRows([]);
        return;
      }
      if (!res.ok) {
        const msg =
          body?.errors?.[0]?.message ||
          body?.message ||
          (typeof body === "string" ? body : null) ||
          `Erreur ${res.status}`;
        setError(msg);
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

  const remove = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    const res = await fetch(`/api/users/admin/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.errors?.[0]?.message || "Suppression impossible");
      return;
    }
    toast.success("Utilisateur supprimé");
    setRows((prev) => prev.filter((u) => u.id !== id));
  };

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
                Utilisateurs
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
            sx={{ border: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`, borderRadius: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Créé le</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3}>Chargement…</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3}>—</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>Aucun utilisateur en base.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => remove(u.id)} aria-label="Supprimer">
                          <DeleteOutline />
                        </IconButton>
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

export default AdminUsers;
