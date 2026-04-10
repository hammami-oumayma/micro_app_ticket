import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import Layout from "./Layout";
import { useNavigate, useParams } from "react-router-dom";
import useSingle from "../../hooks/useSingle";
import { toast } from "react-toastify";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import EventOutlined from "@mui/icons-material/EventOutlined";
import TicketMap from "../../components/TicketMap";

const SingleTicket = () => {
  const { id } = useParams();
  const { data, loading } = useSingle(`/api/tickets/${id}`);
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");

  const createOrder = async () => {
    try {
      const body = { ticketId: id };
      const p = promoCode.trim();
      if (p) body.promoCode = p;
      const order = await fetch("/api/orders", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: JSON.stringify(body),
      });
      const res = await order.json();
      if (res && res?.errors) {
        const errorResponse = res?.errors?.map((err) => err.message)?.join(" ");
        return toast.error(errorResponse);
      }
      toast.success("Commande créée");

      setTimeout(() => {
        navigate(`/orders/${res.id}`);
      }, 800);
    } catch (error) {
      console.log(error);
    }
  };

  let eventLabel = null;
  if (data?.eventDate) {
    const d = new Date(data.eventDate);
    if (!Number.isNaN(d.getTime())) {
      eventLabel = d.toLocaleString(undefined, {
        dateStyle: "full",
        timeStyle: "short",
      });
    }
  }

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
            <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
          ) : (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Stack spacing={2}>
                {data?.category ? (
                  <Chip label={data.category} color="primary" size="small" sx={{ alignSelf: "flex-start" }} />
                ) : null}
                <Typography variant="h4" component="h1" fontWeight={800}>
                  {data.title}
                </Typography>
                {data?.venue ? (
                  <Typography variant="body1" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PlaceOutlined fontSize="small" /> {data.venue}
                  </Typography>
                ) : null}
                <TicketMap lat={data?.lat} lng={data?.lng} venue={data?.venue} />
                {eventLabel ? (
                  <Typography variant="body1" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventOutlined fontSize="small" /> {eventLabel}
                  </Typography>
                ) : null}
                <Typography variant="h5" color="secondary.main" fontWeight={700}>
                  {Number(data.price).toFixed(2)} USD
                </Typography>
                <TextField
                  label="Code promo (optionnel)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="ex. DEMO20"
                  size="small"
                  fullWidth
                  inputProps={{ maxLength: 32 }}
                />
                <Button variant="contained" size="large" onClick={createOrder}>
                  Acheter
                </Button>
              </Stack>
            </Paper>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default SingleTicket;
