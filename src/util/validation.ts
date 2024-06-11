import { User } from "../types/user";

export const validateUser = (user: User) => {
    if (!user) {
        throw new Error("Missing user");
    }
    if (!user.username) {
        throw new Error("Missing username");
    }
    if (!user.firstName) {
        throw new Error("Missing first name");
    }
    if (!user.lastName) {
        throw new Error("Missing last name");
    }
    if (!user.address) {
        throw new Error("Missing address");
    }
}