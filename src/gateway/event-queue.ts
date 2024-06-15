import amqp from 'amqplib/callback_api.js'
import { UserService } from '../service/user-service';
import { User, UsernameDTO } from '../types/user';

export class EventQueue {
    constructor(private userService: UserService) {
        this.init();
    }

    private init() {
        amqp.connect(`amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`, (error, connection) => {
            if (error) {
                throw error;
            }
    
            connection.createChannel((error1, channel) => {
                if (error1) {
                    throw error1;
                }

                channel.assertQueue('user-registered', { durable: false });

                channel.consume('user-registered', (payload) => {
                    if (payload != null) {
                        const user = JSON.parse(payload.content.toString())
                        console.log(`Registering user: ${JSON.stringify(user)}`);
                        let contents: User = user;
                        this.userService.addUser(contents);
                    }
                }, {
                    noAck: true
                })
    
                
                const exchangeName = 'username-updated';
                channel.assertExchange(exchangeName, 'fanout', { durable: true });
    
                channel.assertQueue('', { exclusive: true }, (error2, q) => {
                    if (error2) {
                        throw error2;
                    }
    
                    channel.bindQueue(q.queue, exchangeName, '');
    
                    console.log(`Waiting for messages in ${q.queue}. To exit press CTRL+C`);
    
                    channel.consume(q.queue, (payload) => {
                        console.log(`Updating username: ${payload}`);
                        if (payload !== null) {
                            const usernames: UsernameDTO = JSON.parse(payload.content.toString());
                            console.log(`Updating username: ${JSON.stringify(usernames)}`);
                            this.userService.updateUsername(usernames);
                        }
                    }, { noAck: true });
                });
            });
        });
    }
    



    // private init() {

    //     amqp.connect(`amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`, (error, connection) => {
    //         if (error) {
    //             throw error;
    //         }

    //         connection.createChannel((error1, channel) => {
    //             if (error1) {
    //                 throw error1;
    //             }

    //             channel.assertQueue('user-registered', {
    //                 durable: false
    //             });

    //             channel.consume('user-registered', (payload) => {
    //                 if (payload != null) {
    //                     const user = JSON.parse(payload.content.toString())
    //                     console.log(`Registering user: ${JSON.stringify(user)}`);
    //                     let contents: User = user;
    //                     this.userService.addUser(contents);
    //                 }
    //             }, {
    //                 noAck: true
    //             })

    //             channel.assertQueue('username-updated', {
    //                 durable: false
    //             });

    //             channel.consume('username-updated', (payload) => {
    //                 console.log(`Updating username: ${payload}`)
    //                 if (payload != null) {
    //                     const usernames: UsernameDTO = JSON.parse(payload.content.toString())
    //                     console.log(`Updating username: ${JSON.stringify(usernames)}`);
    //                     let contents = usernames;
    //                     this.userService.updateUsername(contents);
    //                 }
    //             }, {
    //                 noAck: true
    //             })
    //         });
    //     });
    // }
}