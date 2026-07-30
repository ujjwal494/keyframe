import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Vote from "@/app/models/vote";
import Question from "@/app/models/question";
import Answer from "@/app/models/answer";
import User from "@/app/models/user";
import { ReputationStrategyRegistry } from "@/lib/reputation";

export default class VoteRepository {
  // Delegate reputation calculation to the strategy registry
  static _getRepChange(value) {
    return ReputationStrategyRegistry.getRepChange(value);
  }

  // Cast, switch, or undo a vote — wrapped in a transaction
  static async castVote({ userId, targetId, targetType, value }) {
    await dbConnect();

    if (!Question || !Answer || !Vote || !User) {
      throw new Error("Models not loaded properly.");
    }

    const ParentModel = targetType === "Question" ? Question : Answer;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fetch target and validate
      const target = await ParentModel.findById(targetId).session(session);
      if (!target) {
        throw new Error(`${targetType} not found.`);
      }

      if (target.author.toString() === userId.toString()) {
        throw new Error("You cannot vote on your own post.");
      }

      const existingVote = await Vote.findOne({
        user: userId,
        targetId,
        targetType,
      }).session(session);

      let status;
      let voteDiff = 0;
      let repDiff = 0;

      if (existingVote) {
        if (existingVote.value === value) {
          // Undo vote
          await Vote.deleteOne({ _id: existingVote._id }, { session });
          voteDiff = -value;
          repDiff = -this._getRepChange(existingVote.value);
          status = "removed";
        } else {
          // Switch vote
          voteDiff = value - existingVote.value;
          repDiff = this._getRepChange(value) - this._getRepChange(existingVote.value);
          existingVote.value = value;
          await existingVote.save({ session });
          status = "switched";
        }
      } else {
        // New vote
        const newVote = new Vote({
          user: userId,
          targetId,
          targetType,
          value,
        });
        await newVote.save({ session });
        voteDiff = value;
        repDiff = this._getRepChange(value);
        status = "added";
      }

      // Update vote score on the target
      if (voteDiff !== 0) {
        await ParentModel.findByIdAndUpdate(
          targetId,
          { $inc: { voteScore: voteDiff } },
          { session }
        );
      }

      // Update author reputation
      if (repDiff !== 0) {
        await User.findByIdAndUpdate(
          target.author,
          { $inc: { reputation: repDiff } },
          { session }
        );
      }

      await session.commitTransaction();
      return { status };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
