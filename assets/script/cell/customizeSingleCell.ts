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
    setLable(count: number) {
        this.designResolution = view.getDesignResolutionSize();

        this.node.getComponent(UITransform).height = 70;
        this.node.getComponent(UITransform).width = 70;

        this.label.string = count.toString();
        this.label.color = count % 2 == 0 ? Color.BLUE : Color.YELLOW;

        this.image.spriteFrame = count % 2 == 0 ? this.yellow : this.blue;
    }

    getLabel() {
        return this.label.string;
    }
}
