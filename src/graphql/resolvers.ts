import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 } from 'uuid';

const docClient = new DocumentClient({
    region: "local",
    endpoint: "http://localhost:8000",
  });

  function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

const resolvers = {

  Query: {

    getAllProducts: async () => {
      const products = await docClient.scan({
        TableName: 'ProductTable',
      }).promise();
      return products.Items;
    },

    getProduct: async (_, { id }) => {
      const product = await docClient.get({
        TableName: 'ProductTable',
        Key: {
          id: id,
        },
      }).promise();
      return product.Item;
    },
  },


  Mutation: {

    createProduct: async (_, { name, price, quantity }) => {
      if (!isValidNumber(price) || !isValidNumber(quantity)) {
        throw new Error("Price and quantity must be valid numbers.");
      }
      if (price <= 0 || quantity < 0) {
        throw new Error("Price must be greater than 0 and quantity cannot be negative.");
      }
      const id = v4();
      const product = {
        id,
        name,
        price,
        quantity,
      };
      await docClient.put({
        TableName: 'ProductTable',
        Item: product,
      }).promise();
      return product;
    },

    updateProduct: async (_, { id, name, price, quantity }) => {
      if ((price !== undefined && !isValidNumber(price)) || (quantity !== undefined && !isValidNumber(quantity))) {
        throw new Error("Price and quantity must be valid numbers.");
      }
      if ((price !== undefined && price <= 0) || (quantity !== undefined && quantity < 0)) {
        throw new Error("Price must be greater than 0 and quantity cannot be negative.");
      }
      const updateExpressionParts = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      if (name !== undefined) {
        updateExpressionParts.push('#name = :name');
        expressionAttributeNames['#name'] = 'name';
        expressionAttributeValues[':name'] = name;
      }
      if (price !== undefined) {
        updateExpressionParts.push('#price = :price');
        expressionAttributeNames['#price'] = 'price';
        expressionAttributeValues[':price'] = price;
      }
      if (quantity !== undefined) {
        updateExpressionParts.push('#quantity = :quantity');
        expressionAttributeNames['#quantity'] = 'quantity';
        expressionAttributeValues[':quantity'] = quantity;
      }

      const updateExpression = 'set ' + updateExpressionParts.join(', ');

      const updated = await docClient.update({
        TableName: 'ProductTable',
        Key: { id: id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }).promise();

      return updated.Attributes;
    },

    deleteProduct: async (_, { id }) => {
      await docClient.delete({
        TableName: 'ProductTable',
        Key: {
          id: id,
        },
      }).promise();
      return { id };
    },
  },
};

export default resolvers;
