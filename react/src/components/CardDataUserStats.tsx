import React, { ReactNode } from 'react';

interface CardDataUserStatsProps {
  title: string;
  totalApproved: string;
  totalUnapproved: string;
}

const CardDataUserStats: React.FC<CardDataUserStatsProps> = ({
  title,
  totalApproved,
  totalUnapproved,
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
              <span className="text-sm font-medium">Total Approved : </span>
            </div>
            <div>
              <span className="text-sm font-medium">Total Unapproved :</span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex-col">
            <div>
              <span className={`gap-1 text-sm font-medium text-meta-3`}>
                {totalApproved}
              </span>
            </div>
            <div>
              <span className={`gap-1 text-sm font-medium text-meta-7`}>
                {totalUnapproved}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDataUserStats;
