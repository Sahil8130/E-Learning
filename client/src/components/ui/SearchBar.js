import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setSearchTerm } from '../../features/courses/courseSlice';

const SearchBar = ({ placeholder = "Search courses...", className = "" }) => {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector(state => state.courses.searchTerm);
  const [localQuery, setLocalQuery] = useState(searchTerm);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchTerm(localQuery));
  };

  const handleClear = () => {
    setLocalQuery('');
    dispatch(setSearchTerm(''));
  };

  return (
    <motion.form
      onSubmit={handleSearch}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder={placeholder}
        />
        {localQuery && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </motion.button>
        )}
      </div>
    </motion.form>
  );
};

export default SearchBar;
