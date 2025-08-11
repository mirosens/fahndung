import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { usePagination } from "./usePagination";

interface ModernPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showItemsInfo?: boolean;
  showQuickJump?: boolean;
}

export const ModernPagination: React.FC<ModernPaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage = 6,
  onPageChange,
  className = "",
  showItemsInfo = true,
  showQuickJump = false,
}) => {
  const [jumpValue, setJumpValue] = useState("");

  const paginationRange = usePagination({
    currentPage,
    totalItems,
    itemsPerPage,
    siblingCount: 1,
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleQuickJump = () => {
    const page = parseInt(jumpValue);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpValue("");
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Items Info */}
      {showItemsInfo && (
        <div
          className="
          rounded-lg border border-white/30 bg-white/40 px-4 py-2
          text-sm text-gray-600 shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-[25px]
          dark:border-white/15 dark:bg-black/30
          dark:text-gray-300
          dark:shadow-[0_2px_12px_rgba(255,255,255,0.05)]
        "
        >
          Zeige {startItem}-{endItem} von {totalItems} Einträgen
        </div>
      )}

      {/* Hauptpagination */}
      <div
        className="
        relative flex items-center gap-1 rounded-xl
        border border-white/40 bg-white/35
        p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] 
        backdrop-blur-[45px]
        backdrop-saturate-150 transition-all
        duration-300
        before:absolute before:inset-0
        before:rounded-xl before:bg-gradient-to-b before:from-white/10
        before:to-transparent dark:border-white/15 dark:bg-black/30
        dark:shadow-[0_4px_20px_rgba(255,255,255,0.03)] dark:before:from-black/20
      "
      >
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="
            group rounded-lg border border-white/30
            bg-white/50 p-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-[20px]
            transition-all duration-200 hover:scale-105
            hover:border-white/50 hover:bg-white/70 disabled:cursor-not-allowed
            disabled:opacity-40 disabled:hover:scale-100 dark:border-white/15
            dark:bg-black/30
            dark:hover:bg-black/50
          "
        >
          <ChevronLeft className="h-4 w-4 text-gray-600 transition-colors group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === "...") {
              return (
                <div
                  key={index}
                  className="
                  rounded-lg bg-white/30 px-3 py-2
                  text-gray-400 backdrop-blur-[15px] dark:bg-black/20
                  dark:text-gray-500
                "
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            const isActive = pageNumber === currentPage;

            return (
              <button
                key={index}
                onClick={() => handlePageChange(pageNumber as number)}
                className={`
                  h-10 min-w-[40px] transform rounded-lg px-3 text-sm
                  font-medium transition-all duration-200
                  ${
                    isActive
                      ? `
                      scale-105 border border-blue-400/50 
                      bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white
                      shadow-[0_4px_16px_rgba(59,130,246,0.3)] backdrop-blur-[30px]
                      hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] dark:from-blue-400/80
                      dark:to-purple-500/80
                    `
                      : `
                      border border-white/30 bg-white/50 text-gray-700
                      shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-[20px]
                      hover:scale-105 hover:border-white/50 hover:bg-white/70
                      hover:text-blue-600 dark:border-white/15 dark:bg-black/30
                      dark:text-gray-300
                      dark:hover:bg-black/50 dark:hover:text-blue-400
                    `
                  }
                `}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="
            group rounded-lg border border-white/30
            bg-white/50 p-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-[20px]
            transition-all duration-200 hover:scale-105
            hover:border-white/50 hover:bg-white/70 disabled:cursor-not-allowed
            disabled:opacity-40 disabled:hover:scale-100 dark:border-white/15
            dark:bg-black/30
            dark:hover:bg-black/50
          "
        >
          <ChevronRight className="h-4 w-4 text-gray-600 transition-colors group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400" />
        </button>
      </div>

      {/* Quick Jump */}
      {showQuickJump && totalPages > 10 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Springe zu:
          </span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuickJump()}
            className="
              w-16 rounded-lg border border-white/30 bg-white/50 px-2
              py-1 text-center text-sm backdrop-blur-[20px]
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              dark:border-white/15 dark:bg-black/30
            "
            placeholder={currentPage.toString()}
          />
          <button
            onClick={handleQuickJump}
            className="
              rounded-lg bg-blue-500/80 px-3 py-1
              text-sm text-white backdrop-blur-[20px]
              transition-all duration-200 hover:bg-blue-600/80
              dark:bg-blue-400/80 dark:hover:bg-blue-500/80
            "
          >
            Los
          </button>
        </div>
      )}
    </div>
  );
};
