<h2 align="center">
A Restful API for a simple blog application with Node(NestJS).
  </h2>

## Description
This rest api developed with leveraging the power of NestJS, a progressive Node.js framework for building efficient, reliable and scalable server-side applications. This API provides the basic CRUD operations for a simple blog application. The API is secured with JWT authentication and authorizatiion. The api also has real-time functionality with the help of websockets. And the data is stored in a Postgresql database using prisma(ORM).

### Key Features
- JWT Authentication and Authorization 
- Real-time Notification system with websockets(Socket.io)
- CRUD operations for blog Articles
- CRUD operations for comments 
- CRUD operations for users 
- Follow/Unfollow users 
- Reacting to articles (Like and Unlike)

### Technologies 
- Nodejs 
- NestJS (Node.js framework) 
- Postgresql (Database) 
- Prisma (ORM) 
- JWT (Authentication and Authorization) 
- Websockets 
- Socket.io (websockets library)

### Installation
```bash
$ npm install
```

### Running the app
```bash
# development make sure you have working env variables in .env.example exported 
$ npm run start:dev 
``` 

### References 
- [NestJS](https://nestjs.com/) 
- [Prisma](https://www.prisma.io/) 
- [Socket.io](https://socket.io/)




