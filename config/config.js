module.exports = {
  'development': {
    'username': 'root',
    'password': null,
    'database': 'wll_dev',
    'host': '127.0.0.1',
    'dialect': 'postgres',
    'logging': true
  },
  'test': {
    'username': 'root',
    'password': null,
    'database': 'wll_test',
    'host': '127.0.0.1',
    'dialect': 'postgres'
  },
  'production': {
    'url': process.env.DATABASE_URL,
    'protocol': 'postgres',
    'dialectOptions': {
      ssl: true
    },
    'dialect': 'postgres'
  }
};
