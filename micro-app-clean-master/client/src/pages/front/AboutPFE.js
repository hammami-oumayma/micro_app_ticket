import {
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Layout from "./Layout";
import ArchitectureRounded from "@mui/icons-material/ArchitectureRounded";
import HubRounded from "@mui/icons-material/HubRounded";
import SecurityRounded from "@mui/icons-material/SecurityRounded";
import SpeedRounded from "@mui/icons-material/SpeedRounded";
import IntegrationInstructionsRounded from "@mui/icons-material/IntegrationInstructionsRounded";
import { alpha } from "@mui/material/styles";

const Section = ({ icon, title, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.5, md: 3 },
      mb: 2,
      border: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`,
      borderRadius: 2,
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Box sx={{ color: "primary.main" }}>{icon}</Box>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Paper>
);

const AboutPFE = () => {
  return (
    <Layout>
      <Box
        sx={{
          py: { xs: 3, md: 5 },
          minHeight: "calc(100vh - 64px)",
          background: (t) => t.palette.background.default,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="overline" color="primary" fontWeight={700}>
            Documentation projet
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 1 }}>
            EvtTickets — PFE
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
            Application de billetterie fondée sur une architecture microservices
            événementielle : isolation des domaines (auth, billets, commandes, paiements,
            expiration), messagerie asynchrone et persistance cloud.
          </Typography>

          <Section icon={<ArchitectureRounded />} title="Architecture">
            <Typography variant="body2" color="text.secondary" paragraph>
              Le client React consomme une gateway nginx qui route les appels REST vers les
              services appropriés. Les événements métiers transitent via RabbitMQ ; les files
              d&apos;expiration utilisent Redis et Bull pour libérer les billets non payés
              dans un délai paramétrable. Les billets exposent catégorie, lieu et date
              d&apos;événement ; un compte peut changer son mot de passe ; un administrateur
              (email configuré côté service orders) accède à des statistiques globales.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom fontWeight={700}>
              Services
            </Typography>
            <List dense>
              {[
                "Auth — JWT, cookies httpOnly, compte utilisateur",
                "Tickets — catalogue, réservation liée aux commandes",
                "Orders — orchestration, statuts (créée, annulée, complétée…)",
                "Payments — Stripe, événement de paiement confirmé",
                "Expiration — worker temps limité + publication événement fin de délai",
              ].map((t) => (
                <ListItem key={t} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>•</ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: "body2" }} primary={t} />
                </ListItem>
              ))}
            </List>
          </Section>

          <Section icon={<HubRounded />} title="Stack technique">
            <List dense>
              {[
                "Frontend : React 19, React Router, MUI, hooks personnalisés",
                "Backend : Node.js, TypeScript, Express, Mongoose",
                "Données : MongoDB Atlas",
                "Messaging : RabbitMQ (AMQP)",
                "Queues : Redis + Bull",
                "Paiement : Stripe (mode test)",
                "Conteneurs : Docker, Docker Compose, images Docker Hub (optionnel)",
              ].map((t) => (
                <ListItem key={t} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>•</ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: "body2" }} primary={t} />
                </ListItem>
              ))}
            </List>
          </Section>

          <Section icon={<SecurityRounded />} title="Sécurité & bonnes pratiques">
            <Typography variant="body2" color="text.secondary">
              Secrets hors dépôt (fichiers <code>.env</code>), TLS recommandé en production,
              politique d&apos;accès réseau sur Atlas, même clé JWT partagée de façon
              contrôlée entre services, cookies sécurisés en prod (Secure, SameSite).
            </Typography>
          </Section>

          <Section icon={<SpeedRounded />} title="Évolutivité">
            <Typography variant="body2" color="text.secondary">
              Chaque service peut être mis à l&apos;échelle indépendamment ; le modèle
              event-driven réduit le couplage synchrone. Kubernetes / Skaffold peut prendre
              le relais du Compose local pour un déploiement proche production.
            </Typography>
          </Section>

          <Section icon={<IntegrationInstructionsRounded />} title="Objectifs pédagogiques">
            <Typography variant="body2" color="text.secondary">
              Démontrer la conception DDD légère par service, la cohérence éventuelle,
              l&apos;integration de prestataires (Stripe), et la chaîne complète du build
              conteneurisé jusqu&apos;au déploiement démontrable devant un jury.
            </Typography>
          </Section>
        </Container>
      </Box>
    </Layout>
  );
};

export default AboutPFE;
