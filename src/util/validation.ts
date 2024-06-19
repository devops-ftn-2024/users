import { BadRequestError } from "../types/errors";
import { User } from "../types/user";
import { Logger } from "./logger";

export const validateUser = (user: User) => {
    if (!user) {
        Logger.error("BadRequestError: Missing user");
        throw new BadRequestError("Missing user");
    }
    if (!user.username) {
        Logger.error("BadRequestError: Missing username");
        throw new BadRequestError("Missing username");
    }
    if (!user.firstName) {
        Logger.error("BadRequestError: Missing first name");
        throw new BadRequestError("Missing first name");
    }
    if (!user.lastName) {
        Logger.error("BadRequestError: Missing last name");
        throw new BadRequestError("Missing last name");
    }
    if (!user.address) {
        Logger.error("BadRequestError: Missing address");
        throw new BadRequestError("Missing address");
    }
}