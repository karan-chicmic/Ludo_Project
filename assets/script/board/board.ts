import {
    _decorator,
    AudioClip,
    AudioSource,
    AudioSourceComponent,
    Component,
    EditBoxComponent,
    instantiate,
    Label,
    Layout,
    Node,
    Prefab,
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
@ccclass("board")
export class board extends Component {
    canRollDice: boolean = true;
    snakeMap: Map<number, number> = new Map<number, number>();
    ladderMap: Map<number, number> = new Map<number, number>();
    currPlayer = Player.Player1;

    firstStart: boolean = false;
    secondStart: boolean = false;

    player1CurrLabel: number = 0;
    player2CurrLabel: number = 0;

    cells: {
        cell: Node;
        hasSnakeStart: boolean;
        hasSnakeEnd: boolean;
        hasLadderStart: boolean;
        hasLadderEnd: boolean;
    }[] = [];
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

    @property({ type: AudioClip })
    startPlayClip: AudioClip = null;

    @property({ type: AudioClip })
    jumpClip: AudioClip = null;

    @property({ type: AudioClip })
    climbClip: AudioClip = null;

    @property({ type: AudioClip })
    biteClip: AudioClip = null;

    @property({ type: AudioClip })
    winClip: AudioClip = null;

    audioSource: AudioSource;

    start() {
        this.audioSource = this.node.getComponent(AudioSource);
    }

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
                }
                row.getComponent(Layout).horizontalDirection =
                    i % 2 == 0 ? Layout.HorizontalDirection.LEFT_TO_RIGHT : Layout.HorizontalDirection.RIGHT_TO_LEFT;
                this.board.addChild(row);
                row.getComponent(Layout).updateLayout();
            }
            this.board.getComponent(Layout).updateLayout();
            // setTimeout(() => {

            this.generateSnakes(parseInt(this.snakeEditBox.string));
            this.generateLadders(parseInt(this.ladderEditBox.string));
            // }, 1);
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
            this.snakeMap.set(end, start);
            let snakeStartCellNode = this.cellMap.get(start.toString());
            let snakeEndCellNode = this.cellMap.get(end.toString());
            console.log("snake start", start);
            console.log("snakeStartCellNode", snakeStartCellNode.getWorldPosition());
            console.log("snake end", end);
            console.log("snake end cell node", snakeEndCellNode.getWorldPosition());

            // this.snakes.push({ start, end });
            let dx = snakeEndCellNode.getWorldPosition().x - snakeStartCellNode.getWorldPosition().x;
            let dy = snakeEndCellNode.getWorldPosition().y - snakeStartCellNode.getWorldPosition().y;
            let diagonalDistance = Math.sqrt(dx * dx + dy * dy);
            snake.getComponent(UITransform).height = diagonalDistance;
            let angleRadians = Math.atan2(dy, dx);
            let angleDegrees = angleRadians * (180 / Math.PI);
            snake.eulerAngles = new Vec3(0, 0, -(90 - angleDegrees));

            snake.setWorldPosition(snakeStartCellNode.getWorldPosition());

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

            console.log("ladder start", start);
            console.log("ladderStartCellNode", ladderStartCellNode.getWorldPosition());
            console.log("ladder end", end);
            console.log("ladder end cell node", ladderEndCellNode.getWorldPosition());

            let dx = ladderEndCellNode.getWorldPosition().x - ladderStartCellNode.getWorldPosition().x;
            let dy = ladderEndCellNode.getWorldPosition().y - ladderStartCellNode.getWorldPosition().y;
            let diagonalDistance = Math.sqrt(dx * dx + dy * dy);

            ladder.getComponent(UITransform).height = diagonalDistance;

            let angleRadians = Math.atan2(dy, dx);
            let angleDegrees = angleRadians * (180 / Math.PI);
            ladder.eulerAngles = new Vec3(0, 0, -(90 - angleDegrees));

            ladder.setWorldPosition(ladderStartCellNode.getWorldPosition());

            this.game.addChild(ladder);
        }
    }

    rollDice() {
        if (this.canRollDice) {
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
                this.audioSource.clip = this.startPlayClip;
                this.audioSource.play();
                this.player1Gotti.setPosition(this.cellMap.get("1").getWorldPosition());
                this.game.addChild(this.player1Gotti);
                this.currPlayer = Player.Player2;
            } else if (diceNumber == 6 && this.currPlayer == Player.Player2 && !this.secondStart) {
                this.secondStart = true;
                this.player2CurrLabel = 1;
                console.log("player 2 first 6", this.cellMap.get("1").getWorldPosition());
                this.audioSource.clip = this.startPlayClip;
                this.audioSource.play();
                this.player2Gotti.setPosition(this.cellMap.get("1").getWorldPosition());
                this.game.addChild(this.player2Gotti);
                this.currPlayer = Player.Player1;
            } else if (this.firstStart && this.currPlayer == Player.Player1) {
                this.player1Turn(diceNumber);
            } else if (this.secondStart && this.currPlayer == Player.Player2) {
                this.player2Turn(diceNumber);
            }
        } else {
            console.log("wait for your turn!");
        }
    }

    player1Turn(diceNumber: number) {
        this.canRollDice = false;
        let finalPosition = this.player1CurrLabel + diceNumber;
        if (diceNumber == 100) {
            console.log("player 1 win");
            this.audioSource.clip = this.winClip;
            this.audioSource.play();
            //here i will also play win audio
        }
        if (finalPosition > 100) {
            let frontStep = 100 - this.player1CurrLabel;
            let remainingStep = diceNumber - frontStep;
            let finalStep = 100 - remainingStep;
            let finalNode = this.cellMap.get(finalStep.toString());
            this.player1Gotti.setWorldPosition(finalNode.getWorldPosition());
        }
        if (this.snakeMap.has(finalPosition)) {
            this.audioSource.clip = this.biteClip;
            this.audioSource.play();
            let snakestartNumber = this.snakeMap.get(finalPosition);
            let snakeStartNode = this.cellMap.get(snakestartNumber.toString());
            let snakeStartPosition = snakeStartNode.getWorldPosition();
            this.player1Gotti.setWorldPosition(snakeStartPosition);
            this.player1CurrLabel = snakestartNumber;
        } else if (this.ladderMap.has(finalPosition)) {
            this.audioSource.clip = this.climbClip;
            this.audioSource.play();
            let ladderEndNumber = this.ladderMap.get(finalPosition);
            let ladderEndNode = this.cellMap.get(ladderEndNumber.toString());
            let ladderEndPosition = ladderEndNode.getWorldPosition();
            this.player1Gotti.setWorldPosition(ladderEndPosition);
            this.player1CurrLabel = ladderEndNumber;
        } else {
            for (let i = 1; i <= diceNumber; i++) {
                this.audioSource.clip = this.jumpClip;
                // this.audioSource.play();
                let newLabel = this.player1CurrLabel + 1;
                this.player1CurrLabel = newLabel;
                console.log("player 1 label", newLabel);
                let newPos = this.cellMap.get(newLabel.toString()).getWorldPosition();

                tween(this.player1Gotti)
                    .to(
                        i,
                        {
                            position: newPos,
                        },
                        {
                            easing: "quadInOut",
                        }
                    )
                    .call(() => this.audioSource.play())

                    .start();
            }
        }
        this.currPlayer = Player.Player2;
        this.canRollDice = true;
    }
    player2Turn(diceNumber: number) {
        this.canRollDice = false;
        if (diceNumber == 100) {
            console.log("player 2 win");
            //here i will also play win audio
        }
        let finalPosition = this.player2CurrLabel + diceNumber;
        if (finalPosition > 100) {
            let frontStep = 100 - this.player1CurrLabel;
            let remainingStep = diceNumber - frontStep;
            let finalStep = 100 - remainingStep;
            let finalNode = this.cellMap.get(finalStep.toString());
            this.player2Gotti.setWorldPosition(finalNode.getWorldPosition());
        }
        if (this.snakeMap.has(finalPosition)) {
            this.audioSource.clip = this.biteClip;
            this.audioSource.play();
            let snakestartNumber = this.snakeMap.get(finalPosition);
            let snakeStartNode = this.cellMap.get(snakestartNumber.toString());
            let snakeStartPosition = snakeStartNode.getWorldPosition();
            this.player2Gotti.setWorldPosition(snakeStartPosition);
            this.player2CurrLabel = snakestartNumber;
        } else if (this.ladderMap.has(finalPosition)) {
            this.audioSource.clip = this.climbClip;
            this.audioSource.play();
            let ladderEndNumber = this.ladderMap.get(finalPosition);
            let ladderEndNode = this.cellMap.get(ladderEndNumber.toString());
            let ladderEndPosition = ladderEndNode.getWorldPosition();
            this.player2Gotti.setWorldPosition(ladderEndPosition);
            this.player2CurrLabel = ladderEndNumber;
        } else {
            this.audioSource.clip = this.jumpClip;
            for (let i = 1; i <= diceNumber; i++) {
                // this.audioSource.play();
                let newLabel = this.player2CurrLabel + 1;
                this.player2CurrLabel = newLabel;
                console.log("player 2 label", newLabel);
                let newPos = this.cellMap.get(newLabel.toString()).getWorldPosition();

                tween(this.player2Gotti)
                    .to(
                        i,
                        {
                            position: newPos,
                        },
                        {
                            easing: "quadInOut",
                        }
                    )
                    .call(() => this.audioSource.play())
                    .start();
            }
        }
        this.currPlayer = Player.Player1;
        this.canRollDice = true;
    }
}
