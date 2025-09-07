import useQuizStore from "@/store";
import { apiGet } from "../common.api";
import { getPartyOrientation } from "@/utils/calculations";
import { ICompassOrientation } from "@/interfaces/compass-orientation.interface";
import { IAnswerWithQuestion } from "@/interfaces/question-answer.interfaces";

export interface IParty {
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    id: string;
    name: string;
    abbreviation: typeof bigParties[number] | typeof smallParties[number];
}

export interface IPartyWithAnswers extends IParty {
    Answers: IAnswerWithQuestion[]
}

export type IPartyWithOrientation = IPartyWithAnswers & ICompassOrientation

export const bigParties = ['SPOLU', 'Piráti+STAN', 'ANO', 'SPD'] as const;
export const smallParties = ['PŘÍSAHA', 'ČSSD', 'KSČM', 'TSS'] as const;

export class PartyModel {
    static async fetchLatest() {
        const parties = await apiGet({ url: "parties" , query: { 'include-answers': true }}) as IPartyWithAnswers[];
        const partiesWithOrientation: IPartyWithOrientation[] = parties.map(party => {
            const orientation = getPartyOrientation(party.Answers);
            return { ...party, ...orientation};
        } );
        const store = useQuizStore();
        store.setParties(partiesWithOrientation);
    }
}
