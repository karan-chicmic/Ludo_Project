// import { Component, Node, Vec3, randomRangeInt } from 'cc';

// export class Game extends Component {
//     // Game properties
//     private boardSize = 10;
//     private currentPlayer = 1;
//     private players: { position: number }[] = [{ position: 0 }]; // Array to store player positions (add more players as needed)
//     private snakes: { start: number, end: number }[] = [];
//     private ladders: { start: number, end: number }[] = [];
//     private boardCells: { number: number, position: Node, hasSnakeStart?: boolean, hasSnakeEnd?: boolean, hasLadderStart?: boolean, hasLadderEnd?: boolean }[] = [];
//     private gottiPrefab: Node; // Prefab for the player's game piece (gotti)

//     // Start the game
//     public start() {
//         this.gottiPrefab = this.node.getChildByName("GottiPrefab"); // Assuming the prefab is a child node named "GottiPrefab"

//         this.getUserInput().then(() => {
//             this.initializeBoard();
//             this.showBoard(); // Add a function to display the board on screen
//         });
//     }

//     // Get user input for number of snakes and ladders
//     private async getUserInput() {
//         // Implement your preferred user input method (e.g., dialog)
//         const numSnakes = await this.promptUser("Enter number of snakes:");
//         const numLadders = await this.promptUser("Enter number of ladders:");

//         this.initializeBoard(numSnakes, numLadders);
//     }

//     // Helper function for user input (implementation omitted for brevity)
//     private promptUser(message: string): Promise<number> {
//         // ... your user input method implementation
//     }

//     // Initialize the game board
//     private initializeBoard(numSnakes: number = 0, numLadders: number = 0) {
//         // Generate random positions for snakes and ladders
//         for (let i = 0; i < numSnakes; i++) {
//             this.generateSnakePosition();
//         }
//         for (let i = 0; i < numLadders; i++) {
//             this.generateLadderPosition();
//         }

//         // Create board cells with positions and track snake/ladder positions
//         for (let i = 0; i < this.boardSize * this.boardSize; i++) {
//             const cellPosition = this.calculateCellPosition(i);
//             const cell = new Node("Cell_" + (i + 1));
//             cell.parent = this.node; // Add cell to parent node

//             const cellData = {
//                 number: i + 1,
//                 position: cell,
//             };

//             // Check for snake/ladder positions
//             this.snakes.forEach(snake => {
//                 if (snake.start === cellData.number) {
//                     cellData.hasSnakeStart = true;
//                 } else if (snake.end === cellData.number) {
//                     cellData.hasSnakeEnd = true;
//                 }
//             });
//             this.ladders.forEach(ladder => {
//                 if (ladder.start === cellData.number) {
//                     cellData.hasLadderStart = true;
//                 } else if (ladder.end === cellData.number) {
//                     cellData.hasLadderEnd = true;
//                 }
//             });

//             this.boardCells.push(cellData);
//         }
//     }

//     // Calculate cell position based on board layout (implementation omitted for brevity)
//     private calculateCellPosition(index: number): Vec3 {
//         // ... calculate cell position based on board size and layout
//     }

//     // Generate a valid snake position
//     private generateSnakePosition() {
//         let validPosition = false;
//         while (!validPosition) {
//             const start = Math.floor(Math.random()  (this.boardSize  this.boardSize - 5)) + 6; // Avoid positions close to 100
//             const end = Math.floor(Math.random() * (start - 5)) + 1; // Ensure end is lower than start

//             if (this.isValidSnakePosition(start, end)) {
//                 this.snakes.push({ start, end });
//                 validPosition = true;
//             }
//         }
//     }



//     private generateLadderPosition() {
//         let validPosition = false;
//         while (!validPosition) {
//             const start = Math.floor(Math.random()  (this.boardSize  this.boardSize - 5)) + 1; // Avoid positions close to 1
//             const end = Math.floor(Math.random()  (this.boardSize  this.boardSize - start)) + start + 5; // Ensure end is higher than start and within board

