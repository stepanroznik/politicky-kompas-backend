import { ICompassOrientation } from "@/interfaces/compass-orientation.interface";
import { IAnswerWithQuestion } from "@/interfaces/question-answer.interfaces";

export const getPartyOrientation = (answers: IAnswerWithQuestion[]): ICompassOrientation => {
    const leftRightAnswers: number[] = [];
    const topBottomAnswers: number[] = [];
    const eastWestAnswers: number[] = [];
    answers.forEach((answer) => {
        if (+answer.agreeLevel !== 0) {
            const agreeLevel = (+answer.agreeLevel - 3) * 2.5;
            switch (answer.Question.position) {
            case "left":
                leftRightAnswers.push(agreeLevel * -1);
                break;
            case "right":
                leftRightAnswers.push(agreeLevel);
                break;
            case "top":
                topBottomAnswers.push(agreeLevel * -1);
                break;
            case "bottom":
                topBottomAnswers.push(agreeLevel);
                break;
            case "east":
                eastWestAnswers.push(agreeLevel * -1);
                break;
            case "west":
                eastWestAnswers.push(agreeLevel);
                break;
            }
        }
    });

    const lr = !leftRightAnswers.length ? 0 : leftRightAnswers.reduce((a, b) => a + b, 0) / leftRightAnswers.length;
    const tb = !topBottomAnswers.length ? 0 : topBottomAnswers.reduce((a, b) => a + b, 0) / topBottomAnswers.length;
    const ew = !eastWestAnswers.length ? 0 : eastWestAnswers.reduce((a, b) => a + b, 0) / eastWestAnswers.length;
    const leftRight = Math.floor(lr) === 5 ? 4 : Math.floor(lr);
    const topBottom = Math.floor(tb) === 5 ? 4 : Math.floor(tb);
    const eastWest = ew;

    return { leftRight, topBottom, eastWest };
};
