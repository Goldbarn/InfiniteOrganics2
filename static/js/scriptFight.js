function switchToMonsters() {
    window.location.href = 'monsters.html';
}  

function switchToType() {
  window.location.href = 'index.html';
}  

document.addEventListener("DOMContentLoaded", function () {
    const items = document.querySelectorAll(".item");
    const fightButton = document.getElementById("fightButton");
    const resultOverlay = document.getElementById("resultOverlay");
    const resultText1 = document.getElementById("resultText1");
    const resultText2 = document.getElementById("resultText2");
    const endButton = document.getElementById("endButton");
    const monster1Moves = document.getElementById("monster1Moves");
    const monster2Moves = document.getElementById("monster2Moves");
    const monster1HP = document.getElementById("monster1HP");
    const monster2HP = document.getElementById("monster2HP");
    const effectivenessPercentage = document.getElementById("effectivenessPercentage"); // New element for effectiveness display

    let selectedItem1 = null;
    let selectedItem2 = null;
    let monster1 = null;
    let monster2 = null;
    let currentTurn = null; // Track whose turn it is
    let lastMoveEffectiveness = 100; // Store the last move's effectiveness

    // Function to load monsters from local storage and populate columns
    function loadMonstersIntoColumns() {
        const monsters = JSON.parse(localStorage.getItem('monsters')) || [];
        const column1 = document.getElementById("column1");
        const column2 = document.getElementById("column2");

        // Clear existing items in the columns
        column1.innerHTML = '';
        column2.innerHTML = '';

        // Populate columns with monster names
        monsters.forEach(monster => {
            const item1 = document.createElement("div");
            item1.classList.add("item");
            item1.setAttribute("data-value", monster.name);
            item1.textContent = monster.name;
            column1.appendChild(item1);

            const item2 = document.createElement("div");
            item2.classList.add("item");
            item2.setAttribute("data-value", monster.name);
            item2.textContent = monster.name;
            column2.appendChild(item2);
        });

        // Re-attach event listeners to the new items
        attachItemEventListeners();
    }

    // Function to attach event listeners to items
    function attachItemEventListeners() {
        const items = document.querySelectorAll(".item");
        items.forEach(item => {
            item.addEventListener("click", function () {
                const column = item.parentElement.id;

                // Deselect all items in the same column
                document.querySelectorAll(`#${column} .item`).forEach(i => {
                    i.classList.remove("selected");
                });

                // Select the clicked item
                item.classList.add("selected");

                // Store the selected item
                if (column === "column1") {
                    selectedItem1 = item.getAttribute("data-value");
                } else if (column === "column2") {
                    selectedItem2 = item.getAttribute("data-value");
                }
            });
        });
    }

    // Load monsters into columns when the page loads
    loadMonstersIntoColumns();

    // Fight button click event
    fightButton.addEventListener("click", function () {
        if (selectedItem1 && selectedItem2) {
            const monsters = JSON.parse(localStorage.getItem('monsters')) || [];
            monster1 = monsters.find(monster => monster.name === selectedItem1);
            monster2 = monsters.find(monster => monster.name === selectedItem2);

            if (monster1 && monster2) {
                resultText1.textContent = monster1.name;
                resultText2.textContent = monster2.name;
                monster1HP.textContent = `HP: ${monster1.hp}`;
                monster2HP.textContent = `HP: ${monster2.hp}`;

                // Populate moves for each monster
                populateMoves(monster1, monster1Moves);
                populateMoves(monster2, monster2Moves);

                // Determine who goes first based on speed
                if (monster1.speed > monster2.speed) {
                    currentTurn = monster1;
                    monster1Moves.style.pointerEvents = 'auto';
                    monster2Moves.style.pointerEvents = 'none';
                } else {
                    currentTurn = monster2;
                    monster2Moves.style.pointerEvents = 'auto';
                    monster1Moves.style.pointerEvents = 'none';
                }

                resultOverlay.classList.remove("hidden");
                resultOverlay.classList.add("visible");
            } else {
                alert("Selected monsters not found!");
            }
        } else {
            alert("Please select one item from each column!");
        }
    });

    // Function to populate moves for a monster
    function populateMoves(monster, moveContainer) {
        moveContainer.innerHTML = '';
        const types = monster.types;
        for (let i = 0; i < 4; i++) {
            const moveButton = document.createElement("button");
            moveButton.classList.add("action-button");
            if (i < types.length) {
                moveButton.textContent = `${types[i]} type move`;
            } else {
                moveButton.textContent = "Normal move";
            }
            moveButton.addEventListener("click", () => handleMove(monster, moveButton.textContent));
            moveContainer.appendChild(moveButton);
        }
    }

 // Function to handle a move
async function handleMove(attacker, move) {
    const defender = attacker === monster1 ? monster2 : monster1;
    const attackType = move.split(" ")[0]; // Extract the attack type from the move text

    // Calculate damage and effectiveness
    const damage = await calculateDamage(attacker, defender, attackType);
    defender.hp -= damage;

    // Update effectiveness display
    effectivenessPercentage.textContent = `${lastMoveEffectiveness}%`;

    // Generate and display move description
    const moveDescription = await genMoveDescription(attacker.description, defender.description, attackType, lastMoveEffectiveness);
    displayMoveDescription(moveDescription);

    if (defender.hp <= 0) {
        defender.hp = 0;
        endBattle(attacker);
    }

    updateHP();

    if (defender.hp > 0) {
        // Switch turns
        if (attacker === monster1) {
            currentTurn = monster2;
            monster1Moves.style.pointerEvents = 'none';
            monster2Moves.style.pointerEvents = 'auto';
        } else {
            currentTurn = monster1;
            monster2Moves.style.pointerEvents = 'none';
            monster1Moves.style.pointerEvents = 'auto';
        }
    }
}

// Function to generate move description
async function genMoveDescription(attackerDesc, defenderDesc, attackType, effectiveness) {
    try {
        const response = await fetch('https://localhost:5000/genMoveDescription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attackerDesc, defenderDesc, attackType, effectiveness })
        });
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Error generating move description:', error);
        return "An error occurred while generating the move description.";
    }
}

// Function to display move description
function displayMoveDescription(description) {
    const moveDescriptionElement = document.getElementById("moveDescription");
    moveDescriptionElement.textContent = description;
}

    // Function to calculate damage
    async function calculateDamage(attacker, defender, attackType) {
        const attack = attacker.atk;
        const defense = defender.def;
        const baseDamage = Math.max(1, attack - defense);

        // Calculate type multiplier
        const multiplier = await calcMultiplier(attackType, defender.types);
        const damage = baseDamage * multiplier;

        return damage;
    }

    // Function to calculate type multiplier
    async function calcMultiplier(attackType, defenderTypes) {
        try {
            const response = await fetch('https://localhost:5000/calcMult', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ atkType: attackType, defTypes: defenderTypes })
            });
            const data = await response.json();
            const multiplier = parseFloat(data.result) / 100; // Parse the string as a number and divide by 100
            lastMoveEffectiveness = Math.round(multiplier * 100); // Store the effectiveness percentage
            return multiplier;
        } catch (error) {
            console.error('Error calculating multiplier:', error);
            lastMoveEffectiveness = 100; // Default to 100% if there's an error
            return 1; // Default to 1 (no multiplier) if there's an error
        }
    }

    // Function to update HP display
    function updateHP() {
        monster1HP.textContent = `HP: ${monster1.hp}`;
        monster2HP.textContent = `HP: ${monster2.hp}`;
    }

    // Function to end the battle
    function endBattle(winner) {
        alert(`${winner.name} wins!`);
        resultOverlay.classList.remove("visible");
        resultOverlay.classList.add("hidden");
    }

    // End button click event
    endButton.addEventListener("click", function () {
        resultOverlay.classList.remove("visible");
        resultOverlay.classList.add("hidden");
    });
});
