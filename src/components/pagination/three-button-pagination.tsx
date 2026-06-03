import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import SelectComponent from "@/components/inputComponents/select-component";

interface ThreeButtonPaginationProps {
  page: number;
  setPage: (value: number) => void;
  totalPages: number;
  limit: number;
  setLimit: (value: number) => void;
}

const ThreeButtonPagination = ({
  page,
  setPage,
  totalPages,
  limit,
  setLimit,
}: ThreeButtonPaginationProps) => {
  return (
    <div className="flex items-center justify-center gap-4 py-4 border-t border-border mt-4">
      <div className="flex items-center gap-2 w-fit">
        <SelectComponent
          value={String(limit)}
          onValueChange={(val) => {
            setLimit(Number(val));
            setPage(1);
          }}
          data={[
            { name: "10", value: "10" },
            { name: "25", value: "25" },
            { name: "50", value: "50" },
            { name: "100", value: "100" },
          ]}
          placeholder="Rows"
          title="Rows per page"
          className="w-20"
        />
      </div>

      <Pagination className="select-none mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="cursor-pointer"
            />
          </PaginationItem>

          {page > 2 && totalPages > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink
              isActive={page === 1}
              onClick={() =>
                setPage(
                  page === 1
                    ? page
                    : page === totalPages
                      ? totalPages === 2
                        ? page - 1
                        : page - 2
                      : page - 1,
                )
              }
              className="cursor-pointer"
            >
              {page === 1
                ? page
                : page === totalPages
                  ? totalPages === 2
                    ? page - 1
                    : page - 2
                  : page - 1}
            </PaginationLink>
          </PaginationItem>

          {totalPages > 1 && (
            <PaginationItem>
              <PaginationLink
                isActive={
                  (totalPages === 2 && page === 2) ||
                  (page !== 1 && page !== totalPages)
                }
                onClick={() =>
                  setPage(
                    page === 1
                      ? page + 1
                      : page === totalPages
                        ? totalPages === 2
                          ? page
                          : page - 1
                        : page,
                  )
                }
                className="cursor-pointer"
              >
                {page === 1
                  ? page + 1
                  : page === totalPages
                    ? totalPages === 2
                      ? page
                      : page - 1
                    : page}
              </PaginationLink>
            </PaginationItem>
          )}

          {totalPages > 2 && (
            <PaginationItem>
              <PaginationLink
                isActive={page === totalPages}
                onClick={() =>
                  setPage(
                    page === 1 ? page + 2 : page === totalPages ? page : page + 1,
                  )
                }
                className="cursor-pointer"
              >
                {page === 1 ? page + 2 : page === totalPages ? page : page + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {totalPages > 3 && page !== totalPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="cursor-pointer"
            >
              Next
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ThreeButtonPagination;
