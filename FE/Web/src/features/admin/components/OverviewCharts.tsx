import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface OverviewChartsProps {
    stationsData: { labels: string[]; active: number[]; maintenance: number[] };
    staffData: { labels: string[]; data: number[] };
    complaintsData: { labels: string[]; pending: number[]; resolved: number[] };
}

export const OverviewCharts: React.FC<OverviewChartsProps> = ({
    stationsData,
    staffData,
    complaintsData
}) => {
    const stationsChartRef = useRef<HTMLCanvasElement>(null);
    const staffChartRef = useRef<HTMLCanvasElement>(null);
    const complaintsChartRef = useRef<HTMLCanvasElement>(null);
    const stationsChartInstance = useRef<Chart | null>(null);
    const staffChartInstance = useRef<Chart | null>(null);
    const complaintsChartInstance = useRef<Chart | null>(null);

    // Stations Chart
    useEffect(() => {
        if (!stationsChartRef.current) return;

        // Destroy previous chart instance
        if (stationsChartInstance.current) {
            stationsChartInstance.current.destroy();
        }

        const ctx = stationsChartRef.current.getContext('2d');
        if (!ctx) return;

        stationsChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: stationsData.labels,
                datasets: [
                    {
                        label: 'Hoạt động',
                        data: stationsData.active,
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 2
                    },
                    {
                        label: 'Bảo trì',
                        data: stationsData.maintenance,
                        backgroundColor: 'rgba(234, 179, 8, 0.8)',
                        borderColor: 'rgb(234, 179, 8)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Thống kê trạm theo trạng thái'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        return () => {
            if (stationsChartInstance.current) {
                stationsChartInstance.current.destroy();
            }
        };
    }, [stationsData]);

    // Staff Chart
    useEffect(() => {
        if (!staffChartRef.current) return;

        if (staffChartInstance.current) {
            staffChartInstance.current.destroy();
        }

        const ctx = staffChartRef.current.getContext('2d');
        if (!ctx) return;

        staffChartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: staffData.labels,
                datasets: [
                    {
                        data: staffData.data,
                        backgroundColor: [
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(239, 68, 68, 0.8)'
                        ],
                        borderColor: [
                            'rgb(34, 197, 94)',
                            'rgb(239, 68, 68)'
                        ],
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Phân bố nhân viên'
                    }
                }
            }
        });

        return () => {
            if (staffChartInstance.current) {
                staffChartInstance.current.destroy();
            }
        };
    }, [staffData]);

    // Complaints Chart
    useEffect(() => {
        if (!complaintsChartRef.current) return;

        if (complaintsChartInstance.current) {
            complaintsChartInstance.current.destroy();
        }

        const ctx = complaintsChartRef.current.getContext('2d');
        if (!ctx) return;

        complaintsChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: complaintsData.labels,
                datasets: [
                    {
                        label: 'Chờ xử lý',
                        data: complaintsData.pending,
                        borderColor: 'rgba(234, 179, 8, 0.8)',
                        backgroundColor: 'rgba(234, 179, 8, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Đã xử lý',
                        data: complaintsData.resolved,
                        borderColor: 'rgba(34, 197, 94, 0.8)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Xu hướng khiếu nại'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        return () => {
            if (complaintsChartInstance.current) {
                complaintsChartInstance.current.destroy();
            }
        };
    }, [complaintsData]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stations Bar Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <canvas ref={stationsChartRef} style={{ height: '300px' }} />
            </div>

            {/* Staff Doughnut Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <canvas ref={staffChartRef} style={{ height: '300px' }} />
            </div>

            {/* Complaints Line Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                <canvas ref={complaintsChartRef} style={{ height: '300px' }} />
            </div>
        </div>
    );
};

