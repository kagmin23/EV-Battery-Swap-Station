import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { X, Calendar, Download, FileText } from 'lucide-react';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportType: string;
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  reportType,
}) => {
  const [dateRange, setDateRange] = useState<string>('last7days');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [format, setFormat] = useState<string>('pdf');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // Create mock download
      const fileName = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
      alert(`Report "${fileName}" generated successfully!`);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Generate Report</h2>
                <p className="text-blue-100 text-sm">{reportTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Date Range */}
            <div>
              <Label htmlFor="dateRange" className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </Label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Station Filter */}
            <div>
              <Label htmlFor="station" className="text-slate-700 font-semibold mb-2">
                Station
              </Label>
              <select
                id="station"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Stations</option>
                <option value="district1">District 1 Station</option>
                <option value="district3">District 3 Station</option>
                <option value="district7">District 7 Station</option>
                <option value="binhThanh">Binh Thanh Station</option>
                <option value="thuDuc">Thu Duc Station</option>
              </select>
            </div>

            {/* Export Format */}
            <div>
              <Label htmlFor="format" className="text-slate-700 font-semibold mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Format
              </Label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="pdf">PDF Document</option>
                <option value="csv">CSV (Excel Compatible)</option>
                <option value="xlsx">Excel Workbook</option>
                <option value="json">JSON Data</option>
              </select>
            </div>

            {/* Additional Options */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-700 mb-3">Additional Options</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500" defaultChecked />
                  <span className="text-sm text-slate-600">Include charts and visualizations</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500" defaultChecked />
                  <span className="text-sm text-slate-600">Include detailed data tables</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-slate-600">Send copy via email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-slate-600">Schedule for recurring generation</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-6 rounded-b-2xl flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isGenerating}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

