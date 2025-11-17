export interface ICompassOrientation {
    leftRight: number;
    topBottom: number;
    eastWest: number;
}

export interface IUserCompassOrientation extends ICompassOrientation {
    id: string;
    isUser: true;
}