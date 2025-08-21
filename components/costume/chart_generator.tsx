'use client'
type ChartProps = {
  title: string;
  type: "bar";
  data: {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor?: string }[];
  };
};

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function ChartBlock({ title, type, data }: ChartProps) {
  // 1. Transform Chart.js style data into Recharts format
  const chartData = data.labels.map((label, index) => {
    const row: any = { name: label };
    data.datasets.forEach((dataset) => {
      row[dataset.label] = dataset.data[index];
    });
    return row;
  });

  // 2. Use first dataset as bars (you can map all if needed)
  return (
    <div className="w-full h-72 mx-2 my-8">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {data.datasets.map((dataset) => (
            <Bar
              key={dataset.label}
              dataKey={dataset.label}
              fill={dataset.backgroundColor ?? "#8884d8"}
              barSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
