import {
    _decorator,
    AudioClip,
    AudioSource,
    AudioSourceComponent,
    color,
    Component,
    director,
    easing,
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
    view,
} from "cc";
import { customizeSingleCell } from "../cell/customizeSingleCell";
import { dice } from "../dice/dice";
import { customizeSingleSnake } from "../snake/customizeSingleSnake";

const { ccclass, property } = _decorator;
const Player = {
    Player1: "player 1",
    Player2: "player 2",
};
@ccclass("board")
export class board extends Component {
    snakeMap: Map<number, number> = new Map<number, number>();
    ladderMap: Map<number, number> = new Map<number, number>();
    generateCellSet: Set<number> = new Set<number>();
    jumpMap: Map<string, boolean> = new Map<string, boolean>();
    currPlayer = Player.Player1;
    canRollDice = true;

    firstStart: boolean = false;
    secondStart: boolean = false;

    player1CurrLabel: number = 0;
    player2CurrLabel: number = 0;

    player1sixes = 0;
    player2sixes = 0;

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

    player1BeforeSixCell;
    player2BeforeSixCell;
    designResolution;

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
        this.designResolution = view.getDesignResolutionSize();
    }

    update(deltaTime: number) {
        if (this.currPlayer == Player.Player1) {
            this.currPlayerLabel.string = "Player 1 Turn";
            this.diceImage.getComponent(Sprite).color = color(15, 175, 15);
        } else {
            this.currPlayerLabel.string = "Player 2 Turn";
            this.diceImage.getComponent(Sprite).color = color(250, 0, 0);
        }
    }
    onClick() {
        if (this.snakeEditBox.string == "" || this.ladderEditBox.string == "") {
            this.errorLabel.string = "Enter Both Fields";
        } else {
            this.game.active = true;
            let totalBoardHeight = this.findEvenMultiple(100, this.designResolution.height);

            this.board.getComponent(UITransform).width = totalBoardHeight;
            console.log("no of snakes", this.snakeEditBox.string, "no of ladders", this.ladderEditBox.string);
            this.inputNode.active = false;
            for (let i = 0; i < 10; i++) {
                let row = instantiate(this.row);

                for (let j = 0; j < 10; j++) {
                    let cellnode = instantiate(this.cell);

                    cellnode.getComponent(customizeSingleCell).setLable(i * 10 + (j + 1), i, this.jumpMap);

                    row.addChild(cellnode);
                    this.cellMap.set(cellnode.getComponent(customizeSingleCell).getLabel(), cellnode);
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
            let start;
            let end;

            do {
                start = randomRangeInt(1, 101);

                end = randomRangeInt(1, 101);
                if (end < start) {
                    let temp = end;
                    end = start;
                    start = temp;
                }
            } while (this.generateCellSet.has(end) || this.generateCellSet.has(start));
            this.generateCellSet.add(end);
            this.generateCellSet.add(start);
            let snake = instantiate(this.snakePrefab);
            this.snakeMap.set(end, start);
            let snakeStartCellNode = this.cellMap.get(start.toString());
            let snakeEndCellNode = this.cellMap.get(end.toString());
            console.log("snake start", start);
            console.log("snakeStartCellNode", snakeStartCellNode.getWorldPosition());
            console.log("snake end", end);
            console.log("snake end cell node", snakeEndCellNode.getWorldPosition());

            let dx = snakeEndCellNode.getWorldPosition().x - snakeStartCellNode.getWorldPosition().x;
            let dy = snakeEndCellNode.getWorldPosition().y - snakeStartCellNode.getWorldPosition().y;
            let diagonalDistance = Math.sqrt(dx * dx + dy * dy);
            snake.getComponent(customizeSingleSnake).setSnake(93, diagonalDistance);
            snake.setWorldPosition(snakeStartCellNode.getWorldPosition());

            let angleRadians = Math.atan2(dy, dx);
            let angleDegrees = angleRadians * (180 / Math.PI);
            snake.eulerAngles = new Vec3(0, 0, -(90 - angleDegrees));
            this.game.addChild(snake);
        }
    }
    generateLadders(numLadders: number) {
        this.board.getComponent(Layout).updateLayout();
        for (let i = 0; i < numLadders; i++) {
            let start;
            let end;
            let ladder = instantiate(this.ladderPrefab);
            do {
                start = randomRangeInt(1, 101);

                end = randomRangeInt(1, 101);
                if (end < start) {
                    let temp = end;
                    end = start;
                    start = temp;
                }
            } while (this.generateCellSet.has(end) || this.generateCellSet.has(start));
            this.generateCellSet.add(end);
            this.generateCellSet.add(start);
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
            } else if (diceNumber == 6 && this.currPlayer == Player.Player1 && this.firstStart) {
                this.player1BeforeSixCell = this.player1CurrLabel;
                this.player1sixes = this.player1sixes + 1;
                if (this.player1sixes == 3) {
                    this.player1Gotti.setPosition(this.cellMap.get(this.player1BeforeSixCell).getWorldPosition());
                }
                this.player1sixes = 0;
                this.player1Turn(diceNumber, Player.Player1);
            } else if (diceNumber == 6 && this.currPlayer == Player.Player2 && this.secondStart) {
                this.player2BeforeSixCell = this.player2CurrLabel;
                this.player2sixes = this.player2sixes + 1;
                if (this.player2sixes == 3) {
                    this.player2Gotti.setPosition(this.cellMap.get(this.player2BeforeSixCell).getWorldPosition());
                }
                this.player2sixes = 0;
                this.player2Turn(diceNumber, Player.Player2);
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
                this.player1Turn(diceNumber, Player.Player2);
            } else if (this.secondStart && this.currPlayer == Player.Player2) {
                this.player2Turn(diceNumber, Player.Player1);
            }
        } else {
            console.log("wait for your turn");
        }
    }

    player1Turn(diceNumber: number, nextPlayer) {
        let finalPosition = this.player1CurrLabel + diceNumber;
        if (this.finalCell(finalPosition)) {
            this.finalCellFunction(this.player1Gotti, this.currPlayer);
        } else if (finalPosition > 100) {
            let frontStep = 100 - this.player1CurrLabel;
            let remainingStep = diceNumber - frontStep;
            let finalStep = 100 - remainingStep;
            let finalNode = this.cellMap.get(finalStep.toString());
            this.currPlayer = nextPlayer;
            this.movePlayer(this.player1CurrLabel, this.player1Gotti, frontStep, finalPosition, () => {
                this.reverseMovePlayer(100, this.player1Gotti, remainingStep, finalPosition, () => {
                    this.player1CurrLabel = finalStep;
                    if (this.checkSnake(this.player1CurrLabel)) {
                        let snakestartNumber = this.snakeMap.get(finalPosition);
                        this.bite(this.player1CurrLabel, this.player1Gotti, finalPosition, diceNumber, nextPlayer);
                        this.player1CurrLabel = snakestartNumber;
                    }
                    if (this.checkLadder(this.player1CurrLabel)) {
                        let ladderEndNumber = this.ladderMap.get(finalPosition);
                        this.climb(this.player1CurrLabel, this.player1Gotti, finalPosition, diceNumber, nextPlayer);
                        this.player1CurrLabel = ladderEndNumber;
                    }
                });
            });
        } else if (this.checkSnake(finalPosition)) {
            let snakestartNumber = this.snakeMap.get(finalPosition);
            this.bite(this.player1CurrLabel, this.player1Gotti, finalPosition, diceNumber, nextPlayer);
            this.player1CurrLabel = snakestartNumber;
        } else if (this.checkLadder(finalPosition)) {
            let ladderEndNumber = this.ladderMap.get(finalPosition);
            this.climb(this.player1CurrLabel, this.player1Gotti, finalPosition, diceNumber, nextPlayer);
            this.player1CurrLabel = ladderEndNumber;
        } else {
            this.movePlayer(this.player1CurrLabel, this.player1Gotti, diceNumber, finalPosition, () => {
                this.currPlayer = nextPlayer;
            });
            this.player1CurrLabel = finalPosition;
        }
    }

    player2Turn(diceNumber: number, nextPlayer: string) {
        let finalPosition = this.player2CurrLabel + diceNumber;
        if (this.finalCell(finalPosition)) {
            this.finalCellFunction(this.player2Gotti, this.currPlayer);
        } else if (finalPosition > 100) {
            let frontStep = 100 - this.player2CurrLabel;
            let remainingStep = diceNumber - frontStep;
            let finalStep = 100 - remainingStep;
            let finalNode = this.cellMap.get(finalStep.toString());
            this.currPlayer = nextPlayer;
            this.movePlayer(this.player1CurrLabel, this.player1Gotti, frontStep, finalPosition, () => {
                this.reverseMovePlayer(100, this.player2Gotti, remainingStep, finalPosition, () => {
                    this.player2CurrLabel = finalStep;
                    if (this.checkSnake(this.player2CurrLabel)) {
                        let snakestartNumber = this.snakeMap.get(finalPosition);
                        this.bite(this.player2CurrLabel, this.player2Gotti, finalPosition, diceNumber, nextPlayer);
                        this.player2CurrLabel = snakestartNumber;
                    }
                    if (this.checkLadder(this.player2CurrLabel)) {
                        let ladderEndNumber = this.ladderMap.get(finalPosition);
                        this.climb(this.player2CurrLabel, this.player2Gotti, finalPosition, diceNumber, nextPlayer);
                        this.player2CurrLabel = ladderEndNumber;
                    }
                });
            });

            this.player2Gotti.setWorldPosition(finalNode.getWorldPosition());
        } else if (this.checkSnake(finalPosition)) {
            let snakestartNumber = this.snakeMap.get(finalPosition);
            this.bite(this.player2CurrLabel, this.player2Gotti, finalPosition, diceNumber, nextPlayer);
            this.player2CurrLabel = snakestartNumber;
        } else if (this.checkLadder(finalPosition)) {
            let ladderEndNumber = this.ladderMap.get(finalPosition);
            this.climb(this.player2CurrLabel, this.player2Gotti, finalPosition, diceNumber, nextPlayer);
            this.player2CurrLabel = ladderEndNumber;
        } else {
            this.movePlayer(this.player2CurrLabel, this.player2Gotti, diceNumber, finalPosition, () => {
                this.currPlayer = nextPlayer;
            });
            this.player2CurrLabel = finalPosition;
        }
    }

    reverseMovePlayer(
        currLable: number,
        playerNode: Node,
        remainingMoves: number,
        finalPosition: number,
        callback: () => void
    ) {
        if (remainingMoves <= 0) {
            callback();
            this.canRollDice = true;
            return;
        }
        this.canRollDice = false;
        let newLabel = currLable - 1;

        console.log("player label", newLabel);
        let newPos = this.cellMap.get(newLabel.toString()).getWorldPosition();
        tween(playerNode)
            .to(
                0.3,
                {
                    position: new Vec3(newPos.x - 35, newPos.y + 15, newPos.z),
                },
                {
                    easing: "quadInOut",
                }
            )
            .to(
                0.3,
                {
                    position: new Vec3(newPos.x, newPos.y, newPos.z),
                },
                { easing: "quadInOut" }
            )
            .call(() => {
                this.audioSource.play();
                this.movePlayer(currLable - 1, playerNode, remainingMoves - 1, finalPosition, callback);
            })
            .start();
    }
    movePlayer(
        currLable: number,
        playerNode: Node,
        remainingMoves: number,
        finalPosition: number,
        callback: () => void
    ) {
        if (remainingMoves <= 0) {
            callback();
            this.canRollDice = true;
            return;
        }
        this.canRollDice = false;
        let newLabel = currLable + 1;

        console.log("player label", newLabel);
        let newPos = this.cellMap.get(newLabel.toString()).getWorldPosition();
        let isMultiple = currLable % 10 == 0;
        tween(playerNode)
            .to(
                0.3,
                {
                    // position: new Vec3(newPos.x - 35, newPos.y + 15, newPos.z),
                    position: isMultiple
                        ? new Vec3(newPos.x, newPos.y, newPos.z)
                        : this.jumpMap.get(currLable.toString())
                        ? new Vec3(newPos.x - 35, newPos.y + 15, newPos.z)
                        : new Vec3(newPos.x + 35, newPos.y + 15, newPos.z),
                },
                {
                    easing: "sineIn",
                }
            )
            .to(
                0.3,
                {
                    position: new Vec3(newPos.x, newPos.y, newPos.z),
                },
                { easing: "sineOut" }
            )
            .call(() => {
                this.audioSource.play();
                this.movePlayer(currLable + 1, playerNode, remainingMoves - 1, finalPosition, callback);
            })
            .start();
    }

    findEvenMultiple(x: number, y: number) {
        if (y % x === 0) {
            return y - x;
        }

        return Math.floor(y / x) * x;
    }

    playTween(target: Node, newPos: Vec3, nextPlayer: string) {
        tween(target)
            .to(1, { position: newPos })
            .call(() => (this.currPlayer = nextPlayer))
            .start();
    }

    finalCell(finalPosition: number) {
        if (finalPosition == 100) {
            return true;
        }
        return false;
    }

    checkSnake(position) {
        if (this.snakeMap.has(position)) return true;
        return false;
    }
    checkLadder(position) {
        if (this.ladderMap.has(position)) return true;
        return false;
    }

    finalCellFunction(currGotti: Node, currPlayer: string) {
        this.audioSource.clip = this.winClip;
        tween(currGotti)
            .to(1, { position: this.cellMap.get("100").getWorldPosition() }, { easing: "quadInOut" })
            .call(() => {
                this.audioSource.play();
                director.loadScene("win");
            })
            .start();
    }

    bite(currLable: number, currGotti: Node, finalPosition: number, diceNumber: number, nextPlayer: string) {
        this.audioSource.clip = this.biteClip;
        this.audioSource.play();
        let snakestartNumber = this.snakeMap.get(finalPosition);
        let snakeStartNode = this.cellMap.get(snakestartNumber.toString());
        let snakeStartPosition = snakeStartNode.getWorldPosition();
        this.movePlayer(currLable, currGotti, diceNumber, finalPosition, () => {
            this.playTween(currGotti, snakeStartPosition, nextPlayer);
        });
        this.audioSource.clip = this.jumpClip;

        currLable = snakestartNumber;
        this.currPlayer = nextPlayer;
    }
    climb(currLable: number, currGotti: Node, finalPosition: number, diceNumber: number, nextPlayer: string) {
        this.audioSource.clip = this.climbClip;
        this.audioSource.play();
        let ladderEndNumber = this.ladderMap.get(finalPosition);
        let ladderEndNode = this.cellMap.get(ladderEndNumber.toString());
        let ladderEndPosition = ladderEndNode.getWorldPosition();
        this.movePlayer(currLable, currGotti, diceNumber, finalPosition, () => {
            this.playTween(currGotti, ladderEndPosition, nextPlayer);
        });
        this.audioSource.clip = this.jumpClip;

        currLable = ladderEndNumber;
        this.currPlayer = nextPlayer;
    }
}
