import { useState } from "react";
import Layout from "../front/Layout";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
import QrCodeScannerOutlined from "@mui/icons-material/QrCodeScannerOutlined";
import { toast } from "react-toastify";

const parseEntryPayload = (raw) => {
  const s = String(raw).trim();
  if (!s) return "";
  try {
    const j = JSON.parse(s);
    if (j && typeof j.c === "string") return j.c.trim().toUpperCase();
  } catch {
    /* ignore */
  }
  const pipe = s.split("|");
  if (pipe.length >= 2) return pipe[pipe.length - 1].trim().toUpperCase();
  return s.toUpperCase();
};

const AdminEntryScan = () => {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState(null);

  const verify = async () => {
    const entryCode = parseEntryPayload(raw);
    if (!entryCode) {
      toast.error("Saisissez un code ou le contenu du QR.");
      return;
    }
    setLoading(true);
    setLast(null);
    try {
      const res = await fetch("/api/orders/admin/verify-entry", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.errors?.[0]?.message || `Erreur ${res.status}`);
        setLoading(false);
        return;
      }
      setLast(data);
      if (data.ok) {
        toast.success("Entrée validée");
      } else if (data.reason === "already_used") {
        toast.warning("Billet déjà utilisé");
      } else if (data.reason === "not_paid") {
        toast.error("Commande non payée");
      } else {
        toast.error("Code introuvable");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4 }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <QrCodeScannerOutlined color="primary" />
                <Typography variant="h5" fontWeight={800}>
                  Scan entrée (admin)
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Collez le texte lu depuis le QR, ou saisissez le code d&apos;entrée affiché sur le billet.
              </Typography>
              <TextField
                label="QR ou code"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                multiline
                minRows={2}
                fullWidth
                placeholder='Ex. {"o":"...","c":"ABC123"} ou ABC123'
              />
              <Button variant="contained" onClick={verify} disabled={loading} size="large">
                {loading ? "Vérification…" : "Vérifier"}
              </Button>
              {last ? (
                <Alert severity={last.ok ? "success" : "warning"} variant="outlined">
                  {last.ok ? (
                    <Stack spacing={1}>
                      <Typography fontWeight={700}>Accès autorisé</Typography>
                      {last.title ? (
                        <Typography variant="body2">{last.title}</Typography>
                      ) : null}
                      {last.entryCode ? (
                        <Chip size="small" label={last.entryCode} variant="outlined" />
                      ) : null}
                    </Stack>
                  ) : (
                    <Stack spacing={0.5}>
                      <Typography fontWeight={700}>
                        {last.reason === "already_used"
                          ? "Déjà utilisé"
                          : last.reason === "not_paid"
                            ? "Non payé"
                            : "Refusé"}
                      </Typography>
                      {last.scannedAt ? (
                        <Typography variant="caption" color="text.secondary">
                          Premier scan : {new Date(last.scannedAt).toLocaleString()}
                        </Typography>
                      ) : null}
                    </Stack>
                  )}
                </Alert>
              ) : null}
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default AdminEntryScan;
