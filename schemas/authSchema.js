import User from "../models/User.js";

export const authTypeDefs = `#graphql
  type NewUser {
    _id: ID 
    name: String
    username: String
    email: String
  }

  input RegisterInput {
    name: String
    username: String
    email: String
    password: String
  }
  
  input LoginInput {
    username: String
    password: String
  }

  type AccessToken {
    access_token: String
  }
  
  type Query {
    login(input: LoginInput) : AccessToken
  }
  
  type Mutation {
    register(input: RegisterInput): NewUser
  }
`;

export const authResolvers = {
  Query: {
    login: async (_, args) => {
      return await User.login(args.input);
    },
  },
  Mutation: {
    register: async (_, args) => {
      return await User.register(args.input);
    },
  },
};
