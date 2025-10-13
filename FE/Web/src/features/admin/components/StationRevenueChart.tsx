import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { type RevenueByStation } from '@/mock/RevenueData';

Chart.register(...registerables);

interface StationRevenueChartProps {
  data: RevenueByStation[];
}

export const StationRevenueChart: React.FC<StationRevenueChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedData.map(s => s.stationName),
        datasets: [
          {
            label: 'Revenue (VND)',
            data: sortedData.map(s => s.revenue),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)',
              'rgb(139, 92, 246)',
              'rgb(239, 68, 68)',
            ],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                const station = sortedData[context.dataIndex];
                return [
                  `Revenue: ${new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(value)}`,
                  `Transactions: ${station.transactions}`,
                  `Growth: ${station.growthRate >= 0 ? '+' : ''}${station.growthRate}%`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat('vi-VN', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value as number) + ' VND';
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue by Station</h3>
      <div className="h-80">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

