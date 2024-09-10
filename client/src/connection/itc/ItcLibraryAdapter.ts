// Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { commands } from "vscode";

import { ChildProcessWithoutNullStreams } from "child_process";

import { onRunError } from "../../commands/run";
import {
  LibraryAdapter,
  LibraryItem,
  TableData,
  TableRow,
} from "../../components/LibraryNavigator/types";
import { Column, ColumnCollection } from "../rest/api/compute";
import { runCode } from "./CodeRunner";
import { query } from "./QueryRunner";
import { Config } from "./types";

class ItcLibraryAdapter implements LibraryAdapter {
  protected hasEstablishedConnection: boolean = false;
  protected shellProcess: ChildProcessWithoutNullStreams;
  protected pollingForLogResults: boolean = false;
  protected log: string[] = [];
  protected endTag: string = "";
  protected outputFinished: boolean = false;
  protected config: Config;

  public async connect(): Promise<void> {
    this.hasEstablishedConnection = true;
  }

  public async setup(): Promise<void> {
    if (this.hasEstablishedConnection) {
      return;
    }

    await this.connect();
  }

  public async deleteTable(item: LibraryItem): Promise<void> {
    const code = `
      proc datasets library=${item.library} nolist nodetails; delete ${item.name}; run;
    `;

    await this.runCode(code);
  }

  public async getColumns(item: LibraryItem): Promise<ColumnCollection> {
    const sql = `
      select catx(',', name, type, varnum)
        from sashelp.vcolumn
        where libname='${item.library}' and memname='${item.name}'
        order by varnum
    `;

    const columnLines = processQueryRows(await this.query(sql));

    const columns = columnLines.map((lineText): Column => {
      const [name, type, index] = lineText.split(",");

      return {
        name,
        type,
        index: parseInt(index, 10),
      };
    });

    return {
      items: columns,
      count: -1,
    };
  }

  public async getLibraries(): Promise<{
    items: LibraryItem[];
    count: number;
  }> {
    const sql = `select catx(',', libname, readonly) from sashelp.vlibnam order by libname asc`;
    const libNames = processQueryRows(await this.query(sql));

    const libraries = libNames.map((lineText): LibraryItem => {
      const [libName, readOnlyValue] = lineText.split(",");

      return {
        type: "library",
        uid: libName,
        id: libName,
        name: libName,
        readOnly: readOnlyValue === "yes",
      };
    });

    return {
      items: libraries,
      count: -1,
    };
  }

  public async getRows(
    item: LibraryItem,
    start: number,
    limit: number,
  ): Promise<TableData> {
    const { rows: rawRowValues, count } = await this.getDatasetInformation(
      item,
      start,
      limit,
    );

    const rows = rawRowValues.map((line, idx: number): TableRow => {
      const rowData = [`${start + idx + 1}`].concat(line);
      return { cells: rowData };
    });

    return {
      rows,
      count,
    };
  }

  public async getRowsAsCSV(
    item: LibraryItem,
    start: number,
    limit: number,
  ): Promise<TableData> {
    // We only need the columns for the first page of results
    const columns =
      start === 0
        ? {
            columns: ["INDEX"].concat(
              (await this.getColumns(item)).items.map((column) => column.name),
            ),
          }
        : {};

    const { rows } = await this.getRows(item, start, limit);

    rows.unshift(columns);

    // Fetching csv doesn't rely on count. Instead, we get the count
    // upfront via getTableRowCount
    return { rows, count: -1 };
  }

  public async getTableRowCount(
    item: LibraryItem,
  ): Promise<{ rowCount: number; maxNumberOfRowsToRead: number }> {
    const code = `SELECT COUNT(1) FROM ${item.library}.${item.name}`;

    const output = processQueryRows(await this.query(code))[0];
    const rowCount = parseInt(output.replace(/[^0-9]/g, ""), 10);

    return { rowCount, maxNumberOfRowsToRead: 100 };
  }

  public async getTables(item: LibraryItem): Promise<{
    items: LibraryItem[];
    count: number;
  }> {
    const sql = `
      select memname from sashelp.vtable
        where libname='${item.name!}'
        order by memname asc
    `;

    const tableNames = processQueryRows(await this.query(sql));

    const tables = tableNames.map((lineText): LibraryItem => {
      const [table] = lineText.split(",");

      return {
        type: "table",
        uid: `${item.name!}.${table}`,
        id: table,
        name: table,
        library: item.name,
        readOnly: item.readOnly,
      };
    });

    return { items: tables, count: -1 };
  }

  protected async getDatasetInformation(
    item: LibraryItem,
    start: number,
    limit: number,
  ): Promise<{ rows: Array<string[]>; count: number }> {
    const count = await this.getTableRowCount(item);
    const sql = `select * from ${item.library}.${item.name}(firstobs=${start + 1} obs=${start + 1 + limit})`;

    const output = await this.query(sql);

    const [columnCountStr, ...rows] = output.trim().split("\n");
    const columnCount = parseInt(columnCountStr, 10);
    const result = [];
    for (let i = 0; i * columnCount < rows.length; i++) {
      result[i] = rows.slice(i * columnCount, i * columnCount + columnCount);
    }
    return { rows: result, count: count.rowCount };
  }

  protected async runCode(
    code: string,
    startTag: string = "",
    endTag: string = "",
  ): Promise<string> {
    try {
      return await runCode(code, startTag, endTag);
    } catch (e) {
      onRunError(e);
      commands.executeCommand("setContext", "SAS.librariesDisplayed", false);
      return "";
    }
  }

  protected async query(code: string): Promise<string> {
    try {
      return await query(code);
    } catch (e) {
      onRunError(e);
      commands.executeCommand("setContext", "SAS.librariesDisplayed", false);
      return "";
    }
  }
}

const processQueryRows = (response: string): string[] => {
  const processedResponse = response.trim();
  if (!processedResponse) {
    return [];
  }

  const [, ...rows] = processedResponse.split("\n");
  return rows.filter((value, index, array) => array.indexOf(value) === index);
};

export default ItcLibraryAdapter;
