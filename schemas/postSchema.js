import Post from "../models/Post.js";
import redis from "../config/redis.js";

export const postTypeDefs = `#graphql
  type Comment {
    content: String
    username: String
    createdAt: String
    updatedAt: String
  }

  type Like {
    username: String
    createdAt: String
    updatedAt: String
  }

  type Author {
    _id: ID
    name: String
    username: String
    email: String
  }

  type Post {
    _id: ID
    content: String
    tags: [String]
    imgUrl: String
    authorId: ID
    comments: [Comment]
    likes: [Like]
    createdAt: String
    updatedAt: String
    author: Author
  }
  
  input PostInput {
    content: String
    tags: [String]
    imgUrl: String
  }

  input CommentInput {
    postId: ID
    content: String
  }

  input LikeInput {
    postId: ID
  }

  type Query {
    getPosts: [Post]
    getPostById(id: ID): Post
  }

  type Mutation {
    addPost(input: PostInput) : Post
    commentPost(input: CommentInput): Post
    likePost(input: LikeInput): Post
  }
`;

export const postResolvers = {
  Query: {
    getPosts: async () => {
      const cachedPosts = await redis.get("posts");
      if (cachedPosts) return JSON.parse(cachedPosts);

      const posts = await Post.findAll();
      await redis.set("posts", JSON.stringify(posts));

      return posts;
    },

    getPostById: async (_, args) => {
      const { id } = args;
      const post = await Post.findById(id);

      return post;
    },
  },

  Mutation: {
    addPost: async (_, args, context) => {
      const user = await context.authentication();

      const post = await Post.create({ ...args.input, authorId: user._id });

      await redis.del("posts");

      return post;
    },

    commentPost: async (_, args, context) => {
      const user = await context.authentication();

      const post = await Post.addComment({
        postId: args.input.postId,
        content: args.input.content,
        username: user.username,
      });

      await redis.del("posts");

      return post;
    },

    likePost: async (_, args, context) => {
      const user = await context.authentication();
      const post = await Post.toggleLike({
        postId: args.input.postId,
        username: user.username,
      });

      await redis.del("posts");

      return post;
    },
  },
};
