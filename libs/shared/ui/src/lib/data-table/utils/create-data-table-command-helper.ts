import { DataTableCommand } from '../types';

export const createDataTableCommandHelper = () => ({
  command: (command: DataTableCommand) => command,
});
