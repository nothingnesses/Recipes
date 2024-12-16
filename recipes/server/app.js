var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const pgp = require("pg-promise")();
require("dotenv").config();
const db = pgp(
	`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASS}@${process.env.POSTGRES_URL}`
);

const cors_options = {
	origin: [process.env.FRONTEND_URL],
};

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(cors_options));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.post("/api/add-recipe", function (req, res, next) {
	db.one(
		"INSERT INTO recipes(name, instructions, servings, preparation_time) VALUES($1, array_to_json($2), $3, $4) RETURNING id",
		[
			req.body.name,
			req.body.instructions,
			req.body.servings,
			req.body.preparation_time,
		]
	)
		.then((recipe_id) => {
			console.log("Entry into recipe succesful");
			req.body.ingredients.forEach((item, index) => {
				db.one(
					"INSERT INTO ingredients(name) VALUES($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
					[item.name]
				)
					.then((ingredient_id) => {
						console.log("Entry into ingredients succesful");
						db.none(
							"INSERT INTO ingredients_recipes(ingredient_id, recipe_id, value, unit) VALUES($1, $2, $3, $4)",
							[
								ingredient_id.id,
								recipe_id.id,
								item.quantity.value,
								item.quantity.unit,
							]
						)
							.then(() => {
								console.log("Entry into ingredients_recipes succesful");
							})
							.catch((error) => {
								console.error(
									`Error inserting into ingredients_recipes : ${error}`
								);
							});
					})
					.catch((error) => {
						console.error(`Error inserting into ingredients: ${error}`);
					});
			});
			res.send({
				data: recipe_id,
			});
		})
		.catch((error) => {
			console.error(`Error inserting into recipes: ${error}`);
			res.send({
				error,
			});
		});
});

module.exports = app;
