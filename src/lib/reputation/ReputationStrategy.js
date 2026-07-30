// Base class — every reputation strategy must implement calculate()
export class ReputationStrategy {
  calculate() {
    throw new Error("Subclasses must implement calculate()");
  }
}
