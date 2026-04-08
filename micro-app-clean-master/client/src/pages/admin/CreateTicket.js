import { Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import Layout from "../front/Layout";
import { useState } from "react";
import { toast } from "react-toastify";

const CreateTicket = () => {
  const [ticket, setTicket] = useState({
    title: "",
    price: "",
    category: "Général",
    venue: "",
    eventDate: "",
  });
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setError(false);
    setTicket((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTicket = async (e) => {
    e.preventDefault();

    try {
      if (!ticket.title || ticket.price === "") {
        setError(true);
        return false;
      }
      const payload = {
        title: ticket.title.trim(),
        price: Number(ticket.price),
        category: ticket.category?.trim() || "Général",
        venue: ticket.venue?.trim() || undefined,
      };
      if (ticket.eventDate) {
        const d = new Date(ticket.eventDate);
        if (!Number.isNaN(d.getTime())) {
          payload.eventDate = d.toISOString();
        }
      }
      const options = {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      };
      const value = await fetch("/api/tickets", options);

      const res = await value.json();
      if (res && res?.errors) {
        const errorResponse = res?.errors?.map((err) => err.message)?.join(" ");
        return toast.error(errorResponse);
      }

      setTicket({
        title: "",
        price: "",
        category: "Général",
        venue: "",
        eventDate: "",
      });

      toast.success("Billet créé !");
    } catch (err) {
      console.log("Error", err);
    }
  };

  return (
    <Layout>
      <Box sx={{ py: 4, bgcolor: "background.default", minHeight: "calc(100vh - 64px)" }}>
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Créer un billet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Titre, prix (0 = gratuit), catégorie, lieu et date d&apos;événement optionnels.
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {error ? (
              <Typography color="error" sx={{ mb: 2 }}>
                Titre et prix sont requis.
              </Typography>
            ) : null}
            <Box component="form" noValidate onSubmit={handleTicket}>
              <Stack spacing={2}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  name="title"
                  label={"Titre de l'événement"}
                  value={ticket.title}
                  onChange={handleChange}
                />
                <TextField
                  required
                  fullWidth
                  id="price"
                  name="price"
                  label="Prix (USD)"
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  value={ticket.price}
                  onChange={handleChange}
                />
                <TextField
                  select
                  fullWidth
                  name="category"
                  label="Catégorie"
                  value={ticket.category}
                  onChange={handleChange}
                >
                  {["Général", "Concert", "Sport", "Conférence", "Théâtre", "Autre"].map(
                    (c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    )
                  )}
                </TextField>
                <TextField
                  fullWidth
                  name="venue"
                  label="Lieu"
                  placeholder="Ex. Palais des congrès, Tunis"
                  value={ticket.venue}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  name="eventDate"
                  label={"Date et heure de l'événement"}
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={ticket.eventDate}
                  onChange={handleChange}
                />
                <Button type="submit" variant="contained" size="large">
                  Publier le billet
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default CreateTicket;
