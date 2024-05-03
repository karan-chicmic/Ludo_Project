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
    designResolution: math.Size;
    rowNo = 0;
    cells: { i: number; j: number; label: string }[] = [];

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
            console.log(this.snakeEditBox.string, this.ladderEditBox.string);
            this.inputNode.active = false;
            this.designResolution = view.getDesignResolutionSize();
            for (let i = 0; i < 10; i++) {
                const row = instantiate(this.row);

                for (let j = 0; j < 10; j++) {
                    const node = instantiate(this.cell);
                    node.getComponent(customizeSingleCell).setLable(i * 10 + (j + 1));
                    row.addChild(node);
                }
                row.getComponent(Layout).horizontalDirection =
                    i % 2 == 0 ? Layout.HorizontalDirection.LEFT_TO_RIGHT : Layout.HorizontalDirection.RIGHT_TO_LEFT;
                this.board.addChild(row);
            }
            this.custom(parseInt(this.snakeLabel.string), parseInt(this.ladderLabel.string), this.designResolution);
        }
    }
    custom(numSnakes: number, numLadders: number, designResolution: math.Size) {
        for (let i = 0; i < numSnakes; i++) {
            const snake = instantiate(this.snakePrefab);
            let start = randomRangeInt(10, 80);
            const cordintates = this.getCordinates(start, designResolution);

            this.snakes.push(start);
            snake.setPosition(cordintates.width, cordintates.height);
            this.game.addChild(snake);
            console.log("cordinates", cordintates);
        }
        for (let i = 0; i < numLadders; i++) {
            const ladder = instantiate(this.ladderPrefab);
            let start = randomRangeInt(10, 80);
            const cordintates = this.getCordinates(start, designResolution);

            this.snakes.push(start);
            ladder.setPosition(cordintates.width, cordintates.height);
            this.game.addChild(ladder);
            console.log("cordinates", cordintates);
        }
    }

    getCordinates(score: number, designResolution: math.Size) {
        const y = (score % 10) - 1;
        const x = parseInt((score / 10 - 1).toString());
        console.log("x", x, "y", y);
        if (x % 2 == 0) {
            this.cordintates.width = (designResolution.width / 10) * (10 - y);
            this.cordintates.height = (designResolution.height / 10) * x;
            return this.cordintates;
        } else {
            this.cordintates.width = designResolution.width / 10;
            this.cordintates.height = (designResolution.height / 10) * x;
            return this.cordintates;
        }
    }
}
