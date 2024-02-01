const cors = require("cors");

module.exports = (app) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://frontend-sanbertask.netlify.app",
    "http://localhost:3000",
    "https://good-jade-betta-tam.cyclic.app",
  ];

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  };

  app.use(cors(corsOptions));
};
