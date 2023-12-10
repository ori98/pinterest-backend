'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ ImageUpload, User, Comments, SavedPosts }) {
      // define association here

      // association with ImageUpload
      this.belongsTo(ImageUpload, {
        as: 'imageUpload',
        foreignKey: 'docId',
        targetKey: 'docId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // association with user
      this.belongsTo(User, {
        as: 'user',
        foreignKey: 'userId',
        targetKey: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // association with the comments
      this.hasMany(Comments, {
        foreignKey: 'postId',
        as: 'comments',
      });

      // association with saved posts
      this.hasMany(SavedPosts, {
        foreignKey: 'postId',
        as: 'savedPosts',
      });
    }
  }
  Post.init({
    userId: {
      type: DataTypes.INTEGER,
      unique: false,
      allowNull: false
    },
    docId: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: false
    },
    reportCount: {
      type: DataTypes.INTEGER,
      unique: false,
      allowNull: false,
      defaultValue: 0
    },
    saleTag: {
      type: DataTypes.BOOLEAN,
      unique: false,
      allowNull: false,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'post',
    timestamps: false,
  });
  return Post;
};