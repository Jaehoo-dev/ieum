export function calculateBmi(height: number, weight: number) {
  return weight / Math.pow(height / 100, 2);
}

export function getBmiLabel(bmi: number) {
  if (bmi < 18.5) {
    return "저체중";
  }

  if (bmi < 23) {
    return "정상";
  }

  if (bmi < 25) {
    return "과체중";
  }

  return "비만";
}
