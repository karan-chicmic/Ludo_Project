import { _decorator, Component, EditBoxComponent, Label, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("userInput")
export class userInput extends Component {
    @property({ type: EditBoxComponent })
    snakeEditBox: EditBoxComponent = null;

    @property({ type: Label })
    snakeLabel: Label = null;

    @property({ type: EditBoxComponent })
    ladderEditBox: EditBoxComponent = null;

    @property({ type: Label })
    ladderLabel: Label;

    @property({ type: Label })
    errorLabel: Label = null;
    start() {
        this.snakeEditBox.node.on(
            EditBoxComponent.EventType.EDITING_DID_ENDED,
            () => {
                console.log(this.snakeLabel.string);
            },
            this
        );
        this.ladderEditBox.node.on(
            EditBoxComponent.EventType.EDITING_DID_ENDED,
            () => {
                console.log(this.ladderLabel.string);
            },
            this
        );
    }

    update(deltaTime: number) {}
    onClick() {
        if (this.snakeEditBox.string == "" || this.ladderEditBox.string == "") {
            this.errorLabel.string = "Enter Both Fields";
        }
    }
}
