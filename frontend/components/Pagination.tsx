import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination";
  
  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  const CustomPagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 3;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 2) {
          pages.push(1, 2, 3);
          if (totalPages > 3) pages.push('...');
        } else if (currentPage >= totalPages - 1) {
          if (totalPages > 3) pages.push('...');
          pages.push(totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push('...');
          pages.push(currentPage - 1, currentPage, currentPage + 1);
          pages.push('...');
        }
      }
      
      return pages;
    };
  
    return (
      <div className="flex items-center justify-center gap-4">
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none cursor-not-allowed opacity-50" : ""}
              />
            </PaginationItem>
            
            {getVisiblePages().map((page, index) => (
              <PaginationItem key={index}>
                {page === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page as number);
                    }}
                    isActive={page === currentPage}
                    className={page === currentPage ? "bg-white border-gray-300 text-gray-900" : ""}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none cursor-not-allowed opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };
  
  export default CustomPagination; 