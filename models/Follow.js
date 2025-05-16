import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb.js";

export default class Follow {
  static getCollection() {
    const db = getDB();
    return db.collection("follows");
  }

  static async follow({ followerId, followingId }) {
    if (!ObjectId.isValid(followerId) || !ObjectId.isValid(followingId)) {
      throw new Error("Invalid ObjectId");
    }

    const collection = this.getCollection();

    const isAlreadyFollow = await collection.findOne({
      followingId: new ObjectId(followingId),
      followerId: new ObjectId(followerId),
    });

    if (isAlreadyFollow) {
      await collection.deleteOne({
        followingId: new ObjectId(followingId),
        followerId: new ObjectId(followerId),
      });

      return { status: "unfollowed", data: isAlreadyFollow };
    }

    const newFollow = {
      followingId: new ObjectId(followingId),
      followerId: new ObjectId(followerId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newFollow);

    return {
      status: "followed",
      data: { _id: result.insertedId, ...newFollow },
    };
  }
}
