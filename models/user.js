'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Post, SavedPosts, Comments }) {
      // define association here
      this.hasMany(Post, {
        foreignKey: 'userId', // the foreign key in the Post model
        as: 'posts', // alias for the association
      });

      this.hasMany(SavedPosts, {
        foreignKey: 'userId',
        as: 'savedPosts',
      });

      this.hasMany(Comments, {
        foreignKey: 'userId',
        as: 'comments',
      });
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email : {
      type: DataTypes.STRING(767),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Please enter valid email'
        },
        notNull: {
          msg: 'Please enter an email'
        }
      }
    },
    password: DataTypes.STRING(767),
    userrole: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'User',
  });
  return User;
};