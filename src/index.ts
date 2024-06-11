import express from 'express';
import { UserService } from './service/user-service';
import bodyParser from 'body-parser';
import { LoggedUser } from './types/user';
import { CustomError, NotFoundError } from './types/errors';
import cors from 'cors';
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  optionsSuccessStatus: 200,
};

const userService = new UserService();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// upload profile image - slika se zove po id-ju/username

app.get('/users/profile', async (req, res) => {
    console.log("Get user profile");
    const userData = req.headers.user;
    try {
        if (!userData) {
          throw new NotFoundError('User data not provided');
        }
        const loggedUserData: LoggedUser = JSON.parse(userData as string);
        const user = await userService.getUserProfile(loggedUserData.username);
        return res.json(user);
    } catch (err) {
      const code = err instanceof CustomError ? err.code : 500;
      return res.status(code).json({ message: (err as Error).message });
    }
});

app.patch('/users/:username', async (req, res) => {
  console.log(`Updating user with username: ${req.params.username}`);
  try {
    await userService.updateUser(req.params.username, req.body);
    return res.status(204).send();
  } catch (err) {
    const code = err instanceof CustomError ? err.code : 500;
    return res.status(code).json({ message: (err as Error).message });
  }
}); 

// preko rabbit mq
app.delete('/users/:username', (req, res) => {
  console.log(`Removing user with username: ${req.params.username}`);
  userService.deleteUser(req.params.username);
  res.status(204).send();
});

// preko rabbit mq
app.post('/users', (req, res) => {
    userService.addUser(req.body);
    res.status(201).send();
});

app.use(cors(corsOptions));

app.listen(PORT, () => {
  console.log(`Backend service running on http://localhost:${PORT}`);
});
