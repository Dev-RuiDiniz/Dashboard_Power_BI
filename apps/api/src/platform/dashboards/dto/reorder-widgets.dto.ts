export class ReorderWidgetItemDto {
  widgetId!: string;
  displayOrder!: number;
}

export class ReorderWidgetsDto {
  items!: ReorderWidgetItemDto[];
}
