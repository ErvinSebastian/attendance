import React, { ReactNode } from 'react';

interface CardDataStatsProps {
  title: string;
  totalPresent: string;
  totalLate: string;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  totalPresent,
  totalLate,
}) => {
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        {children}
      </div> */}

      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {title}
          </h4>

          <div className="flex-col">
            <div>
              <span className="text-sm font-medium">Total Present</span>
            </div>
            <div>
              <span className="text-sm font-medium">Total Late</span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex-col">
            <div>
              <span className={`gap-1 text-sm font-medium text-meta-3`}>
                {totalPresent}
              </span>
            </div>
            <div>
              <span className={`gap-1 text-sm font-medium text-meta-7`}>
                {totalLate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDataStats;
