import { gql } from 'apollo-server-lambda';

const typeDefs = gql`
  type Product {
    id: String!
    name: String!
    price: Float!
    quantity: Int!
  }

  type Query {
    getAllProducts: [Product!]!
    getProduct(id: String!): Product
  }

  type Mutation {
    createProduct(name: String!, price: Float!, quantity: Int!): Product
    updateProduct(id: String!, name: String, price: Float, quantity: Int): Product
    deleteProduct(id: String!): Product
  }
`;

export default typeDefs;
