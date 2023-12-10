'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ImageUpload extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Category, {
        as: 'category',
        foreignKey: 'categoryId',
        targetKey: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  ImageUpload.init({
    docId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false, 
    },
    title: DataTypes.STRING,
    description: DataTypes.STRING(767),
    categoryId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'ImageUpload',
    tableName: 'imageupload',
    timestamps: false,
  });
  return ImageUpload;
};