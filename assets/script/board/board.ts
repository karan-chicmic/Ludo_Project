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
    UITransform,
    view,
} from "cc";
import { customizeSingleCell } from "../cell/customizeSingleCell";
import { customizeSingleLadder } from "../ladder/customizeSingleLadder";

const { ccclass, property } = _decorator;

@ccclass("board")
export class board extends Component {
    designResolution: math.Size;
    rowNo = 0;

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
                for (let j = 1; j <= 10; j++) {
                    const node = instantiate(this.cell);
                    node.getComponent(customizeSingleCell).setLable(i * 10 + j);
                    row.addChild(node);
                }
                row.getComponent(UITransform).height = this.designResolution.height / 10;
                row.getComponent(UITransform).width = this.designResolution.width / 10;
                this.node.addChild(row);
            }

            // for (let i = 0; i < parseInt(this.ladderEditBox.string); i++) {
            //     const ladder = instantiate(this.ladderPrefab);
            //     ladder.getComponent(customizeSingleLadder).setLadder();
            // }
        }
    }
}
