import { IAnswerWithQuestion } from "./question-answer.interfaces";

export interface IUserResult {
    Answers: IAnswerWithQuestion[];
    isUser: true;
}
