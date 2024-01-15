import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MediaPaginationProps {
  currentPage: number;
  query?: string;
  type?: string;
  onClick: (page: number) => void;
  totalPages: number;
}

const MediaPagination: React.FC<MediaPaginationProps> = ({
  currentPage,
  query,
  type,
  onClick,
  totalPages,
}) => {
  const generateURL = (page: number) =>
    `/search?q=${query}&t=${type}&p=${page}`;

  return (
    <Pagination>
      <PaginationContent className="my-2">
        <PaginationItem>
          <PaginationPrevious
            href={type ? generateURL(currentPage - 1) : ""}
            onClick={() =>
              onClick(currentPage > 0 ? currentPage - 1 : currentPage)
            }
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page, idx, array) => {
            if (idx > 2) return;
            return (
              <PaginationItem key={idx}>
                <PaginationLink
                  isActive={currentPage === page}
                  href={type ? generateURL(page) : ""}
                  onClick={() => onClick(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          }
        )}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            isActive={currentPage === totalPages}
            href={generateURL(totalPages)}
            onClick={() => onClick(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={type ? generateURL(currentPage + 1) : ""}
            onClick={() =>
              onClick(
                currentPage === totalPages ? currentPage : currentPage + 1
              )
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default MediaPagination;
