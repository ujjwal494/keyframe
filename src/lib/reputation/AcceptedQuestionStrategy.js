import { ReputationStrategy } from "./ReputationStrategy";

// Awards +5 reputation to the question author when they accept an answer (reward for curating)
export class AcceptedQuestionStrategy extends ReputationStrategy {
  calculate() {
    return 5;
  }
}
