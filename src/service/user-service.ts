import { UserRepository } from "../repository/user-repository";
import { BadRequestError, InternalServerError, NotFoundError } from "../types/errors";
import { UpdatableUser, User, UsernameDTO } from "../types/user";
import { validateUser } from "../util/validation";

export class UserService {
    private repository: UserRepository;

    constructor() {
        this.repository = new UserRepository();
    }

    public async getUserProfile(username: string | undefined) {
        if (!username) {
            throw new NotFoundError('Username not provided');
        }
        const user =  await this.repository.getUser(username);
        console.log(username);
        console.log(user);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    }

    public async deleteUser(username: string) {
        await this.repository.deleteUser(username);
    }

    public async addUser(user: User) {
        validateUser(user);
        await this.repository.addUser(user);
    }

    public async updateUser(username: string, user: UpdatableUser) {
        const { firstName, lastName, address } = user;
        if (!firstName && !lastName && !address) {
            throw new BadRequestError('At least one field must be provided');
        }
        const updateResult =  await this.repository.updateUser(username, user);
        if (updateResult.matchedCount === 0) {
            throw new NotFoundError('User not found');
        }
        if (updateResult.modifiedCount === 0) {
            throw new NotFoundError('User not modified');
        }
    }

    public async updateUsername(usernames: UsernameDTO) {
        const { oldUsername, newUsername } = usernames;
        const updateResult =  await this.repository.updateUsername(oldUsername, newUsername);
        if (updateResult.matchedCount === 0) {
            throw new NotFoundError('User not found');
        }
        if (updateResult.modifiedCount === 0) {
            throw new InternalServerError('User not modified');
        }
    }
}