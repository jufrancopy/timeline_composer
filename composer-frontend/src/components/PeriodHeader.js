import React from 'react';

const PeriodHeader = ({ period }) => {
  return (
    <div className="relative text-center my-12">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-700" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-slate-900 px-4 text-2xl font-semibold text-purple-300">
          {period}
        </span>
      </div>
    </div>
  );
};

export default PeriodHeader;
