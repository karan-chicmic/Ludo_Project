import {
    _decorator,
    color,
    Component,
    director,
    EditBoxComponent,
    input,
    instantiate,
    Label,
    Layout,
    math,
    Node,
    Prefab,
    randomRangeInt,
    Sprite,
    SpriteFrame,
    UITransform,
    view,
} from "cc";
import { customizeSingleCell } from "../cell/customizeSingleCell";
import { customizeSingleSnake } from "../snake/customizeSingleSnake";
import { customizeSingleLadder } from "../ladder/customizeSingleLadder";
import { dice } from "../dice/dice";

const { ccclass, property } = _decorator;
const Player = {
    Player1: "player 1",
    Player2: "player 2",
};
@ccclass("board")
export class board extends Component {
    snakes: number[] = [];
    ladders: number[] = [];
    currPlayer = Player.Player1;

    firstStart: boolean = false;
    secondStart: boolean = false;

    player1CurrLabel: number = 0;
    player2CurrLabel: number = 0;

    cells: { i: number; j: number; label: string; type: string }[] = [];
    cellMap: Map<string, Node> = new Map<string, Node>();

    @property({ type: Node })
    board: Node = null;
    @property({ type: Node })
    inputNode: Node = null;
    @property({ type: Prefab })
    cell: Prefab = null;

    @property({ type: Node })
    game: Node = null;

    @property({ type: Prefab })
    row: Prefab = null;
    @property({ type: EditBoxComponent })
    snakeEditBox: EditBoxComponent = null;

    @property({ type: Label })
    snakeLabel: Label = null;

    @property({ type: Prefab })
    snakePrefab: Prefab = null;

    @property({ type: EditBoxComponent })
    ladderEditBox: EditBoxComponent = null;

    @property({ type: Label })
    ladderLabel: Label;

    @property({ type: Label })
    errorLabel: Label = null;

    @property({ type: Prefab })
    ladderPrefab: Prefab = null;

    @property({ type: Sprite })
    diceImage: Sprite = null;

    @property({ type: Label })
    currPlayerLabel: Label = null;

    @property({ type: Node })
    player1Gotti: Node;

    @property({ type: Node })
    player2Gotti: Node;

    start() {}

    update(deltaTime: number) {
        if (this.currPlayer == Player.Player1) {
            this.currPlayerLabel.string = "Player 1 Turn";
        } else {
            this.currPlayerLabel.string = "Player 2 Turn";
        }
    }
    onClick() {
        if (this.snakeEditBox.string == "" || this.ladderEditBox.string == "") {
            this.errorLabel.string = "Enter Both Fields";
        } else {
            console.log("no of snakes", this.snakeEditBox.string, "no of ladders", this.ladderEditBox.string);
            this.inputNode.active = false;
            for (let i = 0; i < 10; i++) {
                let row = instantiate(this.row);
                for (let j = 0; j < 10; j++) {
                    let cellnode = instantiate(this.cell);
                    cellnode.getComponent(customizeSingleCell).setLable(i * 10 + (j + 1));
                    row.addChild(cellnode);
                    // setTimeout(() => {
                    //     console.log("pos", cellnode.getPosition());
                    // }, 1);
                    this.cellMap.set(cellnode.getComponent(customizeSingleCell).getLabel(), cellnode);
                }
                row.getComponent(Layout).horizontalDirection =
                    i % 2 == 0 ? Layout.HorizontalDirection.LEFT_TO_RIGHT : Layout.HorizontalDirection.RIGHT_TO_LEFT;
                this.board.addChild(row);
            }
            setTimeout(() => {
                this.generateSnakes(parseInt(this.snakeEditBox.string));
                this.generateLadders(parseInt(this.ladderEditBox.string));
            }, 1);
        }
    }

    generateSnakes(numSnakes: number) {
        for (let i = 0; i < numSnakes; i++) {
            let start = randomRangeInt(10, 80);
            let snake = instantiate(this.snakePrefab);

            let snakeStartCellNode = this.cellMap.get(start.toString());
            console.log("snake start", start);

            this.snakes.push(start);
            console.log("snakeStartCellNode", snakeStartCellNode.getWorldPosition());
            snake.setPosition(snakeStartCellNode.getWorldPosition());
            snake.getComponent(customizeSingleSnake).setSnake();
            this.game.addChild(snake);
        }
    }
    generateLadders(numLadders: number) {
        for (let i = 0; i < numLadders; i++) {
            let ladder = instantiate(this.ladderPrefab);
            let start = randomRangeInt(10, 80);
            let ladderStartCellNode = this.cellMap.get(start.toString());
            console.log("ladder start", start);
            this.ladders.push(start);
            ladder.setPosition(ladderStartCellNode.getWorldPosition());
            ladder.getComponent(customizeSingleLadder).setLadder();
            this.game.addChild(ladder);
        }
    }

    rollDice() {
        this.diceImage.getComponent(dice).generateDiceNumber();
        let diceNumber = this.diceImage.getComponent(dice).getDiceNumber();
        console.log(diceNumber);
        if (!(diceNumber == 6) && this.currPlayer == Player.Player1 && !this.firstStart) {
            this.currPlayer = Player.Player2;
        } else if (!(diceNumber == 6) && this.currPlayer == Player.Player2 && !this.secondStart) {
            this.currPlayer = Player.Player1;
        } else if (diceNumber == 6 && this.currPlayer == Player.Player1 && !this.firstStart) {
            this.firstStart = true;
            this.player1CurrLabel = 1;
            console.log("player 1 first 6", this.cellMap.get("1").getWorldPosition());
            this.player1Gotti.setPosition(this.cellMap.get("1").getWorldPosition());
            this.game.addChild(this.player1Gotti);
            this.currPlayer = Player.Player2;
        } else if (diceNumber == 6 && this.currPlayer == Player.Player2 && !this.secondStart) {
            this.secondStart = true;
            this.player2CurrLabel = 1;
            console.log("player 2 first 6", this.cellMap.get("1").getWorldPosition());

            this.player2Gotti.setPosition(this.cellMap.get("1").getWorldPosition());
            this.game.addChild(this.player2Gotti);
            this.currPlayer = Player.Player1;
        } else if (this.firstStart && this.currPlayer == Player.Player1) {
            let newLabel = this.player1CurrLabel + diceNumber;
            this.player1CurrLabel = newLabel;
            console.log("player 1 label", newLabel);
            let newPos = this.cellMap.get(newLabel.toString()).getWorldPosition();
            this.player1Gotti.setPosition(newPos);
            this.currPlayer = Player.Player2;
        } else if (this.secondStart && this.currPlayer == Player.Player2) {
            let newLabel = this.player2CurrLabel + diceNumber;
            this.player2CurrLabel = newLabel;
            console.log("player 2 label", newLabel);
            let newPos = this.cellMap.get(newLabel.toString()).getWorldPosition();
            this.player2Gotti.setPosition(newPos);
            this.currPlayer = Player.Player1;
        }
    }

    startGame() {}
}
