
export interface IQuestion {
    position: string;
    id: string;
    title: string;
    subtitle: string;
    isPrimary: boolean;
}

export interface IAnswer {
    agreeLevel: number;
    QuestionId: string;
    PartyId: string;
}

export interface IAnswerWithQuestion extends IAnswer {
    Question: IQuestion;
}
