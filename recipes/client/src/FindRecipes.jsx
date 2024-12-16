import React, { useState } from "react";
import axios from "axios";

const base_url = "https://recipes-backend.localhost/api";

const FindRecipes = () => {
	const [inputText, setInputText] = useState("");
	const [items, setItems] = useState([]);
	const [recipes, setRecipes] = useState([]);

	const handleInputChange = (e) => {
		setInputText(e.target.value);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			addItem();
		}
	};

	const addItem = () => {
		if (inputText.trim() !== "") {
			setItems([...items, inputText]);
			setInputText("");
		}
	};

	const removeItem = (index) => {
		const newItems = items.filter((_, i) => i !== index);
		setItems(newItems);
	};

	const handleSubmit = async () => {
		try {
			const response = await axios.post(`${base_url}/find-recipes`, {
				ingredients: items,
			});
			console.log("POST request successful:", response.data);
			setRecipes(response.data.data);
		} catch (error) {
			console.error("Error making POST request:", error);
		}
	};

	return (
		<div>
			<input
				type="text"
				value={inputText}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				placeholder="Enter ingredient"
			/>
			<button onClick={addItem}>Add</button>
			<ul>
				{items.map((item, index) => (
					<li key={index}>
						{item}
						<button onClick={() => removeItem(index)}>x</button>
					</li>
				))}
			</ul>
			<button onClick={handleSubmit}>Submit</button>
			<div>
				<h2>Recipes</h2>
				{recipes.length > 0 ? (
					<ul>
						{recipes.map((recipeDetail, index) => (
							<li key={index}>
								<h3>{recipeDetail.recipe.name}</h3>
								<p>Servings: {recipeDetail.recipe.servings}</p>
								<p>
									Preparation Time: {recipeDetail.recipe.preparation_time.value}{" "}
									{recipeDetail.recipe.preparation_time.unit}
								</p>
								<h4>
									Instructions
								</h4>
								<ol>
									{recipeDetail.recipe.instructions.map((instruction, idx) => (
										<li key={idx}>{instruction}</li>
									))}
								</ol>
								<h4>
									Ingredients
								</h4>
								<ul>
									{recipeDetail.ingredients.map((ingredient, idx) => (
										<li key={idx}>
											{ingredient.ingredient_name}: {ingredient.quantity}{" "}
											{ingredient.unit}
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				) : (
					<p>No recipes found.</p>
				)}
			</div>
		</div>
	);
};

export default FindRecipes;
