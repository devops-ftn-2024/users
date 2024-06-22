import { UserRepository } from "../repository/user-repository";
import { UserService } from "../service/user-service";
import { BadRequestError, InternalServerError, NotFoundError } from "../types/errors";
import { jest, test } from '@jest/globals';

jest.mock('../repository/user-repository');

describe('UserService', () => {
    let service;
    let repository;

    beforeEach(() => {
        repository = new UserRepository() as jest.Mocked<UserRepository>;
        service = new UserService();
        service.repository = repository;
    });

    describe('getUserProfile', () => {
        test('should throw NotFoundError if username is not provided', async () => {
            await expect(service.getUserProfile(undefined)).rejects.toThrow(NotFoundError);
        });

        test('should throw NotFoundError if user is not found', async () => {
            const username = 'nonexistentUser';
            repository.getUser.mockResolvedValueOnce(undefined);

            await expect(service.getUserProfile(username)).rejects.toThrow(NotFoundError);
        });

        test('should return the user profile if user exists', async () => {
            const username = 'existingUser';
            const mockUser = { username, firstName: 'John', lastName: 'Doe', address: '123 Main St' };
            repository.getUser.mockResolvedValueOnce(mockUser);

            const result = await service.getUserProfile(username);
            expect(result).toEqual(mockUser);
        });
    });

    describe('deleteUser', () => {
        test('should call repository.deleteUser with the correct username', async () => {
            const username = 'userToDelete';
            await service.deleteUser(username);
            expect(repository.deleteUser).toHaveBeenCalledWith(username);
        });
    });

    describe('addUser', () => {
        test('should validate user and call repository.addUser', async () => {
            const user = { username: 'newUser', firstName: 'Jane', lastName: 'Doe', address: '456 Elm St' };
            await service.addUser(user);
            expect(repository.addUser).toHaveBeenCalledWith(user);
        });
    });

    describe('updateUser', () => {
        test('should throw BadRequestError if no fields are provided for update', async () => {
            const username = 'userToUpdate';
            const updateUser = {};
            await expect(service.updateUser(username, updateUser)).rejects.toThrow(BadRequestError);
        });

        test('should throw NotFoundError if user is not found', async () => {
            const username = 'nonexistentUser';
            const updateUser = { firstName: 'New', lastName: 'Name' };
            repository.updateUser.mockResolvedValueOnce({ matchedCount: 0 });

            await expect(service.updateUser(username, updateUser)).rejects.toThrow(NotFoundError);
        });

        test('should throw NotFoundError if user is not modified', async () => {
            const username = 'userToUpdate';
            const updateUser = { firstName: 'New', lastName: 'Name' };
            repository.updateUser.mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 0 });

            await expect(service.updateUser(username, updateUser)).rejects.toThrow(NotFoundError);
        });

        test('should update user successfully', async () => {
            const username = 'userToUpdate';
            const updateUser = { firstName: 'New', lastName: 'Name' };
            repository.updateUser.mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 });

            await service.updateUser(username, updateUser);
            expect(repository.updateUser).toHaveBeenCalledWith(username, updateUser);
        });
    });

    describe('updateUsername', () => {
        test('should throw NotFoundError if user is not found', async () => {
            const usernames = { oldUsername: 'oldUser', newUsername: 'newUser' };
            repository.updateUsername.mockResolvedValueOnce({ matchedCount: 0 });

            await expect(service.updateUsername(usernames)).rejects.toThrow(NotFoundError);
        });

        test('should throw InternalServerError if user is not modified', async () => {
            const usernames = { oldUsername: 'oldUser', newUsername: 'newUser' };
            repository.updateUsername.mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 0 });

            await expect(service.updateUsername(usernames)).rejects.toThrow(InternalServerError);
        });

        test('should update username successfully', async () => {
            const usernames = { oldUsername: 'oldUser', newUsername: 'newUser' };
            repository.updateUsername.mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 });

            await service.updateUsername(usernames);
            expect(repository.updateUsername).toHaveBeenCalledWith(usernames.oldUsername, usernames.newUsername);
        });
    });
});

