import React, { useState } from "react";
import axios from "axios";

const base_url = 'https://recipes-backend.localhost/api';

const AddRecipe = () => {
	const [name, setName] = useState("");
	const [ingredients, setIngredients] = useState([{ name: "", quantity: { value: "", unit: "" } }]);
	const [instructions, setInstructions] = useState([""]);
	const [servings, setServings] = useState(1);
	const [preparationTime, setPreparationTime] = useState({ value: "", unit: "" });

	const handleInputChange = (e, index, field) => {
		const { name, value } = e.target;
		const newIngredients = [...ingredients];
		if (field === "quantity") {
			newIngredients[index].quantity[name] = value;
		} else {
			newIngredients[index][name] = value;
		}
		setIngredients(newIngredients);
	};

	const handleInstructionChange = (e, index) => {
		const newInstructions = [...instructions];
		newInstructions[index] = e.target.value;
		setInstructions(newInstructions);
	};

	const addIngredient = () => {
		setIngredients([...ingredients, { name: "", quantity: { value: "", unit: "" } }]);
	};

	const removeIngredient = (index) => {
		const newIngredients = ingredients.filter((_, i) => i !== index);
		setIngredients(newIngredients);
	};

	const addInstruction = () => {
		setInstructions([...instructions, ""]);
	};

	const removeInstruction = (index) => {
		const newInstructions = instructions.filter((_, i) => i !== index);
		setInstructions(newInstructions);
	};

	const handleSubmit = async () => {
		try {
			const response = await axios.post(
				`${base_url}/add-recipe`,
				{
					name,
					ingredients,
					instructions,
					servings,
					preparation_time: preparationTime,
				}
			);
			console.log("POST request successful:", response.data);
			// Reset the form
			setName("");
			setIngredients([{ name: "", quantity: { value: "", unit: "" } }]);
			setInstructions([""]);
			setServings(1);
			setPreparationTime({ value: "", unit: "" });
		} catch (error) {
			console.error("Error making POST request:", error);
		}
	};

	return (
		<div>
			<h2>Add Recipe</h2>
			<div>
				<label>Name:</label>
				<input type="text" value={name} onChange={(e) => setName(e.target.value)} />
			</div>
			<div>
				<label>Ingredients:</label>
				{ingredients.map((ingredient, index) => (
					<div key={index}>
						<input
							type="text"
							name="name"
							value={ingredient.name}
							onChange={(e) => handleInputChange(e, index, "name")}
							placeholder="Ingredient name"
						/>
						<input
							type="number"
							name="value"
							value={ingredient.quantity.value}
							onChange={(e) => handleInputChange(e, index, "quantity")}
							placeholder="Quantity value"
						/>
						<input
							type="text"
							name="unit"
							value={ingredient.quantity.unit}
							onChange={(e) => handleInputChange(e, index, "quantity")}
							placeholder="Quantity unit"
						/>
						<button onClick={() => removeIngredient(index)}>Remove</button>
					</div>
				))}
				<button onClick={addIngredient}>Add Ingredient</button>
			</div>
			<div>
				<label>Instructions:</label>
				{instructions.map((instruction, index) => (
					<div key={index}>
						<textarea
							value={instruction}
							onChange={(e) => handleInstructionChange(e, index)}
							placeholder="Instruction step"
						/>
						<button onClick={() => removeInstruction(index)}>Remove</button>
					</div>
				))}
				<button onClick={addInstruction}>Add Instruction</button>
			</div>
			<div>
				<label>Servings:</label>
				<input
					type="number"
					value={servings}
					onChange={(e) => setServings(Number(e.target.value))}
				/>
			</div>
			<div>
				<label>Preparation Time:</label>
				<input
					type="number"
					name="value"
					value={preparationTime.value}
					onChange={(e) => setPreparationTime({ ...preparationTime, value: e.target.value })}
					placeholder="Preparation time value"
				/>
				<input
					type="text"
					name="unit"
					value={preparationTime.unit}
					onChange={(e) => setPreparationTime({ ...preparationTime, unit: e.target.value })}
					placeholder="Preparation time unit"
				/>
			</div>
			<button onClick={handleSubmit}>Submit</button>
		</div>
	);
};

export default AddRecipe;
