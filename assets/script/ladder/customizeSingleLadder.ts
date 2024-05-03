import { _decorator, Component, Node, randomRangeInt, Sprite, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("customizeSingleLadder")
export class customizeSingleLadder extends Component {
    @property({ type: [SpriteFrame] })
    ladderArray: [SpriteFrame] | [] = [];

    @property({ type: Sprite })
    ladder: Sprite = null;
    start() {}

    update(deltaTime: number) {}

    setLadder() {
        this.ladder.spriteFrame = this.ladderArray[randomRangeInt(0, this.ladderArray.length)];
    }
}
