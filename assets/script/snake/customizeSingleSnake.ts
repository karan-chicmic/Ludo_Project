import { _decorator, Component, Node, randomRangeInt, Sprite, SpriteFrame, UITransform } from "cc";
const { ccclass, property } = _decorator;

@ccclass("customizeSingleSnake")
export class customizeSingleSnake extends Component {
    @property({ type: Node })
    head: Node = null;
    @property({ type: Node })
    middle: Node = null;
    @property({ type: Node })
    tail: Node = null;

    start() {}

    update(deltaTime: number) {}

    setSnake(x: number, y: number) {
        console.log("total height", y);
        let middleHeight = this.findEvenMultiple(x, y);
        console.log("middle height", middleHeight);
        this.middle.getComponent(UITransform).height = middleHeight;
        let remainingHeight = y - middleHeight;
        let headAndTailHeight = remainingHeight / 2;
        this.head.getComponent(UITransform).setAnchorPoint(0.2, 0.5);
        this.head.getComponent(UITransform).height = headAndTailHeight;
        console.log("head height", headAndTailHeight);
        this.tail.getComponent(UITransform).height = headAndTailHeight;
    }
    findEvenMultiple(x: number, y: number) {
        if (y % x === 0) {
            return y - x;
        }

        return Math.floor(y / x) * x;
    }
}
