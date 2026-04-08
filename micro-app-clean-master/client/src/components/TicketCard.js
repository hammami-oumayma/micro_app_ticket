import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import EventOutlined from "@mui/icons-material/EventOutlined";
import { Link as RouterLink } from "react-router-dom";
import { alpha } from "@mui/material/styles";

function formatEventDate(value) {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return null;
  }
}

export default function TicketCard({ ticket }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}`,
        background: (t) =>
          `linear-gradient(145deg, ${t.palette.background.paper} 0%, ${alpha(t.palette.primary.light, 0.06)} 100%)`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (t) => `0 12px 40px ${alpha(t.palette.primary.dark, 0.15)}`,
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/ticket/${ticket.id}`}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <StackedHeader ticket={ticket} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function StackedHeader({ ticket }) {
  const { title, price, category, venue, eventDate } = ticket;
  const when = formatEventDate(eventDate);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
            color: "primary.main",
            display: "flex",
          }}
        >
          <LocalActivityOutlined fontSize="small" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
            {category ? (
              <Chip label={category} size="small" color="primary" variant="outlined" />
            ) : null}
          </Stack>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
          {venue ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <PlaceOutlined sx={{ fontSize: 14 }} /> {venue}
            </Typography>
          ) : null}
          {when ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.25, display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <EventOutlined sx={{ fontSize: 14 }} /> {when}
            </Typography>
          ) : null}
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Chip
          label={`${Number(price).toFixed(2)} USD`}
          color="secondary"
          size="small"
          sx={{ fontWeight: 700 }}
        />
        <Typography variant="caption" color="primary" fontWeight={600}>
          Voir détails →
        </Typography>
      </Box>
    </>
  );
}
