const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { nodeEnv } = require("./config/env");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

if (nodeEnv !== "development") app.use(morgan("dev"));

if (nodeEnv !== "test") {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        success: false,
        message:
          "Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos",
      },
    }),
  );
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando correctamente",
    env: nodeEnv,
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
