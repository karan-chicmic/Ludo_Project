import {
    _decorator,
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
    UITransform,
    view,
} from "cc";
import { customizeSingleCell } from "../cell/customizeSingleCell";

const { ccclass, property } = _decorator;

@ccclass("board")
export class board extends Component {
    snakes: number[] = [];
    ladders: number[] = [];

    cells: { i: number; j: number; label: string }[] = [];
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

    cordintates = {
        height: 0,
        width: 0,
    };
    start() {}

    update(deltaTime: number) {}
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
            console.log("snakeStartCellNode", snakeStartCellNode.getPosition());
            snake.setPosition(snakeStartCellNode.getWorldPosition());
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
            this.game.addChild(ladder);
        }
    }
}
