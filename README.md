# ts-ganttproject-parser

A TypeScript library for parsing [GanttProject](https://www.ganttproject.biz/) (.gan) XML files. This library
provides type-safe parsing task hierarchies in GanttProject files.

## Features

- Type-safe parsing of GanttProject XML files
- Depth-first task traversal utilities
- Comprehensive TypeScript type definitions

## Usage

### Basic Parsing

```typescript
import { parseGanttProjectXML } from "jsr:@blyoa/ts-ganttproject-parser";

try {
  const xmlContent = await Deno.readTextFile("project.gan");
  const project = parseGanttProjectXML(xmlContent);
  console.log(`Parsed project with ${project.tasks.length} tasks`);
} catch (error) {
  if (error instanceof ParseError) {
    console.error("Issues with the .gan file:", error.issues);
  }
  throw error;
}
```

### Working with Tasks

The library also provides utilities for traversing and collecting tasks in a
project:

```typescript
import {
  collectTasksDepthFirst,
  walkTasksDepthFirst,
} from "jsr:@blyoa/ts-ganttproject-parser";

// Walking through all tasks
walkTasksDepthFirst(project, (parent, task) => {
  console.log(`Task: ${task.name}, Parent: ${parent?.name ?? "root"}`);
  return true; // Continue traversing subtasks
});

// Collecting all tasks in a flat array
const allTasks = collectTasksDepthFirst(project);
console.log(`Total number of tasks: ${allTasks.length}`);
```

## License

[MIT License](LICENSE)
