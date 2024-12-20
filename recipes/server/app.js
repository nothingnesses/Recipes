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

app.post("/api/add-recipe", async function (req, res, next) {
	try {
		const recipe_id = await db.one(
			"INSERT INTO recipes(name, instructions, servings, preparation_time) VALUES($1, array_to_json($2), $3, $4) RETURNING id",
			[
				req.body.name,
				req.body.instructions,
				req.body.servings,
				req.body.preparation_time,
			]
		);
		console.log("Entry into recipes succesful");
		req.body.ingredients.forEach(async (item, index) => {
			try {
				const ingredient_id = await db.one(
					"INSERT INTO ingredients(name) VALUES($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id",
					[item.name]
				);
				console.log("Entry into ingredients succesful");
				try {
					await db.none(
						"INSERT INTO ingredients_recipes(ingredient_id, recipe_id, value, unit) VALUES($1, $2, $3, $4)",
						[
							ingredient_id.id,
							recipe_id.id,
							item.quantity.value,
							item.quantity.unit,
						]
					);
					console.log("Entry into ingredients_recipes succesful");
				} catch (error) {
					console.error(`Error inserting into ingredients_recipes : ${error}`);
				}
			} catch (error) {
				console.error(`Error inserting into ingredients: ${error}`);
			}
		});
		res.send({
			data: recipe_id,
		});
	} catch (error) {
		console.error(`Error inserting into recipes: ${error}`);
		res.send({
			error,
		});
	}
});

app.delete("/api/delete-recipe/:id", function (req, res, next) {
	try {
		await;
		db.none("DELETE FROM recipes WHERE id = $1", [req.params.id]);
		console.log(`Succesfully deleted ${req.params.id} from recipes`);
		res.send({
			data: req.params.id,
		});
	} catch (error) {
		console.error(`Error deleting from recipes: ${error}`);
		res.send({
			error,
		});
	}
});

app.post("/api/find-recipes", async function (req, res, next) {
	try {
		const recipes = await db.any(
			`
			WITH provided_ingredients AS (
				SELECT id
				FROM ingredients
				WHERE name IN ($1:csv)
			),
			valid_recipes AS (
				SELECT r.id AS recipe_id
				FROM recipes r
				JOIN ingredients_recipes ir ON ir.recipe_id = r.id
				WHERE ir.ingredient_id IN (SELECT id FROM provided_ingredients)
				GROUP BY r.id
				HAVING COUNT(DISTINCT ir.ingredient_id) = (SELECT COUNT(*) FROM ingredients_recipes ir2 WHERE ir2.recipe_id = r.id)
			)
			SELECT *
			FROM recipes r
			JOIN valid_recipes vr ON vr.recipe_id = r.id
			WHERE (r.name LIKE '%' || $2 || '%' OR $2 IS NULL);
			`,
			[req.body.ingredients, req.body.name ?? ""]
		);
		console.log("Query for recipes successful");

		const recipeDetails = await Promise.all(
			recipes.map(async (item) => {
				try {
					const ingredients = await db.any(
						`
					SELECT
						i.name AS ingredient_name,
						ir.value AS quantity,
						ir.unit
					FROM
						ingredients_recipes ir
					JOIN
						ingredients i ON ir.ingredient_id = i.id
					WHERE
						ir.recipe_id = $1;
					`,
						[item.id]
					);
					console.log("Query for ingredients successful");
					return {
						recipe: item,
						ingredients,
					};
				} catch (error) {
					console.error(`Error querying ingredients: ${error}`);
					throw error; // Rethrow the error to be caught by the outer catch block
				}
			})
		);

		res.send({
			data: recipeDetails,
		});
	} catch (error) {
		console.error(`Error querying recipes: ${error}`);
		res.status(500).send({
			error: error.message,
		});
	}
});

module.exports = app;
