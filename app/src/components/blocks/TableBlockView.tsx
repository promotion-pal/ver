import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Block } from "@/data/types";

export function TableBlockView({ block }: { block: Extract<Block, { type: "table" }> }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {block.columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {block.rows.map((row, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <TableRow key={i}>
              {row.map((cell, j) => (
                // eslint-disable-next-line react/no-array-index-key
                <TableCell key={j} className={j === 0 ? "font-medium" : "text-muted-foreground"}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
