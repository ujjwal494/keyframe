import { ReputationStrategy } from "./ReputationStrategy";

// Awards +15 reputation to the answer author when their answer is accepted
export class AcceptedAnswerStrategy extends ReputationStrategy {
  calculate() {
    return 15;
  }
}
