import { _decorator, Component, director, instantiate, Layout, math, Node, Prefab, UITransform, view } from "cc";
import { customizeSingleCell } from "../cell/customizeSingleCell";
const { ccclass, property } = _decorator;

@ccclass("board")
export class board extends Component {
    designResolution: math.Size;
    rowNo = 0;
    @property({ type: Prefab })
    cell: Prefab = null;
    @property({ type: Prefab })
    row: Prefab = null;
    start() {
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
    }

    update(deltaTime: number) {}
}
