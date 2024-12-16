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
						{recipes.map((recipe) => (
							<li key={recipe.id}>
								<h3>{recipe.name}</h3>
								<p>Servings: {recipe.servings}</p>
								<p>
									Preparation Time: {JSON.stringify(recipe.preparation_time)}
								</p>
								<p>Instructions: {JSON.stringify(recipe.instructions)}</p>
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
