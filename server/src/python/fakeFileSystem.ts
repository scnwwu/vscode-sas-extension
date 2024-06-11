/*
 * fakeFileSystem.ts
 *
 * simulate real fs access.
 */
import { ConsoleInterface } from "pyright-internal-browser/src/common/console";
import type {
  FileSystem,
  FileWatcherProvider,
} from "pyright-internal-browser/src/common/fileSystem";
import {
  directoryExists,
  getDirectoryPath,
} from "pyright-internal-browser/src/common/pathUtils";
import { TestFileSystem } from "pyright-internal-browser/src/tests/harness/vfs/filesystem";

import { typeShed } from './typeShed';

export function createFromRealFileSystem(
  console?: ConsoleInterface,
  fileWatcherProvider?: FileWatcherProvider,
): FileSystem {
  const fs = new TestFileSystem(false, { cwd: "/" });

  // install builtin types
  for (const entry of typeShed) {
      const dir = getDirectoryPath(entry.filePath);
      if (!directoryExists(fs, dir)) {
          fs.mkdirpSync(dir);
      }
      fs.writeFileSync(entry.filePath, entry.content);
  }

  return fs;
}
