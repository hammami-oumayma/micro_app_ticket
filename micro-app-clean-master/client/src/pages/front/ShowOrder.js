import { useParams, Link as RouterLink } from "react-router-dom";
import useSingle from "../../hooks/useSingle";
import Layout from "./Layout";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyRounded from "@mui/icons-material/HourglassEmptyRounded";
import { toast } from "react-toastify";
import { alpha } from "@mui/material/styles";
import { QRCodeSVG } from "qrcode.react";

const displayUsd = (d) => {
  const p = d?.payableAmount ?? d?.ticket?.price;
  return Number(p).toFixed(2);
};

const ShowOrder = () => {
  const { orderId } = useParams();
  const { data, loading } = useSingle(`/api/orders/${orderId}`);

  const [timeLeft, setTimeLeft] = useState(null);

  const status = (data?.status || "").toLowerCase();
  const isComplete = ["complete", "completed"].includes(status);
  const isCancelled = ["cancelled", "canceled"].includes(status);

  useEffect(() => {
    const tick = () => {
      if (data?.expiresAt && !isComplete && !isCancelled) {
        const remainingMs = new Date(data.expiresAt) - new Date();
        setTimeLeft(Math.round(remainingMs / 1000));
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [data, isComplete, isCancelled]);

  const expired = useMemo(() => {
    if (isComplete || isCancelled) return false;
    return typeof timeLeft === "number" && timeLeft < 0;
  }, [timeLeft, isComplete, isCancelled]);

  const pay = async (paymentMode = "stripe") => {
    try {
      const payment = await fetch("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          title: data?.ticket?.title,
          price: data?.payableAmount ?? data?.ticket?.price,
          paymentMode,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!payment.ok) {
        const errBody = await payment.json().catch(() => ({}));
        const msg =
          errBody?.errors?.map((x) => x.message).join(" ") ||
          errBody?.message ||
          `Erreur ${payment.status}`;
        toast.error(msg);
        return;
      }

      const res = await payment.json();
      if (paymentMode === "manual") {
        toast.success("Paiement confirmé (mode test).");
        setTimeout(() => {
          window.location.reload();
        }, 700);
        return;
      }
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.log(error);
      toast.error("Erreur réseau");
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "calc(100vh - 64px)",
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          {loading ? (
            <Typography>Chargement…</Typography>
          ) : isComplete ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: (t) => `1px solid ${alpha(t.palette.divider, 0.15)}`,
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleOutline color="success" />
                  <Typography variant="h5" fontWeight={800}>
                    Paiement confirmé
                  </Typography>
                </Stack>
                <Typography color="text.secondary">
                  {data?.ticket?.title}
                </Typography>
                {data?.promoCode ? (
                  <Chip
                    size="small"
                    label={`Promo ${data.promoCode}${data?.discountPercent != null ? ` (−${data.discountPercent}%)` : ""}`}
                    color="secondary"
                    sx={{ alignSelf: "flex-start" }}
                  />
                ) : null}
                <Typography variant="body2" color="text.secondary">
                  {data?.ticket?.price != null &&
                  data?.payableAmount != null &&
                  Number(data.payableAmount) < Number(data.ticket.price) ? (
                    <>
                      Prix catalogue : <del>{Number(data.ticket.price).toFixed(2)} USD</del>
                      {" → "}
                      <strong>{displayUsd(data)} USD</strong>
                    </>
                  ) : (
                    <>
                      Montant : <strong>{displayUsd(data)} USD</strong>
                    </>
                  )}
                </Typography>
                {data?.entryCode ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                    <QRCodeSVG
                      value={JSON.stringify({ o: orderId, c: data.entryCode })}
                      size={200}
                      level="M"
                      includeMargin
                    />
                  </Box>
                ) : null}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: (t) => alpha(t.palette.success.main, 0.06),
                    borderStyle: "dashed",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Code d&apos;entrée (présentez ce code à l&apos;entrée)
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    letterSpacing={4}
                    sx={{ fontFamily: "monospace", mt: 0.5 }}
                  >
                    {data?.entryCode ||
                      (orderId && String(orderId).replace(/[^a-fA-F0-9]/g, "").slice(-12).toUpperCase()) ||
                      "—"}
                  </Typography>
                </Paper>
                <Button component={RouterLink} to="/mes-commandes" variant="contained">
                  Retour à mes commandes
                </Button>
              </Stack>
            </Paper>
          ) : isCancelled ? (
            <Alert severity="warning">
              Cette commande a été annulée.
            </Alert>
          ) : expired ? (
            <Alert severity="error">
              Délai dépassé : la réservation a expiré. Créez une nouvelle commande depuis la page du billet.
            </Alert>
          ) : (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <HourglassEmptyRounded color="warning" />
                  <Typography variant="h6" fontWeight={800}>
                    Finaliser le paiement
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={
                    typeof timeLeft === "number"
                      ? `${timeLeft}s pour payer`
                      : "…"
                  }
                  color="warning"
                  variant="outlined"
                />
                <Typography variant="subtitle1" fontWeight={700}>
                  {data?.ticket?.title}
                </Typography>
                <Typography color="text.secondary">
                  {data?.promoCode ? (
                    <Chip
                      size="small"
                      label={`Promo ${data.promoCode}`}
                      sx={{ mr: 1, verticalAlign: "middle" }}
                    />
                  ) : null}
                  Prix à payer : <strong>{displayUsd(data)} USD</strong>
                  {data?.ticket?.price != null &&
                  data?.payableAmount != null &&
                  Number(data.payableAmount) < Number(data.ticket.price) ? (
                    <Typography component="span" variant="body2" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Prix catalogue : <del>{Number(data.ticket.price).toFixed(2)} USD</del>
                    </Typography>
                  ) : null}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button variant="contained" color="success" onClick={() => pay("stripe")} fullWidth>
                    Payer par carte (Stripe)
                  </Button>
                  <Button variant="outlined" onClick={() => pay("manual")} fullWidth>
                    Paiement test instantané
                  </Button>
                </Stack>
                <Alert severity="info" variant="outlined">
                  Modes disponibles : <strong>Stripe</strong> (carte) et <strong>manuel</strong> (démo). Le mode{' '}
                  <strong>livraison</strong> est enregistré côté admin pour référence ; le paiement en ligne utilise Stripe ou le test manuel.
                </Alert>
              </Stack>
            </Paper>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default ShowOrder;
