import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Layout from "./Layout";
import { toast } from "react-toastify";
import { getStoredUser } from "../../utils/session";

const Profile = () => {
  const user = getStoredUser();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.errors?.map((x) => x.message).join(" ") ||
          data?.message ||
          "Échec de la mise à jour";
        toast.error(msg);
        return;
      }
      toast.success("Mot de passe mis à jour.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ py: 4, bgcolor: "background.default", minHeight: "calc(100vh - 64px)" }}>
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Mon profil
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Compte : <strong>{user?.email || "—"}</strong>
          </Typography>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Changer le mot de passe
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Minimum 6 caractères pour le nouveau mot de passe.
            </Alert>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  name="currentPassword"
                  label="Mot de passe actuel"
                  type="password"
                  fullWidth
                  value={form.currentPassword}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="newPassword"
                  label="Nouveau mot de passe"
                  type="password"
                  fullWidth
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                />
                <TextField
                  name="confirmPassword"
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  fullWidth
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <Button type="submit" variant="contained" disabled={loading} size="large">
                  {loading ? "En cours…" : "Enregistrer"}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default Profile;
