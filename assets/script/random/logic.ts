// import { _decorator, Component, Node, Label, EditBox, Sprite, Prefab, v3, Vec3, director } from 'cc';
// import { SnakeLadderCell } from './SnakeLadderCell';

// const { ccclass, property } = _decorator;

// @ccclass('SnakeLadderGame')
// export class SnakeLadderGame extends Component {

//     @property(EditBox)
//     numSnakes: EditBox = null;

//     @property(EditBox)
//     numLadders: EditBox = null;

//     @property(Prefab)
//     cellPrefab: Prefab = null;

//     private _board: Node = null;
//     private _cells: SnakeLadderCell[][] = [];
//     private _snakes: { start: number, end: number }[] = [];
//     private _ladders: { start: number, end: number }[] = [];
//     private _currentPlayer: number = 0;
//     private _currentPosition: number = 0;
//     private _diceValue: number = 0;

//     start() {
//         this._board = new Node('Board');
//         this.node.addChild(this._board);
//         this.createBoard();
//         this.createSnakesAndLadders();
//         this.createDice();
//     }

//     createBoard() {
//         const size = 10;
//         for (let i = 0; i < size; i++) {
//             this._cells[i] = [];
//             for (let j = 0; j < size; j++) {
//                 const cell = cc.instantiate(this.cellPrefab);
//                 cell.parent = this._board;
//                 cell.position = v3(j  80, -i  80, 0);
//                 this._cells[i][j] = cell.getComponent(SnakeLadderCell);
//                 this._cells[i][j].index = i * size + j;
//             }
//         }
//     }

//     createSnakesAndLadders() {
//         const numSnakes = parseInt(this.numSnakes.string);
//         const numLadders = parseInt(this.numLadders.string);
//         for (let i = 0; i < numSnakes; i++) {
//             let start = Math.floor(Math.random() * 100);
//             let end = Math.floor(Math.random() * 100);
//             while (end <= start || this._snakes.some(snake => snake.start === end)) {
//                 end = Math.floor(Math.random() * 100);
//             }
//             this._snakes.push({ start, end });
//         }
//         for (let i = 0; i < numLadders; i++) {
//             let start = Math.floor(Math.random() * 100);
//             let end = Math.floor(Math.random() * 100);
//             while (end <= start || this._ladders.some(ladder => ladder.start === end)) {
//                 end = Math.floor(Math.random() * 100);
//             }
//             this._ladders.push({ start, end });
//         }
//         this.updateCells();
//     }

//     createDice() {
//         const dice = new Node('Dice');
//         dice.parent = this.node;
//         dice.position = v3(0, -500, 0);
//         const diceSprite = dice.addComponent(Sprite);
//         diceSprite.spriteFrame = director.getScene().getChildByName('Assets').getChildByName('dice').getComponent(Sprite).spriteFrame;
//         dice.on(Node.EventType.TOUCH_START, () => {
//             this._diceValue = Math.floor(Math.random() * 6) + 1;
//             this.movePlayer();
//         });
//     }

//     movePlayer() {
//     if (this._diceValue === 6) {
//         this._currentPlayer = (this._currentPlayer + 1) % 2;
//         this._currentPosition += this._diceValue;
//         if (this._currentPosition > 100) {
//             this._currentPosition -= this._diceValue;
//             this._currentPlayer = (this._currentPlayer + 1) % 2;
//         }
//         const cell = this._cells[Math.floor(this._currentPosition / 10)][this._currentPosition % 10];
//         if (cell.type === 'snake') {
//             const snake = this._snakes.find(snake => snake.start === cell.index);
//             if (snake)
//  {
//                 this._currentPosition = snake.end;
//             }
//         } else if (cell.type === 'ladder') {
//             const ladder = this._ladders.find(ladder => ladder.start === cell.index);
//             if (ladder) {
//                 this._currentPosition = ladder.end;
//             }
//         }
//         cell.highlight();
//         if (this._currentPosition === 100) {
//             this.gameEnded();
//         }
//     }
// }
