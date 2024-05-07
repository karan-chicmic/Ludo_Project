import {
    _decorator,
    color,
    Component,
    director,
    easing,
    EditBoxComponent,
    input,
    instantiate,
    Label,
    Layout,
    math,
    misc,
    Node,
    Prefab,
    Quat,
    randomRangeInt,
    Sprite,
    tween,
    UITransform,
    Vec3,
} from "cc";
import { customizeSingleCell } from "../cell/customizeSingleCell";

import { dice } from "../dice/dice";

const { ccclass, property } = _decorator;
const Player = {
    Player1: "player 1",
    Player2: "player 2",
};

enum CellType {
    Normal,
    SnakeStart,
    SnakeEnd,
    LadderStart,
    LadderEnd,
}

interface CellInfo {
    cell: Node;
    cellType: CellType;
}

@ccclass("board")
export class board extends Component {
    snakeMap: Map<number, number> = new Map<number, number>();
    ladderMap: Map<number, number> = new Map<number, number>();
    currPlayer = Player.Player1;

    firstStart: boolean = false;
    secondStart: boolean = false;

    player1CurrLabel: number = 0;
    player2CurrLabel: number = 0;

    cellArray: CellInfo[] = [];
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

    player2SixCounter: any;
    player1SixCounter: any;

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
                    this.cellMap.set(cellnode.getComponent(customizeSingleCell).getLabel(), cellnode);
                    this.cellArray.push({ cell: cellnode, cellType: CellType.Normal });
                }
                row.getComponent(Layout).horizontalDirection =
                    i % 2 == 0 ? Layout.HorizontalDirection.LEFT_TO_RIGHT : Layout.HorizontalDirection.RIGHT_TO_LEFT;
                this.board.addChild(row);
                row.getComponent(Layout).updateLayout();
            }
            this.board.getComponent(Layout).updateLayout();
            this.generateSnakes(parseInt(this.snakeEditBox.string));
            this.generateLadders(parseInt(this.ladderEditBox.string));
        }
    }

    generateSnakes(numSnakes: number) {
        this.board.getComponent(Layout).updateLayout();
        for (let i = 0; i < numSnakes; i++) {
            let start = randomRangeInt(10, 80);
            let end = randomRangeInt(30, 99);
            while (end <= start || end - start < 20) {
                end = randomRangeInt(30, 99);
            }
            let snake = instantiate(this.snakePrefab);
            this.snakeMap.set(start, end);

            let snakeStartCellNode = this.cellMap.get(start.toString());
            let snakeEndCellNode = this.cellMap.get(end.toString());

            snake.getComponent(UITransform).height = Math.abs(
                snakeEndCellNode.position.y - snakeStartCellNode.position.y
            );

            this.cellArray[start - 1].cellType = CellType.SnakeStart;
            this.cellArray[end - 1].cellType = CellType.SnakeEnd;

            this.game.addChild(snake);
        }
    }

    generateLadders(numLadders: number) {
        this.board.getComponent(Layout).updateLayout();
        for (let i = 0; i < numLadders; i++) {
            let ladder = instantiate(this.ladderPrefab);
            let start = randomRangeInt(10, 80);
            let end = randomRangeInt(30, 99);
            while (end <= start || end - start < 20) {
                end = randomRangeInt(30, 99);
            }
            this.ladderMap.set(start, end);

            let ladderStartCellNode = this.cellMap.get(start.toString());
            let ladderEndCellNode = this.cellMap.get(end.toString());

            ladder.getComponent(UITransform).height = Math.abs(
                ladderEndCellNode.position.y - ladderStartCellNode.position.y
            );

            this.cellArray[start - 1].cellType = CellType.LadderStart;
            this.cellArray[end - 1].cellType = CellType.LadderEnd;

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
            this.player1Turn(diceNumber);
        } else if (this.secondStart && this.currPlayer == Player.Player2) {
            this.player2Turn(diceNumber);
        }
    }

    player1Turn(diceNumber: number) {
        let finalLabel = this.player1CurrLabel + diceNumber;
        let targetCellInfo = this.cellArray[finalLabel - 1];

        switch (targetCellInfo.cellType) {
            case CellType.SnakeStart:
                console.log("Player 1  snake start.");
                this.player1CurrLabel = this.snakeMap.get(this.player1CurrLabel);
                break;
            case CellType.SnakeEnd:
                console.log("Player 1  snake end.");
                this.player1CurrLabel = finalLabel - 1;
                break;
            case CellType.LadderStart:
                console.log("Player 1  ladder start.");
                this.player1CurrLabel = this.ladderMap.get(this.player1CurrLabel);
                break;
            case CellType.LadderEnd:
                console.log("Player 1 ladder end.");
                this.player1CurrLabel = finalLabel - 1;
                break;
            default:
                this.player1CurrLabel = finalLabel;
                break;
        }

        let newPos = this.cellMap.get(this.player1CurrLabel.toString()).getWorldPosition();

        tween(this.player1Gotti)
            .to(
                diceNumber,
                {
                    position: newPos,
                },
                {
                    easing: "quadInOut",
                }
            )
            .start();

        this.currPlayer = Player.Player2;
    }

    player2Turn(diceNumber: number) {
        let finalLabel = this.player2CurrLabel + diceNumber;
        let targetCellInfo = this.cellArray[finalLabel - 1];
        switch (targetCellInfo.cellType) {
            case CellType.SnakeStart:
                console.log("Player 2  snake start.");
                this.player1CurrLabel = this.snakeMap.get(this.player1CurrLabel);
                break;
            case CellType.SnakeEnd:
                console.log("Player 2  snake end.");
                this.player1CurrLabel = finalLabel - 1;
                break;
            case CellType.LadderStart:
                console.log("Player 2  ladder start.");
                this.player1CurrLabel = this.ladderMap.get(this.player1CurrLabel);
                break;
            case CellType.LadderEnd:
                console.log("Player 2 ladder end.");
                this.player1CurrLabel = finalLabel - 1;
                break;
            default:
                this.player1CurrLabel = finalLabel;
                break;
        }

        let newPos = this.cellMap.get(this.player1CurrLabel.toString()).getWorldPosition();
        tween(this.player1Gotti)
            .to(
                diceNumber,
                {
                    position: newPos,
                },
                {
                    easing: "quadInOut",
                }
            )
            .start();

        this.currPlayer = Player.Player1;
        // for (let i = 1; i <= diceNumber; i++) {
        //     let newLabel = this.player2CurrLabel + 1;
        //     this.player2CurrLabel = newLabel;
        //     console.log("player 2 label", newLabel);
        //     let newPos = this.cellMap.get(newLabel.toString()).getWorldPosition();

        //     tween(this.player2Gotti)
        //         .to(
        //             i,
        //             {
        //                 position: newPos,
        //             },
        //             {
        //                 easing: "quadInOut",
        //             }
        //         )
        //         .start();
        // }
        // this.currPlayer = Player.Player1;
    }
}
