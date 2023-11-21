const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const pg = require('pg');
const { Sequelize } = require('sequelize');

const db = new Sequelize(
  process.env.DB,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialectModule: pg,
    dialect: 'postgres',
    define: {
      underscored: true,
    },
    // dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false,
  }
);

module.exports = db;
