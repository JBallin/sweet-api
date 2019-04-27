# Sweet API [![Build Status](https://travis-ci.com/JBallin/sweet-api.svg?branch=master)](https://travis-ci.com/JBallin/sweet-api) [![Coverage Status](https://coveralls.io/repos/github/JBallin/sweet-api/badge.svg?branch=master)](https://coveralls.io/github/JBallin/sweet-api?branch=master)

Frontend: [My Sweet Config](https://github.com/JBallin/sweet-config)
<br>
Deployed API: [sweet-api.herokuapp.com][1]

## Screenshots

##### 66 Integration Tests
![tests](screenshots/tests.png?raw=true "tests")

##### 32 Custom Errors
![custom errors](screenshots/errors.png?raw=true "custom errors")

## Usage

```shell
$ npm install
$ echo 'JWT_KEY=$YOUR_JWT_KEY' > .env
$ createdb sweet_dev
$ npm run seed-dev
$ npm run dev
```

## Testing

```shell
$ createdb sweet_test
$ npm test
```

[1]: https://sweet-api.herokuapp.com
