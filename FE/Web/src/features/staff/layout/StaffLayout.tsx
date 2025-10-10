import React, { useState } from 'react';
import { StaffSidebar } from '../components/StaffSidebar';

interface StaffLayoutProps {
    children: React.ReactNode;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/50">
            <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
                {/* Sidebar */}
                <StaffSidebar
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

