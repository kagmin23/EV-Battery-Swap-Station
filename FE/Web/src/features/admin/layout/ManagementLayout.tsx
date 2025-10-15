import React, { useState } from 'react';
import { ManagementSidebar } from '../components/ManagementSidebar';
import { CommonHeader } from '@/components/common/CommonHeader';

interface ManagementLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const ManagementLayout: React.FC<ManagementLayoutProps> = ({
    children,
    activeTab,
    onTabChange
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            {/* Header */}
            <CommonHeader />

            {/* Main Layout */}
            <div className="flex-1 flex" style={{ height: 'calc(100vh - 56px)' }}>
                {/* Sidebar */}
                <ManagementSidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={handleToggleCollapse}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
