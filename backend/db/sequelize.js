import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
