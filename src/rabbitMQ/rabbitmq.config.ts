export const RABBITMQ_HOST = 'localhost';
export const RABBITMQ_PORT = 5672;
export const RABBITMQ_USER = 'guest';
export const RABBITMQ_PASSWORD = 'guest';

export const rabbitMqConfig = {
  urls: [`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`],
  queueOptions: {
    durable: true, // Make queues durable (survive broker restarts)
  },
  queues: {
    auth_queue: 'auth_queue',
    payment_queue: 'payment_queue',
    product_queue: 'product_queue',
    order_queue: 'order_queue',
    admin_queue: 'admin_queue',
    profile_queue: 'profile_queue',
    database_queue: 'database_queue',
  },
};