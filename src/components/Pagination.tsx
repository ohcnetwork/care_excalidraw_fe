import { Button } from "@/components/careui/button";
import { TooltipComponent } from "@/components/TooltipComponent";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PaginationProps {
  data: { totalCount: number };
  onChange: (page: number, rowsPerPage: number) => void;
  defaultPerPage: number;
  cPage: number;
  className?: string;
}
const Pagination = ({
  className = "mx-auto my-4",
  data,
  onChange,
  defaultPerPage,
  cPage,
}: PaginationProps) => {
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (defaultPerPage) {
      setRowsPerPage(defaultPerPage);
    }
    if (cPage) {
      setCurrentPage(parseInt(`${cPage}`));
    }
  }, [defaultPerPage, cPage]);

  const getPageNumbers = () => {
    const totalPage = Math.ceil(data.totalCount / rowsPerPage);
    if (totalPage === 0) return [1];

    const pageNumbers = [];

    if (currentPage === 1 && currentPage === totalPage) {
      pageNumbers.push(currentPage);
    } else if (currentPage === totalPage) {
      let tempPage = currentPage;
      let pageLimit = 3;
      while (tempPage >= 1 && pageLimit > 0) {
        pageNumbers.push(tempPage);
        tempPage--;
        pageLimit--;
      }
    } else {
      pageNumbers.push(currentPage);
      if (currentPage > 1) {
        pageNumbers.push(currentPage - 1);
        if (currentPage + 1 <= totalPage) {
          pageNumbers.push(currentPage + 1);
        }
      } else {
        pageNumbers.push(currentPage + 1);
        if (currentPage + 2 <= totalPage) {
          pageNumbers.push(currentPage + 2);
        }
      }
    }
    return pageNumbers.sort((a, b) => a - b);
  };

  const totalCount = data.totalCount;
  if (!totalCount || totalCount <= rowsPerPage) {
    return null;
  }
  const totalPage = Math.ceil(totalCount / rowsPerPage);
  const pageNumbers = getPageNumbers();

  const goToPage = (page: number) => {
    setCurrentPage(page);
    onChange(page, rowsPerPage);
    const pageContainer = window.document.getElementById("pages");
    pageContainer?.scroll({ top: 0, left: 0 });
  };

  return (
    <div className={className}>
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <NavButton
          id="prev-page"
          tooltip="Previous"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage - 1 <= 0}
          children={<ChevronLeftIcon />}
        />
        <NavButton
          id="next-page"
          tooltip="Next"
          children={<ChevronRightIcon />}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage + 1 > totalPage}
        />
      </div>

      {/* Desktop view */}
      <nav className="border-secondary-300 relative hidden rounded-lg border bg-white sm:inline-flex sm:flex-1 sm:items-center sm:justify-between">
        <NavButton
          id="first-page"
          tooltip="Jump to first page"
          children={<ChevronsLeftIcon />}
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        />
        <NavButton
          id="prev-pages"
          tooltip="Previous"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage - 1 <= 0}
          children={<ChevronLeftIcon />}
        />

        {pageNumbers.map((page) => (
          <NavButton
            id={`page-${page}`}
            key={page}
            onClick={() => goToPage(page)}
            selected={currentPage === page}
            tooltip={`Move to page ${page}`}
          >
            {page}
          </NavButton>
        ))}

        <NavButton
          id="next-pages"
          tooltip="Next"
          children={<ChevronRightIcon />}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage + 1 > totalPage}
        />
        <NavButton
          id="last-page"
          tooltip="Jump to last page"
          children={<ChevronsRightIcon />}
          onClick={() => goToPage(totalPage)}
          disabled={totalPage === 0 || currentPage === totalPage}
        />
      </nav>
    </div>
  );
};

export default Pagination;

interface NavButtonProps {
  id?: string;
  onClick: () => void;
  children: React.ReactNode;
  tooltip: string;
  disabled?: boolean | undefined;
  selected?: boolean | undefined;
}

const NavButton = (props: NavButtonProps) => {
  return (
    <TooltipComponent content={props.tooltip}>
      <Button
        id={props.id}
        disabled={props.disabled}
        onClick={props.onClick}
        variant={props.selected ? "primary" : "secondary"}
        className="rounded-none text-sm font-bold"
      >
        {props.children}
      </Button>
    </TooltipComponent>
  );
};
