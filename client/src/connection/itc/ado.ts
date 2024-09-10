import { ChildProcessWithoutNullStreams, spawn } from "child_process";

export class ADO {
  private _shellProcess: ChildProcessWithoutNullStreams;
  private _runResolve: ((value?) => void) | undefined;
  private _runReject: ((reason?) => void) | undefined;

  public async setup(iomid: string) {
    const setupPromise = new Promise((resolve, reject) => {
      this._runResolve = resolve;
      this._runReject = reject;
    });

    if (this._shellProcess && !this._shellProcess.killed) {
      this._runResolve();
      return setupPromise;
    }

    this._shellProcess = spawn(
      "chcp 65001 >NUL & powershell.exe -NonInteractive -NoProfile -Command -",
      {
        shell: true,
      },
    );
    this._shellProcess.stderr.on("data", this.onShellStdErr);

    this._shellProcess.stdin.write(
      `
# Open a connection to the workspace by using its UniqueIdentifier, which is generated automatically
$objConn = New-Object -ComObject ADODB.Connection
$objConn.Open("Provider=sas.iomprovider; Data Source=iom-id://${iomid}")
`,
      this.onWriteComplete,
    );

    return setupPromise;
  }

  public async close() {
    return new Promise<void>((resolve) => {
      if (this._shellProcess) {
        this._shellProcess.stdin.write("$objConn.Close()\n", () => {
          this._shellProcess.kill();
          this._shellProcess = undefined;
          resolve();
        });

        this._runReject = undefined;
        this._runResolve = undefined;
      }
    });
  }

  /**
   * Generic call for use on stdin write completion.
   * @param err The error encountered on the write attempt. Undefined if no error occurred.
   */
  private onWriteComplete = (err?: Error): void => {
    if (err) {
      console.dir(err);
      this._runReject?.(err);
    }
  };

  /**
   * Handles stderr output from the powershell child process.
   * @param chunk a buffer of stderr output from the child process.
   */
  private onShellStdErr = (chunk: Buffer): void => {
    const msg = chunk.toString();

    console.error(msg);
    this._runReject?.(new Error(msg));
  };
}
