import inquirer from "inquirer";

const run = async () => {
    const res = await inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "Select an option:",
            choices: ["One", "Two", "Three"],
        },
    ]);
    console.log("You chose:", res.choice);
};

run();
