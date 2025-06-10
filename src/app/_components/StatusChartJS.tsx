"use client";

import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// This registration step is required for Chart.js to work in React.
Chart.register(ArcElement, Tooltip, Legend);

interface StatusChartJSProps {
    data: {
        name: string;
        value: number;
    }[];
}

export function StatusChartJS({ data }: StatusChartJSProps) {
    // Transform the incoming data into the format Chart.js needs

    const chartData = {
        labels: data.map((item) => item.name),
        datasets: [
            {
                label: "# of Websites",
                data: data.map((item) => item.value),
                backgroundColor: [
                    "#8b5cf6", // violet-500
                    "#6366f1", // indigo-500
                    "#ec4899", // pink-500
                    "#10b981", // emerald-500
                    "#f59e0b", // amber-500
                    "#3b82f6", // blue-500
                    "#ef4444", // red-500
                    "#84cc16", // lime-500
                ],
                borderColor: "#15162c", // Your dark background color for separation
                borderWidth: 2,
            },
        ],
    };

    // Configure options to make the chart readable on a dark background
    const chartOptions = {
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    color: "#e5e7eb", // text-gray-200
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                bodyFont: {
                    size: 14,
                },
                titleFont: {
                    size: 16,
                },
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <div className="relative h-80 w-full max-w-lg rounded-xl bg-white/10 p-4">
            <Pie data={chartData} options={chartOptions} />
        </div>
    );
}