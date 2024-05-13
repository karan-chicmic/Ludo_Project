import {
    _decorator,
    color,
    Color,
    Component,
    Label,
    math,
    Node,
    Sprite,
    SpriteFrame,
    UIStaticBatch,
    UITransform,
    view,
} from "cc";
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
        let cellHeight = (this.designResolution.height * 80) / 1000;
        let cellWidth = (this.designResolution.width * 80) / 1000;
        this.node.getComponent(UITransform).height = cellHeight;
        this.node.getComponent(UITransform).width = cellWidth;

        this.label.string = count.toString();
        this.label.color = count % 2 == 0 ? Color.BLUE : Color.YELLOW;

        this.image.spriteFrame = count % 2 == 0 ? this.yellow : this.blue;
    }

    getLabel() {
        return this.label.string;
    }
}