//             if (this.isValidLadderPosition(start, end)) {
//                 this.ladders.push({ start, end });
//                 validPosition = true;
//             }
//         }
//     }

//     // Check if a snake position is valid (doesn't overlap with other snakes or ladders)
//     private isValidSnakePosition(start: number, end: number): boolean {
//         return this.snakes.every(snake => snake.start !== start && snake.end !== start && snake.start !== end && snake.end !== end) &&
//             this.ladders.every(ladder => ladder.start !== start && ladder.end !== start && ladder.start !== end && ladder.end !== end);
//     }

//     // Check if a ladder position is valid (doesn't overlap with other snakes or ladders)
//     private isValidLadderPosition(start: number, end: number): boolean {
//         return this.snakes.every(snake => snake.start !== start && snake.end !== start && snake.start !== end && snake.end !== end) &&
//             this.ladders.every(ladder => ladder.start !== start && ladder.end !== start && ladder.start !== end && ladder.end !== end && ladder.start !== end && ladder.end !== end);
//     }

//     // Roll the dice
//     public rollDice() {
//         const diceRoll = randomRangeInt(1, 7); // Roll a dice between 1 and 6
//         return diceRoll;
//     }

//     // Make a move for the current player
//     public makeMove(diceRoll: number) {
//         const newPosition = this.players[this.currentPlayer - 1].position + diceRoll;

//         // Check if player reaches 100 or beyond
//         if (newPosition > this.boardSize * this.boardSize) {
//             this.players[this.currentPlayer - 1].position = this.boardSize  this.boardSize - (newPosition % this.boardSize  this.boardSize); // Move back steps exceeding 100
//             return;
//         }

//         // Check for snake or ladder
//         const cellData = this.boardCells[newPosition - 1];
//         if (cellData.hasSnakeStart) {
//             this.players[this.currentPlayer - 1].position = this.findSnakeEnd(newPosition);
//         } else if (cellData.hasLadderStart) {
//             this.players[this.currentPlayer - 1].position = this.findLadderEnd(newPosition);
//         } else {
//             this.players[this.currentPlayer - 1].position = newPosition;
//         }

//         // Check for winning condition
//         if (this.players[this.currentPlayer - 1].position === this.boardSize * this.boardSize) {
//             console.log("Player", this.currentPlayer, "wins!");
//             // Handle game end (e.g., display win message)
//         } else {
//             // Move to next player or continue current player's turn
//             if (diceRoll === 6) {
//                 // Player gets another turn if they roll 6
//             } else {
//                 this.currentPlayer = (this.currentPlayer % this.players.length) + 1; // Switch to next player
//             }
//         }

//         // Update gotti position on screen (implementation omitted for brevity)
//         this.updateGottiPosition(this.players[this.currentPlayer - 1].position);
//     }

//     // Find the end position of a snake based on its starting position
//     private findSnakeEnd(start: number): number {
//         const snake = this.snakes.find(snake => snake.start === start);
//         if (snake) {
//             return snake.end;
//         } else {
//             console.error("Snake not found for start position:", start);
//             return start; // Handle potential error
//         }
//     }

//     // Find the end position of a ladder based on its starting position
//     private findLadderEnd(start: number): number {
//         const ladder = this.ladders.find(ladder => ladder.start === start);
//         if (ladder) {
//             return ladder.end;
//         } else {
//             console.error("Ladder not found for start position:", start);
//             return start; // Handle potential error
//         }
//     }

//     // Update the gotti (player piece) position on the screen (implementation specific to Cocos Creator)
//     private updateGottiPosition(position: number) {
//         const cellData = this.boardCells[position - 1];
//         const gottiInstance = this.instantiate(this.gottiPrefab); // Create an instance of the gotti prefab
//         gottiInstance.parent = this.node; // Add the gotti instance to the parent node
//         gottiInstance.setPosition(cellData.position.getWorldPosition()); // Set the gotti's position based on the cell's position
//     }
// }

