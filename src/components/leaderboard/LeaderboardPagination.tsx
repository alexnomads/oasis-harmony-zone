
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

type LeaderboardPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const LeaderboardPagination = ({ currentPage, totalPages, onPageChange }: LeaderboardPaginationProps) => {
  // Generate pagination links array
  const getPaginationLinks = () => {
    const links = [];
    const maxLinks = 5; // Maximum number of page links to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxLinks / 2));
    const endPage = Math.min(totalPages, startPage + maxLinks - 1);
    
    // Adjust startPage if we're near the end
    startPage = Math.max(1, endPage - maxLinks + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      links.push(i);
    }
    
    return links;
  };

  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
          />
        </PaginationItem>
        
        {getPaginationLinks().map(page => (
          <PaginationItem key={page}>
            <PaginationLink 
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
