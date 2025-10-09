import React, { useState } from 'react';
import { ManagementSidebar } from '../components/ManagementSidebar';

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className="flex h-screen">
                {/* Sidebar */}
                <ManagementSidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={handleToggleCollapse}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
