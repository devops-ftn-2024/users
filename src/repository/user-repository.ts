import { Collection, MongoClient, UpdateResult } from "mongodb";
import { UpdatableUser, User } from "../types/user";
import { Logger } from "../util/logger";

export class UserRepository {
    private client: MongoClient;
    private database_name: string;
    private collection_name: string;
    private collection: Collection<User>;

    constructor() {
        if (!process.env.MONGO_URI) {
            throw new Error("Missing MONGO_URI environment variable");
        }
        if (!process.env.MONGO_DB_NAME) {
            throw new Error("Missing MONGO_DB_NAME environment variable");
        }
        if (!process.env.MONGO_COLLECTION_NAME) {
            throw new Error("Missing MONGO_COLLECTION_NAME environment variable");
        }
        this.client = new MongoClient(process.env.MONGO_URI);
        this.database_name = process.env.MONGO_DB_NAME;
        this.collection_name = process.env.MONGO_COLLECTION_NAME;
        this.collection = this.client.db(this.database_name).collection(this.collection_name);
    }
    public async addUser(user: User) {
        await this.client.connect();
        await this.collection.insertOne({...user, rating: 0, ratingsArray: []});
        await this.client.close();
    }

    public async getUser(username: string): Promise<User | null> {
        await this.client.connect();
        const user = await this.collection.findOne({ username });
        await this.client.close();
        return user;
    }

    public async updateUser(username: string, user: UpdatableUser): Promise<UpdateResult<User>> {
        await this.client.connect();
        let updateAction: UpdatableUser = {}
        if (user.firstName) {
            updateAction.firstName = user.firstName;
        }
        if (user.lastName) {
            updateAction.lastName = user.lastName;
        }
        if (user.address) {
            updateAction.address = user.address;
        }   
        const updateResult = await this.collection.updateOne({ username }, { $set: updateAction });
        await this.client.close();
        return updateResult;
    }

    public async deleteUser(username: string) {
        await this.client.connect();
        await this.collection.deleteOne({ username });
        await this.client.close();
    }

    public async updateUsername(oldUsername: string, newUsername: string): Promise<UpdateResult<User>> {
        await this.client.connect();
        const updateResult = await this.collection.updateOne({ username: oldUsername }, { $set: { username: newUsername } });
        await this.client.close();
        return updateResult;
    }

    public async addRating(username: string, rating: number): Promise<void> {
        await this.client.connect();
        const user = await this.collection.findOne({ username });
        if (!user) {
            Logger.error("User not found");
            return;
        }
        const ratingsArray = user.ratingsArray || [];
        ratingsArray.push(rating);
        const newRating = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;
        await this.collection.updateOne({ username }, { $set: { rating: newRating, ratingsArray } });
    }
   
}