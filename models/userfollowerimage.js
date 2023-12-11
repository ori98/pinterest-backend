'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserFollowerImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserFollowerImage.init({
    followerCount: DataTypes.INTEGER,
    followingCount: DataTypes.INTEGER,
    profileImage: DataTypes.STRING(767),
  }, {
    sequelize,
    modelName: 'UserFollowerImage',
    timestamps: false,
  });
  return UserFollowerImage;
};