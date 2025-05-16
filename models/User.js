import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default class User {
  static getCollection() {
    const db = getDB();
    return db.collection("users");
  }

  static async register(input) {
    const user = {
      name: input.name,
      username: input.username,
      email: input.email,
      password: bcrypt.hashSync(input.password, 10),
    };

    const collection = this.getCollection();
    const result = await collection.insertOne(user);

    return {
      _id: result.insertedId,
      ...user,
    };
  }

  static async login({ username, password }) {
    const user = await this.getCollection().findOne({ username });
    if (!user) throw new Error("Invalid username/password");

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid username/password");

    const token = jwt.sign({ _id: user._id }, "rahasia");

    return { access_token: token };
  }

  static async findAll() {
    const collection = this.getCollection();
    return await collection.find().toArray();
  }

  static async findById(id) {
    const collection = this.getCollection();

    const user = await collection
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followerId",
            as: "followingRefs",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followingRefs.followingId",
            foreignField: "_id",
            as: "following",
          },
        },
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followingId",
            as: "followerRefs",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followerRefs.followerId",
            foreignField: "_id",
            as: "follower",
          },
        },
        {
          $project: {
            followingRefs: 0,
            followerRefs: 0,
          },
        },
      ])
      .toArray();

    return user[0];
  }

  static async searchByNameOrUsername(query) {
    const collection = this.getCollection();
    const regex = new RegExp(query, "i");

    return await collection
      .find({
        $or: [{ name: { $regex: regex } }, { username: { $regex: regex } }],
      })
      .toArray();
  }
}
