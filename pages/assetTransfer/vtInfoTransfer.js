import { dateFormat,timeFormat } from "../../utils/util";
export class vtTransfer {
  constructor(entities, columns) {
    this.entities = entities;
    this.columns = columns;
    this.columns.forEach(item => {
      this[`${item.type}Action`](item)
    })
  }
  getFormatData() {
    return this.columns;
  }
  refAction(columnInfo) {
    const { type, column } = columnInfo;
    if (type === 'ref') {
      if (typeof this.entities[column] === 'object') {
        columnInfo.did = this.entities[column].did
        columnInfo.name = this.entities[column].name
      } else {
        columnInfo.name = this.entities[`${column}.name`]
      }
    }
  }
  enumAction(columnInfo) {
    const { type, column} = columnInfo;
    const value = this.entities[column];
    if (type === 'enum') {
      columnInfo.name = columnInfo.enum[value];
    }
  }
  timestampAction(columnInfo) {
    const { type, column} = columnInfo;
    const value = this.entities[column];
    if (type === 'timestamp') {
      columnInfo.name = dateFormat(new Date(value*1000), columnInfo.format);
    }
  }
  timeAction(columnInfo) {
    const { type, column} = columnInfo;
    const value = this.entities[column];
    if (type === 'time') {
      columnInfo.name = timeFormat(value);
    }
  }
  floatAction(columnInfo) {
    const { type, column} = columnInfo;
    const value = this.entities[column];
    if (type === 'float') {
      columnInfo.name = value / columnInfo.multiple
    }
  }
  stringAction(columnInfo) {
    const { type, column} = columnInfo;
    const value = this.entities[column];
    if (type === 'string') {
      columnInfo.name = value
    }
  }
  intAction(columnInfo) {
    const { type, column} = columnInfo;
    const value = this.entities[column];
    if (type === 'int') {
      columnInfo.name = value
    }
  }
}