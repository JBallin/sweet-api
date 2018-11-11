API for [My Sweet Config](https://github.com/JBallin/sweet-config).

### Required Setup

Generate a gist using [ballin-scripts](https://github.com/JBallin/ballin-scripts):

```shell
$ bash <(curl -s https://raw.githubusercontent.com/JBallin/ballin-scripts/master/install.sh)
$ gu
```

### Usage

```shell
$ npm install
$ echo "GIST_ID=$(ballin_config get gu.id)" >> .env
$ createdb sweet_dev
$ createdb sweet_test
$ npm run seed-dev
$ npm run dev
```

Visit `localhost:8082` to see the available routes!
