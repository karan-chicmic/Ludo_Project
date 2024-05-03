import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ladderSnake")
export class ladderSnake extends Component {
    snakes: { start: number; end: number }[] = [];
    ladders: { start: number; end: number }[] = [];

    start() {}

    update(deltaTime: number) {}

    custom(numSnakes: number, numLadders: number) {
        for (let i = 0; i < numSnakes; i++) {
            let start = Math.floor(Math.random() * 100);
            let end = Math.floor(Math.random() * 100);
            while (end <= start || this.snakes.some((snake) => snake.start === end)) {
                end = Math.floor(Math.random() * 100);
            }
            this.snakes.push({ start, end });
        }
        for (let i = 0; i < numLadders; i++) {
            let start = Math.floor(Math.random() * 100);
            let end = Math.floor(Math.random() * 100);
            while (end <= start || this.ladders.some((ladder) => ladder.start === end)) {
                end = Math.floor(Math.random() * 100);
            }
            this.ladders.push({ start, end });
        }

        console.log(this.snakes);
        console.log(this.ladders);
    }
}
