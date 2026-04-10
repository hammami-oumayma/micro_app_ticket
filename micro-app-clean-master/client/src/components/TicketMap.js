import { Box, Button, Typography } from "@mui/material";
import MapOutlined from "@mui/icons-material/MapOutlined";

/**
 * Carte OpenStreetMap si lat/lng fournis, sinon lien vers recherche OSM par lieu.
 */
const TicketMap = ({ lat, lng, venue }) => {
  const la = lat != null && lat !== "" ? Number(lat) : NaN;
  const lo = lng != null && lng !== "" ? Number(lng) : NaN;
  const hasCoords = !Number.isNaN(la) && !Number.isNaN(lo);

  if (hasCoords) {
    const pad = 0.02;
    const bbox = `${lo - pad},${la - pad},${lo + pad},${la + pad}`;
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
      bbox
    )}&layer=map&marker=${encodeURIComponent(`${la}%2C${lo}`)}`;
    return (
      <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden", border: 1, borderColor: "divider" }}>
        <iframe title="Carte du lieu" src={src} style={{ border: 0, width: "100%", height: 280, display: "block" }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", p: 1 }}>
          Carte OpenStreetMap · coordonnées : {la.toFixed(5)}, {lo.toFixed(5)}
        </Typography>
      </Box>
    );
  }

  if (venue && String(venue).trim()) {
    const q = encodeURIComponent(String(venue).trim());
    return (
      <Button
        component="a"
        href={`https://www.openstreetmap.org/search?query=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        startIcon={<MapOutlined />}
        sx={{ alignSelf: "flex-start" }}
      >
        Voir « {venue} » sur la carte
      </Button>
    );
  }

  return null;
};

export default TicketMap;
