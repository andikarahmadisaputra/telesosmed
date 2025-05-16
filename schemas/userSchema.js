import User from "../models/User.js";
import Follow from "../models/Follow.js";

export const userTypeDefs = `#graphql
  type User {
    _id: ID 
    name: String
    username: String
    email: String
    password: String
  }

  input UserInput {
    name: String
    username: String
    email: String
    password: String
  }

  type Follow {
    _id: ID 
    followingId: ID
    followerId: ID
    createdAt: String
    updatedAt: String
  }

  type FollowStatus {
    status: String,
    data: Follow
  }

  input FollowInput {
    userId: ID!
  }

   type UserDetail {
    _id: ID 
    name: String
    username: String
    email: String
    password: String
    following: [User]
    follower: [User]
  }

  type Query {
    getUsers: [User]
    getUserById(id: ID): UserDetail
    searchUsers(query: String): [User]
  }

  type Mutation {
    follow(input: FollowInput) : FollowStatus
  }
`;

export const userResolvers = {
  Query: {
    getUsers: async (parent, args, context) => {
      const users = await User.findAll();

      return users;
    },

    getUserById: async (_, args) => {
      const { id } = args;
      const user = await User.findById(id);

      return user;
    },

    searchUsers: async (_, args) => {
      const { query } = args;
      const users = await User.searchByNameOrUsername(query);
      return users;
    },
  },

  Mutation: {
    follow: async (_, args, context) => {
      const user = await context.authentication();
      const { userId } = args.input;
      const follow = await Follow.follow({
        followerId: user._id,
        followingId: userId,
      });

      return follow;
    },
  },
};
