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
    canCurrPlayerRollDice = true;

    firstStart: boolean = false;
    secondStart: boolean = false;

    moveOnlyBackward: boolean = false;

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
    restartGame = false;

    start() {
        this.audioSource = this.node.getComponent(AudioSource);
        this.designResolution = view.getDesignResolutionSize();
    }

    update(deltaTime: number) {
        if (this.restartGame == true) {
            director.loadScene("main");
        }
        if (this.currPlayer == Player.Player1) {
            this.currPlayerLabel.string = "Player 1 Turn";
            this.diceImage.getComponent(Sprite).color = color(15, 175, 15);
        } else {
            this.currPlayerLabel.string = "Player 2 Turn";
            this.diceImage.getComponent(Sprite).color = color(250, 0, 0);
        }
    }
    generateSnakesAndLadders(
        boardSize: number,
        numSnakes: number,
        numLadders: number,
        minDifference: number,
        restartGame: boolean
    ) {
        const positions = new Set<string>();
        const usedNumbers = new Set<number>();
        const snakes: Array<{ start: number; end: number }> = [];
        const ladders: Array<{ start: number; end: number }> = [];
        let count = 0;

        function generatePosition(): { start: number; end: number; restartGame: boolean } {
            while (true) {
                if (numLadders + numSnakes > 49) {
                    restartGame = true;
                }
                count = count + 1;
                if (count >= 15000) {
                    alert("cannot generate all possible combinations");
                    director.loadScene("main");
                    return;
                }
                let start = Math.floor(Math.random() * boardSize) + 1;
                if (start == 100) {
                    continue;
                }
                // let start = randomRangeInt(0, 99);
                if (usedNumbers.has(start)) {
                    continue;
                }

                let endOptions: number[] = [];
                for (let i = 1; i < start - minDifference; i++) {
                    if (!usedNumbers.has(i)) {
                        endOptions.push(i);
                    }
                }
                for (let i = start + minDifference; i <= boardSize; i++) {
                    if (!usedNumbers.has(i)) {
                        endOptions.push(i);
                    }
                }
                if (endOptions.length === 0) {
                    continue;
                }
                let end = endOptions[Math.floor(Math.random() * endOptions.length)];
                if (end == 100) {
                    continue;
                }
                const positionKey = `${start}-${end}`;
                const reversePositionKey = `${end}-${start}`;
                if (!positions.has(positionKey) && !positions.has(reversePositionKey)) {
                    positions.add(positionKey);
                    usedNumbers.add(start);
                    usedNumbers.add(end);
                    if (end < start) {
                        let temp = start;
                        start = end;
                        end = temp;
                    }
                    return { start, end, restartGame };
                }
            }
        }

        for (let i = 0; i < numSnakes; i++) {
            const { start, end, restartGame } = generatePosition();
            if (restartGame) {
                break;
            }
            snakes.push({ start, end });
        }

        for (let i = 0; i < numLadders; i++) {
            const { start, end, restartGame } = generatePosition();
            if (restartGame) {
                alert("total sum of snake and ladder should not be greater than 49");
                director.loadScene("main");
                break;
            }
            ladders.push({ start, end });
        }

        return { snakes, ladders };
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

            const { snakes, ladders } = this.generateSnakesAndLadders(
                100,
                parseInt(this.snakeEditBox.string),
                parseInt(this.ladderEditBox.string),
                10,
                this.restartGame
            );

            console.log("Snakes:");
            snakes.forEach((snake) => {
                console.log(`Start: ${snake.start}, End: ${snake.end}`);
                let snakeNode = instantiate(this.snakePrefab);
                this.snakeMap.set(snake.end, snake.start);
                let snakeStartCellNode = this.cellMap.get(snake.start.toString());
                let snakeEndCellNode = this.cellMap.get(snake.end.toString());
                console.log("snake start", snake.start);
                console.log("snakeStartCellNode", snakeStartCellNode.getWorldPosition());
                console.log("snake end", snake.end);
                console.log("snake end cell node", snakeEndCellNode.getWorldPosition());

                let dx = snakeEndCellNode.getWorldPosition().x - snakeStartCellNode.getWorldPosition().x;
                let dy = snakeEndCellNode.getWorldPosition().y - snakeStartCellNode.getWorldPosition().y;
                let diagonalDistance = Math.sqrt(dx * dx + dy * dy);
                snakeNode.getComponent(customizeSingleSnake).setSnake(93, diagonalDistance);
                snakeNode.setWorldPosition(snakeStartCellNode.getWorldPosition());

                let angleRadians = Math.atan2(dy, dx);
                let angleDegrees = angleRadians * (180 / Math.PI);
                snakeNode.eulerAngles = new Vec3(0, 0, -(90 - angleDegrees));
                this.game.addChild(snakeNode);
            });

            console.log("\nLadders:");
            ladders.forEach((ladder) => {
                console.log(`Start: ${ladder.start}, End: ${ladder.end}`);
                let ladderNode = instantiate(this.ladderPrefab);
                this.ladderMap.set(ladder.start, ladder.end);
                let ladderStartCellNode = this.cellMap.get(ladder.start.toString());
                let ladderEndCellNode = this.cellMap.get(ladder.end.toString());

                console.log("ladder start", ladder.start);
                console.log("ladderStartCellNode", ladderStartCellNode.getWorldPosition());
                console.log("ladder end", ladder.end);
                console.log("ladder end cell node", ladderEndCellNode.getWorldPosition());

                let dx = ladderEndCellNode.getWorldPosition().x - ladderStartCellNode.getWorldPosition().x;
                let dy = ladderEndCellNode.getWorldPosition().y - ladderStartCellNode.getWorldPosition().y;
                let diagonalDistance = Math.sqrt(dx * dx + dy * dy);

                ladderNode.getComponent(UITransform).height = diagonalDistance;

                let angleRadians = Math.atan2(dy, dx);
                let angleDegrees = angleRadians * (180 / Math.PI);
                ladderNode.eulerAngles = new Vec3(0, 0, -(90 - angleDegrees));

                ladderNode.setWorldPosition(ladderStartCellNode.getWorldPosition());

                this.game.addChild(ladderNode);
            });

            // this.generateSnakes(parseInt(this.snakeEditBox.string));
            // this.generateLadders(parseInt(this.ladderEditBox.string));
        }
    }

    rollDice() {
        if (this.canRollDice && this.canCurrPlayerRollDice) {
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
                if (this.checkLadder(1)) {
                    let endPosition = this.ladderMap.get(1);
                    let endCell = this.cellMap.get(endPosition.toString()).worldPosition;
                    this.playTween(this.player1Gotti, endCell, Player.Player2);
                    this.player1CurrLabel = endPosition;
                }
                this.currPlayer = Player.Player2;
            } else if (diceNumber == 6 && this.currPlayer == Player.Player2 && !this.secondStart) {
                this.secondStart = true;
                this.player2CurrLabel = 1;
                console.log("player 2 first 6", this.cellMap.get("1").getWorldPosition());
                this.audioSource.clip = this.startPlayClip;
                this.audioSource.play();
                this.player2Gotti.setPosition(this.cellMap.get("1").getWorldPosition());
                this.game.addChild(this.player2Gotti);
                if (this.checkLadder(1)) {
                    let endPosition = this.ladderMap.get(1);
                    let endCell = this.cellMap.get(endPosition.toString()).worldPosition;
                    this.playTween(this.player2Gotti, endCell, Player.Player1);
                    this.player2CurrLabel = endPosition;
                }

                this.currPlayer = Player.Player1;
            } else if (this.firstStart && this.currPlayer == Player.Player1) {
                this.player1Turn(diceNumber, Player.Player2);
            } else if (this.secondStart && this.currPlayer == Player.Player2) {
                this.player2Turn(diceNumber, Player.Player1);
            }
        } else {
            if (!this.canRollDice) {
                alert("wait");
                return;
            }
            if (!this.canCurrPlayerRollDice) {
                alert("wait");
                return;
            }
        }
    }

    player1Turn(diceNumber: number, nextPlayer) {
        let finalPosition = this.player1CurrLabel + diceNumber;
        if (this.finalCell(finalPosition)) {
            this.finalCellFunction(this.player1CurrLabel, this.player1Gotti, this.currPlayer, diceNumber);
        } else if (finalPosition > 100) {
            let frontStep = 100 - this.player1CurrLabel;
            let remainingStep = diceNumber - frontStep;
            let backStep = 100 - remainingStep;
            this.movePlayer(this.player1CurrLabel, this.player1Gotti, diceNumber, () => {
                this.player1CurrLabel = backStep;
                this.moveOnlyBackward = false;
                this.currPlayer = nextPlayer;
                console.log("player 1 final label", this.player1CurrLabel);
                if (this.checkSnake(this.player1CurrLabel)) {
                    let end = this.snakeMap.get(this.player1CurrLabel);
                    tween(this.player1Gotti)
                        .to(1, {
                            position: this.cellMap.get(end.toString()).getWorldPosition(),
                        })
                        .call(() => (this.player1CurrLabel = end))
                        .start();
                }
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
            this.movePlayer(this.player1CurrLabel, this.player1Gotti, diceNumber, () => {
                this.currPlayer = nextPlayer;
            });
            this.player1CurrLabel = finalPosition;
        }
    }

    player2Turn(diceNumber: number, nextPlayer: string) {
        let finalPosition = this.player2CurrLabel + diceNumber;
        if (this.finalCell(finalPosition)) {
            this.finalCellFunction(this.player2CurrLabel, this.player2Gotti, this.currPlayer, diceNumber);
        } else if (finalPosition > 100) {
            let frontStep = 100 - this.player2CurrLabel;
            let remainingStep = diceNumber - frontStep;
            let backStep = 100 - remainingStep;
            this.movePlayer(this.player2CurrLabel, this.player2Gotti, diceNumber, () => {
                this.player2CurrLabel = backStep;
                this.moveOnlyBackward = false;
                this.currPlayer = nextPlayer;
                console.log("player 2 final label", this.player2CurrLabel);
                if (this.checkSnake(this.player2CurrLabel)) {
                    let end = this.snakeMap.get(this.player2CurrLabel);
                    tween(this.player2Gotti)
                        .to(1, {
                            position: this.cellMap.get(end.toString()).getWorldPosition(),
                        })
                        .call(() => (this.player2CurrLabel = end))
                        .start();
                }
            });
        } else if (this.checkSnake(finalPosition)) {
            let snakestartNumber = this.snakeMap.get(finalPosition);
            this.bite(this.player2CurrLabel, this.player2Gotti, finalPosition, diceNumber, nextPlayer);
            this.player2CurrLabel = snakestartNumber;
        } else if (this.checkLadder(finalPosition)) {
            let ladderEndNumber = this.ladderMap.get(finalPosition);
            this.climb(this.player2CurrLabel, this.player2Gotti, finalPosition, diceNumber, nextPlayer);
            this.player2CurrLabel = ladderEndNumber;
        } else {
            this.movePlayer(this.player2CurrLabel, this.player2Gotti, diceNumber, () => {
                this.currPlayer = nextPlayer;
            });
            this.player2CurrLabel = finalPosition;
        }
    }

    movePlayer(
        currLabel: number,
        playerNode: Node,
        remainingMoves: number,

        callback: () => void
    ) {
        if (remainingMoves <= 0) {
            callback();
            this.canRollDice = true;
            this.canCurrPlayerRollDice = true;
            return;
        }
        this.canRollDice = false;
        this.canCurrPlayerRollDice = false;

        let newLabel: number;
        let isMovingBackward = currLabel === 100 && remainingMoves > 0;

        if (this.moveOnlyBackward) {
            newLabel = currLabel - 1;
        } else if (isMovingBackward) {
            this.moveOnlyBackward = true;
            newLabel = currLabel - 1;
        } else {
            newLabel = currLabel + 1;
        }

        console.log("player label", newLabel);
        let newPos = this.cellMap.get(newLabel.toString()).getWorldPosition();
        let isMultiple = currLabel % 10 === 0;

        tween(playerNode)
            .to(
                0.3,
                {
                    position: isMultiple
                        ? new Vec3(newPos.x, newPos.y, newPos.z)
                        : this.jumpMap.get(currLabel.toString())
                        ? new Vec3(newPos.x - 35, newPos.y + 15, newPos.z)
                        : this.moveOnlyBackward
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
                if (this.moveOnlyBackward) {
                    console.log("if called");
                    this.movePlayer(currLabel - 1, playerNode, remainingMoves - 1, callback);
                } else if (isMovingBackward) {
                    console.log("else if called");
                    this.movePlayer(currLabel - 1, playerNode, remainingMoves - 1, callback);
                } else {
                    console.log("else called");
                    this.movePlayer(currLabel + 1, playerNode, remainingMoves - 1, callback);
                }
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

    checkSnake(position: number) {
        if (this.snakeMap.has(position)) return true;
        return false;
    }
    checkLadder(position: number) {
        if (this.ladderMap.has(position)) return true;
        return false;
    }

    finalCellFunction(currLabel, currGotti: Node, currPlayer: string, diceNumber) {
        this.audioSource.clip = this.winClip;
        this.movePlayer(currLabel, currGotti, diceNumber, () => {
            director.loadScene("win");
        });
    }

    bite(currLable: number, currGotti: Node, finalPosition: number, diceNumber: number, nextPlayer: string) {
        this.audioSource.clip = this.biteClip;
        this.audioSource.play();
        let snakestartNumber = this.snakeMap.get(finalPosition);
        let snakeStartNode = this.cellMap.get(snakestartNumber.toString());
        let snakeStartPosition = snakeStartNode.getWorldPosition();
        this.movePlayer(currLable, currGotti, diceNumber, () => {
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
        this.movePlayer(currLable, currGotti, diceNumber, () => {
            this.playTween(currGotti, ladderEndPosition, nextPlayer);
        });
        this.audioSource.clip = this.jumpClip;
        if (this.finalCell(finalPosition)) {
            this.playTween(currGotti, this.cellMap.get("100").worldPosition, nextPlayer);
            director.loadScene("win");
        }
        currLable = ladderEndNumber;
        this.currPlayer = nextPlayer;
    }
}
