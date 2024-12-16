# Recipes
Web app to store and find recipes, made as the final project for CS50 2024.

## Set up
1. Install the [Nix package manager](https://nixos.org/download/#nix-install-linux)
2. Navigate to devenv/
3. Run `nix develop --impure`
4. Run `devenv up`
5. In a new terminal, repeat steps 2 and 3, then navigate to recipes/client/
6. In that terminal, run `npm i && npm run dev`
5. In a new terminal, repeat steps 2 and 3, then navigate to recipes/server/
7. In that terminal, run `npm i && npm run migrate && npm run dev`

This should allow you to visit https://recipes-frontend.localhost and interact with the app.

## Interacting with the app
The app has 3 sections, "Add Recipe", "Delete Recipe" and "Find Recipe".

The "Add Recipe" section allows the user to input a recipe's details, including its name, ingredients and quantities required, instructions, etc.

The "Find Recipe" section allows the user to inputs ingredients and, optionally, a recipe name. Submitting a query will return recipe entries that can be made with the provided ingredient, optionally filtered by the provided name.

The "Delete Recipe" section allows the user to delete a recipe based on the recipe's ID (obtained from the "Find Recipe" section).