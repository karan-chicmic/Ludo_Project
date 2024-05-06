import { _decorator, Component, Node, randomRangeInt, Sprite, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("dice")
export class dice extends Component {
    @property({ type: [SpriteFrame] })
    diceArray: [SpriteFrame] | [] = [];

    @property({ type: Sprite })
    diceImage: Sprite = null;

    start() {}

    update(deltaTime: number) {}

    rollDice() {
        this.diceImage.spriteFrame = this.diceArray[randomRangeInt(0, this.diceArray.length)];
    }
}
