import { _decorator, Color, Component, Label, math, Sprite, SpriteFrame, UITransform, view } from "cc";
const { ccclass, property } = _decorator;

@ccclass("customizeSingleCell")
export class customizeSingleCell extends Component {
    @property({ type: Label })
    label: Label = null;

    @property({ type: Sprite })
    image: Sprite = null;

    @property({ type: SpriteFrame })
    yellow: SpriteFrame = null;

    @property({ type: SpriteFrame })
    blue: SpriteFrame = null;

    designResolution: math.Size;
    start() {}

    update(deltaTime: number) {}
    setLable(count: number, i: number, jumpMap: Map<string, boolean>) {
        this.designResolution = view.getDesignResolutionSize();
        let totalHeight = this.findEvenMultiple(100, this.designResolution.height);
        let cellHeight = totalHeight / 10;

        this.node.getComponent(UITransform).height = cellHeight;
        this.node.getComponent(UITransform).width = cellHeight;

        this.label.string = count.toString();
        this.label.color = count % 2 == 0 ? Color.BLUE : Color.YELLOW;

        this.image.spriteFrame = count % 2 == 0 ? this.yellow : this.blue;
        if (i % 2 == 0) {
            jumpMap.set(this.label.string, true);
        } else {
            jumpMap.set(this.label.string, false);
        }
    }

    getLabel() {
        return this.label.string;
    }
    findEvenMultiple(x: number, y: number) {
        if (y % x === 0) {
            return y - x;
        }

        return Math.floor(y / x) * x;
    }
}
