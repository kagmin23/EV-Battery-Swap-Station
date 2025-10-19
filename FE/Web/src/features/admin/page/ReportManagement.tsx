import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Star,
  Download,
  Calendar,
  Filter,
  BatteryCharging,
  MapPin,
  Package,
  Clock,
  DollarSign,
  Receipt,
  CreditCard,
  TrendingUp,
  Users,
  UserCheck,
  UserPlus,
  Layers,
  Activity,
  RotateCw,
  Wrench,
  AlertTriangle,
  Headphones,
  MessageSquare,
  Timer,
  CheckCircle,
} from 'lucide-react';
import { ReportCard } from '../components/ReportCard';
import { ReportGeneratorModal } from '../components/ReportGeneratorModal';
import { reportTemplates, recentReports, getCategoryLabel } from '@/mock/ReportData';
import type { ReportTemplate } from '@/mock/ReportData';
import { CardSkeleton } from '@/components/ui/table-skeleton';

const iconMap: Record<string, React.ElementType> = {
  'battery-charging': BatteryCharging,
  'map-pin': MapPin,
  'package': Package,
  'clock': Clock,
  'dollar-sign': DollarSign,
  'receipt': Receipt,
  'credit-card': CreditCard,
  'trending-up': TrendingUp,
  'users': Users,
  'user-check': UserCheck,
  'user-plus': UserPlus,
  'layers': Layers,
  'activity': Activity,
  'rotate-cw': RotateCw,
  'wrench': Wrench,
  'alert-triangle': AlertTriangle,
  'headphones': Headphones,
  'message-square': MessageSquare,
  'timer': Timer,
  'check-circle': CheckCircle,
};

const getIconColors = (category: string): { iconColor: string; iconBg: string } => {
  const colorMap: Record<string, { iconColor: string; iconBg: string }> = {
    'operational': { iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
    'financial': { iconColor: 'text-green-600', iconBg: 'bg-green-100' },
    'user-staff': { iconColor: 'text-purple-600', iconBg: 'bg-purple-100' },
    'battery-health': { iconColor: 'text-orange-600', iconBg: 'bg-orange-100' },
    'customer-service': { iconColor: 'text-pink-600', iconBg: 'bg-pink-100' },
  };
  return colorMap[category] || { iconColor: 'text-gray-600', iconBg: 'bg-gray-100' };
};

export default function ReportManagement() {
  const [isLoading] = useState(false); // Set to true when integrating real API
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(reportTemplates.filter(r => r.isFavorite).map(r => r.id))
  );
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reportTemplates.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
      const matchesFavorite = !showFavoritesOnly || favorites.has(report.id);
      
      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [searchQuery, selectedCategory, showFavoritesOnly, favorites]);

  // Group reports by category
  const groupedReports = useMemo(() => {
    const groups: Record<string, ReportTemplate[]> = {};
    filteredReports.forEach(report => {
      if (!groups[report.category]) {
        groups[report.category] = [];
      }
      groups[report.category].push(report);
    });
    return groups;
  }, [filteredReports]);

  const toggleFavorite = (reportId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(reportId)) {
        newFavorites.delete(reportId);
      } else {
        newFavorites.add(reportId);
      }
      return newFavorites;
    });
  };

  const handleGenerateReport = (report: ReportTemplate) => {
    setSelectedReport(report);
    setIsGeneratorOpen(true);
  };

  const handleViewReport = (report: ReportTemplate) => {
    // Navigate to specific report view (e.g., Revenue Report)
    if (report.id === 'revenue-report') {
      window.location.href = '#/admin/revenue-report';
    } else {
      alert(`Viewing ${report.title} - Preview functionality coming soon!`);
    }
  };

  const categories = [
    { value: 'all', label: 'All Reports', count: reportTemplates.length },
    { value: 'operational', label: 'Operational', count: reportTemplates.filter(r => r.category === 'operational').length },
    { value: 'financial', label: 'Financial', count: reportTemplates.filter(r => r.category === 'financial').length },
    { value: 'user-staff', label: 'User & Staff', count: reportTemplates.filter(r => r.category === 'user-staff').length },
    { value: 'battery-health', label: 'Battery Health', count: reportTemplates.filter(r => r.category === 'battery-health').length },
    { value: 'customer-service', label: 'Customer Service', count: reportTemplates.filter(r => r.category === 'customer-service').length },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 bg-gray-200 rounded dark:bg-gray-700 mb-2" />
          <div className="h-5 w-96 bg-gray-200 rounded-full dark:bg-gray-700" />
        </div>
        
        {/* Search & Filters Skeleton */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="animate-pulse">
            <div className="h-10 w-full bg-gray-200 rounded dark:bg-gray-700 mb-4" />
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-32 bg-gray-200 rounded dark:bg-gray-700" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Report Templates Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="animate-pulse">
                <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-4" />
                <div className="h-4 w-full bg-gray-200 rounded-full dark:bg-gray-700 mb-2" />
                <div className="h-4 w-3/4 bg-gray-200 rounded-full dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Recent Reports Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-20 bg-gray-200 rounded dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
          <FileText className="w-8 h-8" />
          Quản lý Báo cáo
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Tạo, xem và quản lý báo cáo toàn diện cho Trạm đổi Pin EV
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Tổng báo cáo</p>
              <p className="text-2xl font-bold text-slate-800">{reportTemplates.length}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Yêu thích</p>
              <p className="text-2xl font-bold text-slate-800">{favorites.size}</p>
            </div>
            <Star className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Tạo hôm nay</p>
              <p className="text-2xl font-bold text-slate-800">{recentReports.filter(r => r.generatedDate.includes('2024-10-14')).length}</p>
            </div>
            <Calendar className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Tải xuống gần đây</p>
              <p className="text-2xl font-bold text-slate-800">{recentReports.length}</p>
            </div>
            <Download className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm báo cáo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Favorites Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              showFavoritesOnly
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </button>
        </div>
      </div>

      {/* Report Cards - Grouped by Category */}
      {Object.keys(groupedReports).length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">No reports found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        Object.entries(groupedReports).map(([category, reports]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Filter className="w-6 h-6" />
              {getCategoryLabel(category)}
              <span className="text-sm font-normal text-slate-500">({reports.length} reports)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {reports.map(report => {
                const IconComponent = iconMap[report.iconType] || FileText;
                const colors = getIconColors(report.category);
                return (
                  <ReportCard
                    key={report.id}
                    title={report.title}
                    description={report.description}
                    icon={IconComponent as React.ElementType}
                    category={getCategoryLabel(report.category)}
                    lastGenerated={report.lastGenerated}
                    isFavorite={favorites.has(report.id)}
                    onGenerate={() => handleGenerateReport(report)}
                    onView={() => handleViewReport(report)}
                    onToggleFavorite={() => toggleFavorite(report.id)}
                    iconColor={colors.iconColor}
                    iconBg={colors.iconBg}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Recent Reports Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Recent Reports
        </h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Report Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Generated Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Format</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Size</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-slate-900 font-medium">{report.reportTitle}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">{report.generatedDate}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {report.format}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{report.size}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'completed' ? 'bg-green-100 text-green-800' :
                        report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        onClick={() => alert(`Downloading ${report.reportTitle}`)}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Generator Modal */}
      {selectedReport && (
        <ReportGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={() => {
            setIsGeneratorOpen(false);
            setSelectedReport(null);
          }}
          reportTitle={selectedReport.title}
          reportType={selectedReport.id}
        />
      )}
    </div>
  );
}
