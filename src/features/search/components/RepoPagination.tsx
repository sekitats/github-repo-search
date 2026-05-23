import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export type Props = {
  q: string;
  page: number;
  totalPages: number;
};

export function RepoPagination({ q, page, totalPages }: Props) {
  const prevUrl = page <= 1 ? undefined : `?q=${q}&page=${page - 1}`;
  const nextUrl = page >= totalPages ? undefined : `?q=${q}&page=${page + 1}`;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={prevUrl}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={nextUrl}
            aria-disabled={page >= totalPages}
            className={
              page >= totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
