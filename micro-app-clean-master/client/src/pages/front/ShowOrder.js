import { useParams } from "react-router-dom";
import useSingle from "../../hooks/useSingle";
import Layout from "./Layout";
import { Box, Button, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import { toast } from "react-toastify";

const ShowOrder = () => {
  const { orderId } = useParams();
  const { data, loading } = useSingle(`/api/orders/${orderId}`);
  //console.log("single order", data);

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timefct = () => {
      if (data && data?.expiresAt) {
        const remainingTime = new Date(data?.expiresAt) - new Date();
        setTimeLeft(Math.round(remainingTime / 1000));
      }
    };
    //invoke to count time immedialtely
    timefct();
    const timer = setInterval(timefct, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [data]);

  if (timeLeft < 0) {
    return (
      <>
        <Layout>
          <Box
            sx={{
              bgcolor: "oklch(0.27642 0.055827 233.809)",
              minHeight: "calc(100vh - 140px)",
            }}
          >
            <Container>
              <Box sx={{ pt: 4, pb: 3 }}>
                {timeLeft < 0 ? (
                  <>
                    <h2 style={{ color: "white" }}>Order expired!</h2>
                  </>
                ) : (
                  ""
                )}
              </Box>
            </Container>
          </Box>
        </Layout>
      </>
    );
  }

  const pay = async (paymentMode = "stripe") => {
    try {
      const payment = await fetch("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          title: data?.ticket?.title,
          price: data?.ticket?.price,
          paymentMode,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!payment.ok) {
        throw new Error(`payment status: ${payment.status}`);
      }

      // eslint-disable-next-line
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

      console.log("payment", res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Layout>
        <Box
          sx={{
            bgcolor: "oklch(0.27642 0.055827 233.809)",
            minHeight: "calc(100vh - 140px)",
          }}
        >
          <Container>
            <Box sx={{ pt: 4, pb: 3 }}>
              {loading ? (
                <>
                  <h2 style={{ color: "white" }}>LOADING...</h2>
                </>
              ) : (
                <>
                  <Box sx={{ maxWidth: "620px" }}>
                    <Alert
                      icon={<CheckIcon fontSize="inherit" />}
                      severity="success"
                    >
                      {timeLeft}s remaining to complete the order
                    </Alert>
                  </Box>
                  <Box
                    sx={{
                      maxWidth: "600px",
                      bgcolor: "#031d2a",
                      border: "1px solid oklch(0.382774 0.071686 233.169)",
                      p: 2,
                      mt: 2,
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ color: "#fafafa" }}
                    >
                      Title: {data?.ticket?.title}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      sx={{ color: "#fafafa" }}
                    >
                      Price: {data?.ticket?.price}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        onClick={() => pay("stripe")}
                        sx={{ bgcolor: "green", color: "white" }}
                      >
                        Payer par carte
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => pay("manual")}
                        sx={{ color: "#fafafa", borderColor: "#fafafa" }}
                      >
                        Paiement test instantané
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Container>
        </Box>
      </Layout>
    </>
  );
};

export default ShowOrder;
