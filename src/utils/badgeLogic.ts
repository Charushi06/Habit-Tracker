export interface Badge {
  name: string;
  level: string;
  color: string;
  icon: string;
  description: string;
}

export const getBadgeDetails = (streak: number): Badge | null => {
  if (streak >= 30) {
    return {
      name: "Habit Legend",
      level: "Gold",
      color: "#FFD700",
      icon: "🏆",
      description: "30+ Days of Consistency!"
    };
  } else if (streak >= 10) {
    return {
      name: "Consistent Achiever",
      level: "Silver",
      color: "#C0C0C0",
      icon: "🥈",
      description: "10+ Days of Consistency!"
    };
  } else if (streak >= 3) {
    return {
      name: "Fast Starter",
      level: "Bronze",
      color: "#CD7F32",
      icon: "🥉",
      description: "3+ Days of Consistency!"
    };
  }
  return null;
};
