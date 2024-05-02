import { _decorator, Component, director, instantiate, Layout, Node, Prefab, UITransform, view } from "cc";
import { customizeSingleCell } from "../cell/customizeSingleCell";
const { ccclass, property } = _decorator;

@ccclass("board")
export class board extends Component {
    @property({ type: Prefab })
    cell: Prefab = null;
    start() {
        for (let i = 1; i <= 100; i++) {
            const node = instantiate(this.cell);
            node.getComponent(customizeSingleCell).setLable(i);

            this.node.insertChild(node, i);
            // this.node.getComponent(Layout).horizontalDirection = Layout.HorizontalDirection.LEFT_TO_RIGHT;
        }
    }

    update(deltaTime: number) {}
}
