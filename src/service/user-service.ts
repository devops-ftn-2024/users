import { UserRepository } from "../repository/user-repository";
import { BadRequestError, InternalServerError, NotFoundError } from "../types/errors";
import { UpdatableUser, User, UsernameDTO } from "../types/user";
import { Logger } from "../util/logger";
import { validateUser } from "../util/validation";

export class UserService {
    private repository: UserRepository;

    constructor() {
        this.repository = new UserRepository();
    }

    public async getUserProfile(username: string | undefined) {
        if (!username) {
            Logger.error("Username not provided");
            throw new NotFoundError('Username not provided');
        }
        const user =  await this.repository.getUser(username);
        if (!user) {
            Logger.error("User not found");
            throw new NotFoundError('User not found');
        }
        Logger.log(`User for username ${username} found`)
        return user;
    }

    public async deleteUser(username: string) {
        Logger.log(`Removing user with username: ${username}`);
        await this.repository.deleteUser(username);
    }

    public async addUser(user: User) {
        Logger.log(`Adding user with username: ${user.username}`)
        validateUser(user);
        await this.repository.addUser(user);
        Logger.log(`User with username ${user.username} added`)
    }

    public async updateUser(username: string, user: UpdatableUser) {
        Logger.log(`Updating user with username: ${username}`);
        const { firstName, lastName, address } = user;
        if (!firstName && !lastName && !address) {
            Logger.error("BadRequestError: At least one field must be provided");
            throw new BadRequestError('At least one field must be provided');
        }
        const updateResult =  await this.repository.updateUser(username, user);
        if (updateResult.matchedCount === 0) {
            Logger.error("User not found");
            throw new NotFoundError('User not found');
        }
        if (updateResult.modifiedCount === 0) {
            Logger.error("User not modified");
            throw new NotFoundError('User not modified');
        }
        Logger.log(`User with username ${username} updated`)
    }

    public async updateUsername(usernames: UsernameDTO) {
        Logger.log(`Updating username from ${usernames.oldUsername} to ${usernames.newUsername}`);
        const { oldUsername, newUsername } = usernames;
        const updateResult =  await this.repository.updateUsername(oldUsername, newUsername);
        if (updateResult.matchedCount === 0) {
            Logger.error("User not found");
            throw new NotFoundError('User not found');
        }
        if (updateResult.modifiedCount === 0) {
            Logger.error("User not modified");
            throw new InternalServerError('User not modified');
        }
        Logger.log(`Username updated from ${oldUsername} to ${newUsername}`);
    }
}