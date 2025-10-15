import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { type RevenueByPaymentMethod } from '@/mock/RevenueData';

Chart.register(...registerables);

interface PaymentMethodChartProps {
  data: RevenueByPaymentMethod[];
}

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.method),
        datasets: [
          {
            data: data.map(d => d.amount),
            backgroundColor: data.map(d => d.color),
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
              },
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const method = data[context.dataIndex];
                return [
                  `${method.method}: ${new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(value)}`,
                  `${method.percentage}% of total`,
                ];
              },
            },
          },
        },
        cutout: '65%',
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
      <h3 className="text-lg font-bold text-slate-800 mb-4">Payment Methods</h3>
      <div className="h-80 flex items-center justify-center">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

