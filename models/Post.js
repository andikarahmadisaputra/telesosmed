import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb.js";

export default class Post {
  static getCollection() {
    const db = getDB();
    return db.collection("posts");
  }

  static async findAll() {
    const collection = this.getCollection();

    const posts = await collection
      .aggregate([
        {
          $sort: {
            updatedAt: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();

    return posts;
  }

  static async findById(id) {
    const collection = this.getCollection();

    const post = await collection
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();

    return post[0];
  }

  static async create({ content, tags = [], imgUrl = null, authorId }) {
    if (!content || typeof content !== "string" || content.trim() === "") {
      throw new Error("Content is required and must be a non-empty string.");
    }

    const newPost = {
      content: content.trim(),
      tags,
      imgUrl,
      authorId: new ObjectId(authorId),
      comments: [],
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = this.getCollection();
    const result = await collection.insertOne(newPost);
    return { _id: result.insertedId, ...newPost };
  }

  static async addComment({ postId, content, username }) {
    if (!ObjectId.isValid(postId)) {
      throw new Error("Invalid postId.");
    }
    if (!content || content.trim() === "") {
      throw new Error("Comment content is required.");
    }

    const comment = {
      content: content.trim(),
      username: username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(postId) },
      {
        $push: { comments: comment },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (!result) throw new Error("Post not found");
    return result;
  }

  static async toggleLike({ postId, username }) {
    if (!ObjectId.isValid(postId)) {
      throw new Error("Invalid postId.");
    }

    const collection = this.getCollection();
    const post = await collection.findOne({ _id: new ObjectId(postId) });
    if (!post) throw new Error("Post not found");

    const alreadyLiked = post.likes?.some((like) => like.username === username);

    let update;
    if (alreadyLiked) {
      // Unlike
      update = {
        $pull: { likes: { username } },
        $set: { updatedAt: new Date() },
      };
    } else {
      // Like
      update = {
        $push: {
          likes: {
            username,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      };
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(postId) },
      update,
      { returnDocument: "after" }
    );

    return result;
  }
}
