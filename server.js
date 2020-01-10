require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const MOVIEDEX = require("./moviedex.json");

const app = express();

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
	// Auth token from the server
	const apiToken = process.env.API_TOKEN;

	// getting the token from the "Authorization header"
	const authToken = req.get("Authorization");

	// Authorization
	if (!authToken || authToken.split(" ")[1] !== apiToken) {
		return res.status(401).json({ error: "Unauthorized request" });
	}

	// move to next middleware
	next();
});

app.get("/", (req, res) => {
	res.status(200).send("Express app working!");
});

function handleGetMovie(req, res) {
	let response = MOVIEDEX;
	const { genre, country, avg_vote } = req.query;

	// if (!genre || !country || !avg_vote) {
	// 	return res
	// 		.status(400)
	// 		.json({ error: { message: `Please provide a query for either genre, country or avg_vote` } });
	// }

	if (genre) {
		response = response.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()));
	}

	if (country) {
		response = response.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()));
	}

	if (avg_vote) {
		response = response.filter(movie => Number(movie.avg_vote) >= Number(avg_vote));
	}

	res.json(response);
}

app.get("/movie", handleGetMovie);

app.use((error, req, res, next) => {
	let response;
	if (process.env.NODE_ENV === "production") {
		response = { error: { message: "server error" } };
	} else {
		response = { error };
	}
	res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
