class Move {
  constructor(name, types, effect) {
    this.name = name; // string
    this.types = new Set(types); // set of strings
    this.effect = effect; // string
  }

  // Getter for name
  getName() {
    return this.name;
  }

  // Setter for name
  setName(name) {
    this.name = name;
  }

  // Getter for types
  getTypes() {
    return this.types;
  }

  // Add a type to the set of types
  addType(type) {
    this.types.add(type);
  }

  // Remove a type from the set of types
  removeType(type) {
    this.types.delete(type);
  }

  // Getter for effect
  getEffect() {
    return this.effect;
  }

  // Setter for effect
  setEffect(effect) {
    this.effect = effect;
  }

  // Method to display move details
  displayDetails() {
    console.log(`Move Name: ${this.name}`);
    console.log(`Types: ${Array.from(this.types).join(', ')}`);
    console.log(`Effect: ${this.effect}`);
  }
}


class Monster {
  constructor(name, description, atk, def, hp, speed, types = new Set(), moves = []) {
    this.name = name; // string
    this.description = description; // string
    this.atk = atk; // integer
    this.def = def; // integer
    this.hp = hp; // integer
    this.speed = speed; // integer
    this.types = new Set(types); // set of strings
    this.moves = moves; // array of Move objects
  }

  // Getter for name
  getName() {
    return this.name;
  }

  // Setter for name
  setName(name) {
    this.name = name;
  }

  // Getter for description
  getDescription() {
    return this.description;
  }

  // Setter for description
  setDescription(description) {
    this.description = description;
  }

  // Getter for attack
  getAtk() {
    return this.atk;
  }

  // Setter for attack
  setAtk(atk) {
    this.atk = atk;
  }

  // Getter for defense
  getDef() {
    return this.def;
  }

  // Setter for defense
  setDef(def) {
    this.def = def;
  }

  // Getter for HP
  getHp() {
    return this.hp;
  }

  // Setter for HP
  setHp(hp) {
    this.hp = hp;
  }

  // Getter for speed
  getSpeed() {
    return this.speed;
  }

  // Setter for speed
  setSpeed(speed) {
    this.speed = speed;
  }

  // Getter for types
  getTypes() {
    return this.types;
  }

  // Add a type to the monster
  addType(type) {
    this.types.add(type);
  }

  // Remove a type from the monster
  removeType(type) {
    this.types.delete(type);
  }

  // Getter for moves
  getMoves() {
    return this.moves;
  }

  // Add a move to the monster's moveset
  addMove(move) {
    if (move instanceof Move) {
      this.moves.push(move);
    } else {
      console.error("Invalid move. Must be an instance of the Move class.");
    }
  }

  // Remove a move from the monster's moveset by name
  removeMove(moveName) {
    this.moves = this.moves.filter((move) => move.name !== moveName);
  }

  concatenateMoves() {
    return this.moves.map(move => {
      return `${move.getName()}, Types: ${Array.from(move.getTypes()).join(', ')}, Effect: ${move.getEffect()}`;
    }).join('\n');
  }


  // Method to display monster details
  displayDetails() {
    output = 
    `Monster Name: ${this.name}\n`
    + `Description: ${this.description}`
    + `Types: ${Array.from(this.types).join(", ")}\n`
    + `Attack: ${this.atk}\n`
    + `Defense: ${this.def}\n`
    + `HP: ${this.hp}\n`
    + `Speed: ${this.speed}\n`
    + "Moves:\n"
    + this.concatenateMoves()
    return output;
  }
}

function effective(type1, type2) {
  
}

export { Move, Monster };


// var nMv = new Move("normal", "normal", "normal");
// var rMv = new Move("red", "red", "red");
// var gMv = new Move("green", "green", "green");
// var bMv = new Move("blue", "blue", "blue");


// var test = new Monster("Test", "testes", 10, 10, 100, 10, {1: "normal", 2: "red", 3: "green", 4: "blue"}, [nMv, rMv, gMv, bMv]);

// alert(test.displayDetails());


