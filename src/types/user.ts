export interface User {
    _id?: string;
    username: string;
    firstName: string;
    lastName: string;
    address: string;
    rating: number;
    ratingsArray: number[];
}

export interface UpdatableUser {
    firstName?: string;
    lastName?: string;
    address?: string;
}

export interface LoggedUser {
    username: string;
    role: Role;
}

export enum Role {
    HOST = 'Host',
    GUEST = 'Guest',
}

export interface UsernameDTO {
    oldUsername: string;
    newUsername: string;
}