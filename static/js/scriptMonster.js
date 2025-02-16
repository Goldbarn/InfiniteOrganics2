import { Monster, Move } from '/static/js/classes.js';

function switchToTypes() {
  window.location.href = 'index.html';
}

function switchToFight() {
    window.location.href = 'fight.html';
}  

function resetColumns() {
  // Clear all monsters from local storage
  localStorage.removeItem('monsters');
  // Reload the page to reflect the changes
  window.location.reload();
}

document.getElementById("generate-btn").addEventListener("click", generateMonster);

function generateMonster() {
  const checkboxes = document.querySelectorAll("#item-list input[type='checkbox']:checked");
  if (checkboxes.length > 3) {
    alert("You can only select up to 3 items!");
    return;
  }
  if (checkboxes.length < 1) {
    alert("Select at least 1 item!");
    return;
  }

  const monsterList = document.getElementById("monster-list");

  // Get selected items
  const types = Array.from(checkboxes).map(checkbox => checkbox.value).join(", ");

  fetch('https://localhost:5000/genMonster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ types: types })
  })
  .then(response => response.json())
  .then(data => {
      const monsterDesc = data.result;
      console.log(monsterDesc);

    fetch('https://localhost:5000/genNameStats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monsterDesc: monsterDesc })
  })
  .then(response => response.json())
  .then(data => {
      console.log("API Response Data:", data);
      const monName = data.result.name;
    const maxHP = data.result.maxHP;
    const attack = data.result.attack;
    const defense = data.result.defense;
    const speed = data.result.speed;

    console.log("Name:", monName);
  console.log("Max HP:", maxHP);
  console.log("Attack:", attack);
  console.log("Defense:", defense);
  console.log("Speed:", speed);

      // Create a new Monster instance
      const monster = new Monster(monName, monsterDesc, parseInt(attack), parseInt(defense), parseInt(maxHP), parseInt(speed), new Set(types.split(", ")));

      // Save the monster to local storage
      saveMonsterToLocalStorage(monster);

      // Display the monster in the list
      const monsterListItem = document.createElement("li");
      monsterListItem.textContent = monName;

      // Add click event to show details
      monsterListItem.addEventListener("click", () => {
      alert(`Monster Details:\nName: ` + monster.getName() + `\nDescription: ` + monster.getDescription() + `\nMax HP: ` + monster.getHp() + `\nAttack: ` + monster.getAtk() + `\nDefense: ` + monster.getDef() + `\nSpeed: ` + monster.getSpeed() + `\nTypes: ` + [...monster.getTypes()].join(', '));
      });

      // Add the monster to the list
      monsterList.appendChild(monsterListItem);

      // Reset checkboxes
      checkboxes.forEach(checkbox => checkbox.checked = false);
  });
})}

function saveMonsterToLocalStorage(monster) {
  // Retrieve existing monsters from local storage
  const monsters = JSON.parse(localStorage.getItem('monsters')) || [];

  // Add the new monster to the list
  monsters.push({
    name: monster.getName(),
    description: monster.getDescription(),
    types: Array.from(monster.getTypes()),
    atk: monster.getAtk(),
    def: monster.getDef(),
    hp: monster.getHp(),
    speed: monster.getSpeed(),
    moves: monster.getMoves().map(move => ({
      name: move.getName(),
      types: Array.from(move.getTypes()),
      effect: move.getEffect()
    }))
  });

  // Save the updated list back to local storage
  localStorage.setItem('monsters', JSON.stringify(monsters));
}

function loadMonstersFromLocalStorage() {
  const monsterList = document.getElementById("monster-list");
  const monsters = JSON.parse(localStorage.getItem('monsters')) || [];

  monsters.forEach(monsterData => {
    const monster = new Monster(
      monsterData.name,
      monsterData.description,
      monsterData.atk,
      monsterData.def,
      monsterData.hp,
      monsterData.speed,
      new Set(monsterData.types),
      monsterData.moves.map(moveData => new Move(moveData.name, moveData.types, moveData.effect))
    );

    const monsterListItem = document.createElement("li");
    monsterListItem.textContent = monster.getName();

    // Add click event to show details
    monsterListItem.addEventListener("click", () => {
      alert(`Monster Details:\nName: ` + monster.getName() + `\nDescription: ` + monster.getDescription() + `\nMax HP: ` + monster.getHp() + `\nAttack: ` + monster.getAtk() + `\nDefense: ` + monster.getDef() + `\nSpeed: ` + monster.getSpeed() + `\nTypes: ` + [...monster.getTypes()].join(', '));
    });

    // Add the monster to the list
    monsterList.appendChild(monsterListItem);
  });
}

function loadItemsForMonsters() {
  const itemList = document.getElementById('item-list');
  const columnItems = JSON.parse(localStorage.getItem('columnItems')) || [];

  // Clear existing items in the list
  itemList.innerHTML = '';

  // Add items to the monster selection list
  columnItems.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<input type="checkbox" value="${item}"> ${item}`;
    itemList.appendChild(li);
  });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadItemsForMonsters();
  loadMonstersFromLocalStorage();
});

function saveItemsToLocalStorage() {
  const columnItems = Array.from(document.querySelectorAll('#column1 li')).map(li => li.textContent);

  localStorage.setItem('columnItems', JSON.stringify(columnItems));
}

window.switchToTypes = switchToTypes;
window.switchToFight = switchToFight;
window.resetColumns = resetColumns;
