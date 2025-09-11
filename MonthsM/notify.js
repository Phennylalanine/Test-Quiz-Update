export function notifyHubMilestone() {
  const overallLevel = parseInt(localStorage.getItem("overallLevel")) || 0;
  const milestones = [
    { level: 3, key: "notified3", message: "🎉 Overall Level 3 reached! Check the hub for a new egg!" },
    { level: 6, key: "notified6", message: "🌟 Overall Level 6 reached! Go check the hub to evolve your pet!" },
    { level: 10, key: "notified10", message: "🚀 Overall Level 10! Hub has a surprise for you!" }
  ];
  milestones.forEach(m => {
    if (overallLevel >= m.level && !localStorage.getItem(m.key)) {
      alert(m.message);
      localStorage.setItem(m.key, "true");
    }
  });
}