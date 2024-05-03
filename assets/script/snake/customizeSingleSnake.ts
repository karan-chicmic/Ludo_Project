import { _decorator, Component, Node, randomRangeInt, Sprite, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("customizeSingleSnake")
export class customizeSingleSnake extends Component {
    @property({ type: [SpriteFrame] })
    snakeArray: [SpriteFrame] | [] = [];

    @property({ type: Sprite })
    snake: Sprite = null;
    start() {}

    update(deltaTime: number) {}

    setSnake() {
        this.snake.spriteFrame = this.snakeArray[randomRangeInt(0, this.snakeArray.length)];
    }
}
