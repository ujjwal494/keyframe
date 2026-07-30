import { ReputationStrategy } from "./ReputationStrategy";

// Deducts -2 reputation when a post receives a downvote
export class DownvoteReceivedStrategy extends ReputationStrategy {
  calculate() {
    return -2;
  }
}
