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
    inputNode: Node = null;
    @property({ type: Prefab })
    cell: Prefab = null;

    @property({ type: Prefab })
    row: Prefab = null;
    @property({ type: EditBoxComponent })
    snakeEditBox: EditBoxComponent = null;

    @property({ type: Label })
    snakeLabel: Label = null;

    @property({ type: EditBoxComponent })
    ladderEditBox: EditBoxComponent = null;

    @property({ type: Label })
    ladderLabel: Label;

    @property({ type: Label })
    errorLabel: Label = null;

    @property({ type: Prefab })
    ladderPrefab: Prefab = null;

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
                row.getComponent(Layout).horizontalDirection =
                    i % 2 == 0 ? Layout.HorizontalDirection.LEFT_TO_RIGHT : Layout.HorizontalDirection.RIGHT_TO_LEFT;
                for (let j = 0; j < 10; j++) {
                    const node = instantiate(this.cell);
                    node.getComponent(customizeSingleCell).setLable(i * 10 + (j + 1));
                    row.addChild(node);
                }
                row.getComponent(UITransform).height = this.designResolution.height / 10;
                row.getComponent(UITransform).width = this.designResolution.width / 10;
                this.node.addChild(row);
            }
            this.custom(parseInt(this.snakeLabel.string), parseInt(this.ladderLabel.string));
        }
    }
    custom(numSnakes: number, numLadders: number) {
        for (let i = 0; i < numSnakes; i++) {
            let start = randomRangeInt(10, 80);
            this.getCordinates(start);
            this.snakes.push(start);
        }

        console.log(this.snakes);
        console.log(this.ladders);
    }

    getCordinates(score: number) {
        const y = (score % 10) - 1;
        const x = parseInt((score / 10 - 1).toString());
        console.log("x", x, "y", y);
    }
}
