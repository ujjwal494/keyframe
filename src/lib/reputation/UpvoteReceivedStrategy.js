import { ReputationStrategy } from "./ReputationStrategy";

// Awards +10 reputation when a post receives an upvote
export class UpvoteReceivedStrategy extends ReputationStrategy {
  calculate() {
    return 10;
  }
}
