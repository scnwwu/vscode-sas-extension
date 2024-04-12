# Running SAS Code by Task

## Run selected code or all code in active editor

1. Select **Run Task...** from the global **Terminal** menu.
2. Select **sas** task category form the following picker.
3. Select **sas: Run sas file** task from the following picker.
4. This task will automatically run selected code or all code in active editor (depends on whether there are selections or not).

## Custom task to run specified sas file in workspace

1. Select **Configure Tasks...** from the global **Terminal** menu.
2. Select **sas: Run sas file** task from the following picker.
3. This opens the tasks.json file with a task skeleton like below.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "sas",
      "task": "Run sas file",
      "problemMatcher": [],
      "label": "sas: Run sas file"
    }
  ]
}
```

3. Add **file** field and specify a sas file name to it.
4. Specify a special name in **label** field. The final task definition likes below

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "sas",
      "task": "Run sas file",
      "file": "my.sas",
      "problemMatcher": [],
      "label": "run my.sas code"
    }
  ]
}
```

5. Save tasks.json.
6. This custom task can be run by **Run Tasks...** in the global **Terminal** menu

**Note**:

- If no file property attended or blank string specified, this custom task will work as default sas provided task.

## Custom task to run sas code with preamble and postamble added

1. Select **Configure Tasks...** from the global **Terminal** menu.
2. Select **sas: Run sas file** task from the following picker.
3. Add **preamble** and/or **postamble** properties and provide sas code in it.
4. if a file is specified, the **preamble** and **postamble** will be added in the code from this file when this task is executed.
5. If **file** is absent, then **preamble** and **postamble** will be added in the selected code (if have) or all code in active editor when this task is executed.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "sas",
      "task": "Run sas file",
      "file": "code.sas",
      "preamble": "some code*",
      "postamble": "some code*",
      "problemMatcher": [],
      "label": "Run additional code"
    }
  ]
}
```

## Binding keyboard shortcut to tasks

If you need to run a task frequently, you can define a keyboard shortcut for the task.

For example, to bind `Ctrl+H` to the **run additional code** task from above, add the following to your keybindings.json file:

```json
{
  "key": "ctrl+h",
  "command": "workbench.action.tasks.runTask",
  "args": "Run additional code"
}
```
