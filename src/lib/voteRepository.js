import dbConnect from "@/lib/mongodb";
import Vote from "@/app/models/vote";
import Question from "@/app/models/question";
import Answer from "@/app/models/answer";
import User from "@/app/models/user";

export default class VoteRepository {
  /**
   * Cast a vote on a target (Question or Answer).
   * Automatically handles creation, switching, or undoing a vote.
   */
  static async castVote({ userId, targetId, targetType, value }) {
    await dbConnect();

    // Ensure the models are registered
    if (!Question || !Answer || !Vote) {
      throw new Error("Models not loaded properly.");
    }

    const ParentModel = targetType === "Question" ? Question : Answer;
    
    // Check if the target actually exists
    const targetExists = await ParentModel.exists({ _id: targetId });
    if (!targetExists) {
      throw new Error(`${targetType} not found.`);
    }

    const existingVote = await Vote.findOne({
      user: userId,
      targetId,
      targetType,
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // User clicked the same vote button -> Undo the vote
        await Vote.deleteOne({ _id: existingVote._id });
        await ParentModel.findByIdAndUpdate(targetId, {
          $inc: { voteScore: -value },
        });
        return { status: "removed" };
      } else {
        // User clicked the opposite vote button -> Switch vote
        const diff = value - existingVote.value; // (e.g., new 1 - old -1 = +2)
        existingVote.value = value;
        await existingVote.save();
        await ParentModel.findByIdAndUpdate(targetId, {
          $inc: { voteScore: diff },
        });
        return { status: "switched" };
      }
    } else {
      // New vote
      await Vote.create({
        user: userId,
        targetId,
        targetType,
        value,
      });
      await ParentModel.findByIdAndUpdate(targetId, {
        $inc: { voteScore: value },
      });
      return { status: "added" };
    }
  }
}
