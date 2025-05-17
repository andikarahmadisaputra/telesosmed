import User from "../models/User.js";
import Follow from "../models/Follow.js";

export const userTypeDefs = `#graphql
  type User {
    _id: ID 
    name: String
    username: String
    email: String
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
    following: [User]
    follower: [User]
  }

  type Query {
    getUsers: [User]
    getUserById(id: ID): UserDetail
    searchUsers(query: String): [User]
    getProfile: UserDetail
  }

  type Mutation {
    follow(input: FollowInput) : FollowStatus
  }
`;

export const userResolvers = {
  Query: {
    getUsers: async (parent, args, context) => {
      await context.authentication();
      const users = await User.findAll();

      return users;
    },

    getUserById: async (_, args) => {
      await context.authentication();

      const { id } = args;
      const user = await User.findById(id);

      return user;
    },

    getProfile: async (_, args, context) => {
      const user = await context.authentication();

      const profile = await User.findById(user._id);

      return profile;
    },

    searchUsers: async (_, args, context) => {
      await context.authentication();

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
