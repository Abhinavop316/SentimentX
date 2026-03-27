const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const ratioToColor = (positive, negative, neutral, total) => {
  if (!total) return "rgba(250, 250, 150, 0.55)";

  const p = positive / total;
  const n = negative / total;
  const u = neutral / total;

  if (n > p && n > u) {
    const alpha = clamp(0.3 + n * 0.9, 0.34, 0.96);
    return `rgba(255, 77, 79, ${alpha})`;
  }

  if (p > n && p > u) {
    const alpha = clamp(0.3 + p * 0.85, 0.34, 0.96);
    return `rgba(16, 185, 129, ${alpha})`;
  }

  const alpha = clamp(0.3 + u * 0.85, 0.34, 0.96);
  return `rgba(245, 158, 11, ${alpha})`;
};

export const renderHeatmap = ({
  container,
  groupedBooths,
  onBoothClick,
  boothCount = 48
}) => {
  container.innerHTML = "";

  for (let boothId = 1; boothId <= boothCount; boothId += 1) {
    const row = groupedBooths.get(boothId) || { total: 0, Positive: 0, Negative: 0, Neutral: 0 };
    const cell = document.createElement("button");
    cell.className = "heat-cell";
    cell.type = "button";
    cell.textContent = boothId;
    cell.style.background = ratioToColor(row.Positive, row.Negative, row.Neutral, row.total);
    cell.title = `Booth ${boothId} | P:${row.Positive} N:${row.Negative} U:${row.Neutral}`;

    cell.addEventListener("click", () => onBoothClick(boothId));
    container.appendChild(cell);
  }
};
