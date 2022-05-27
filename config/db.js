const mongoose = require("mongoose");
//connection a la base de donnée avec MDP dans variable d'environnement .env
mongoose
  .connect(
    "mongodb+srv://" +
      process.env.DB_USER_PASS +
      "@cluster0.rngfe.mongodb.net/mern-projet",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("connected to MongoDB"))
  .catch((err) => console.log("failed to connect MongoDB ", err));
