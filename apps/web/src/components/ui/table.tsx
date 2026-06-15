import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        'w-full border-collapse rounded-2xl border border-border bg-white text-sm',
        className,
      )}
      {...props}
    />
  );
}
export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-muted text-left text-muted-foreground" {...props} />;
}
export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-border" {...props} />;
}
export function TableRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className="hover:bg-muted/60" {...props} />;
}
export function TableHead(props: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className="px-4 py-3 font-semibold" {...props} />;
}
export function TableCell(props: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-4 py-3" {...props} />;
}
export function TableEmpty({
  colSpan,
  children = 'Nenhum registro encontrado.',
}: {
  colSpan: number;
  children?: ReactNode;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  );
}
