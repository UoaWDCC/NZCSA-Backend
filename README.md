<h1 align="center">
NZCSA Backend
</h1>
<p align="center">
Node/Express, MongoDB, SendGrid, JWT
</p>

> New Zealand Chinese Students' Association

The New Zealand Chinese Students’ Association (NZCSA) is an incorporated student society that aims to serve the Chinese students in New Zealand, promoting the Chinese Culture and act as a bridge between the Chinese student community and the local mainstream community

## Clone or download

```terminal
$ git clone https://github.com/UoaWDCC/NZCSA-Backend
```

# Usage (run fullstack app on your machine)

## Prerequirements

- [Node](https://nodejs.org/en/download/) ^10.0.0
- [npm](https://nodejs.org/en/download/package-manager/)
- [Express](https://expressjs.com/)

Notice, you need client and server runs concurrently in different terminal session, in order to make them talk to each other

## Client-side(Frontend) usage(PORT: 3000)

### [NZCSA-Frontend](https://github.com/UoaWDCC/NZCSA-Frontend)

## Server-side(Backend) usage(PORT: 5000)

### Preparation

1. Make a new .env file called `config.env`.

```terminal
$ cd NZCSA-Backend
$ touch config.env
```

2. Please contact the PM for the secrets and paste the secrets into `config.env`.

### Start

```terminal
$ yarn install          // install pacakges
$ yarn run server       // run it locally
$ yarn run build        // this will build the server code to es5 js codes and generate a dist file

```

### Pull request

Before your raise a new pull request, you should do:

```terminal
$ yarn run lint
$ yarn run lint:fix     //fix eslint error
$ yarn run test
```

# Dependencies

    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "crypto-js": "^4.0.0",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "google-spreadsheet": "^3.1.15",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^5.12.7",
    "nodemailer": "^6.6.0",
    "nodemon": "^2.0.7",
    "uuid": "^8.3.2"

# Acknowledgements/Documentations

### Postman

API testing

https://www.postman.com/downloads/

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/be3d3034cbdf3cb868c2?action=collection%2Fimport)

### MongoDB Compass

A powerful GUI for querying, aggregating, and analyzing your MongoDB data in a visual environment.

https://www.mongodb.com/try/download/compass

# Contributor

| Name          |
| ------------- |
| Melo Guan     |
| Kirsty Gong   |
| Zhiqing Guo   |
| Tony Cui      |
| Alex Liang    |
| Linkun Gao    |
| Garfield Wang |
