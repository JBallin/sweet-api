API for [My Sweet Config](https://github.com/JBallin/sweet-config).

### Installation

**Required:** Generate a gist using [ballin-scripts](https://github.com/JBallin/ballin-scripts).

```
$ git clone https://github.com/JBallin/sweet-api.git
$ cd sweet-api
$ npm install
$ echo "GIST_ID=$(ballin_config get gu.id)" > .env
$ createdb seed_dev
$ npm run seed-dev
$ npm run dev
```

Visit `localhost:8082` to see the available routes!
