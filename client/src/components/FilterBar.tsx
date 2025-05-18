import React, { useState } from 'react';
import DateRangePicker from './DateRangePicker';
import { Search } from 'lucide-react';

interface FilterBarProps {
  onSearch: (query: string) => void;
  onTypeFilter?: (type: string) => void;
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  transactionTypes?: string[];
  showTypeFilter?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onTypeFilter,
  onDateRangeChange,
  transactionTypes = [],
  showTypeFilter = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange(start, end);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setSelectedType(type);
    if (onTypeFilter) {
      onTypeFilter(type);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-1">
          <form onSubmit={handleSearch}>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {showTypeFilter && transactionTypes.length > 0 && (
          <div className="col-span-1">
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
              Transaction Type
            </label>
            <select
              id="type-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedType}
              onChange={handleTypeChange}
            >
              <option value="">All Types</option>
              {transactionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            onChange={handleDateRangeChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;