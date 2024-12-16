import React, { useState } from "react";
import axios from "axios";

const base_url = 'https://recipes-backend.localhost/api';

const DeleteRecipe = () => {
	const [recipeId, setRecipeId] = useState("");
	const [message, setMessage] = useState("");

	const handleInputChange = (e) => {
		setRecipeId(e.target.value);
	};

	const handleSubmit = async () => {
		try {
			const response = await axios.delete(`${base_url}/delete-recipe/${recipeId}`);
			console.log("DELETE request successful:", response.data);
			setMessage(`Recipe with ID ${recipeId} deleted successfully.`);
			setRecipeId(""); // Reset the input field
		} catch (error) {
			console.error("Error making DELETE request:", error);
			setMessage(`Error deleting recipe with ID ${recipeId}.`);
		}
	};

	return (
		<div>
			<h2>Delete Recipe</h2>
			<div>
				<label>Recipe ID:</label>
				<input
					type="text"
					value={recipeId}
					onChange={handleInputChange}
					placeholder="Enter recipe ID"
				/>
			</div>
			<button onClick={handleSubmit}>Delete Recipe</button>
			{message && <p>{message}</p>}
		</div>
	);
};

export default DeleteRecipe;