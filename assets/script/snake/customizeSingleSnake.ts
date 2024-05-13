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
        let middlePartHeight =
            y - (this.head.getComponent(UITransform).height + this.tail.getComponent(UITransform).height);
        let remainingHeight: number;
        let headAndTailHeight: number;
        console.log("total height", y);
        let middleHeight = this.findEvenMultiple(x, middlePartHeight);

        this.middle.getComponent(UITransform).height = middleHeight;
        remainingHeight = this.remainder(x, middlePartHeight);
        this.tail.getComponent(UITransform).height = this.tail.getComponent(UITransform).height + remainingHeight;
        console.log("head height", this.head.getComponent(UITransform).height);
        console.log("middle height", this.middle.getComponent(UITransform).height);
        console.log("tail height", this.tail.getComponent(UITransform).height);
    }
    findEvenMultiple(x: number, y: number) {
        if (y % x === 0) {
            return y - x;
        }

        return Math.floor(y / x) * x;
    }
    remainder(x: number, y: number) {
        return y % x;
    }
}
