import { UpvoteReceivedStrategy } from "./UpvoteReceivedStrategy";
import { DownvoteReceivedStrategy } from "./DownvoteReceivedStrategy";

// Maps vote values to their reputation strategy
const strategies = new Map([
  [1, new UpvoteReceivedStrategy()],
  [-1, new DownvoteReceivedStrategy()],
]);

const ReputationStrategyRegistry = {
  // Look up and execute the strategy for a given vote value
  getRepChange(voteValue) {
    const strategy = strategies.get(voteValue);
    if (!strategy) {
      throw new Error(`No reputation strategy registered for vote value: ${voteValue}`);
    }
    return strategy.calculate();
  },

  // Register a new strategy at runtime (Open/Closed — extend without modifying existing code)
  register(voteValue, strategy) {
    strategies.set(voteValue, strategy);
  },
};

export default ReputationStrategyRegistry;
