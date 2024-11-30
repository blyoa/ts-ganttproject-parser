import type { Project, Task } from "../parser/mod.ts";

/**
 * Traverses all tasks in a project in depth-first order.
 *
 * @param project The project containing tasks to traverse
 * @param visitor A callback function executed for each task during traversal
 *
 * The visitor function is called for each task in depth-first order. For each task,
 * the visitor receives both the parent task (if any) and the current task being visited.
 *
 * The visitor function can control whether subtasks should be traversed by returning:
 * - `true` to continue traversing the current task's subtasks
 * - `false` to skip traversing the current task's subtasks
 *
 * @example
 * ```typescript
 * const project = parseGanttProjectXML(xmlString);
 * walkTasksDepthFirst(project, (parent, task) => {
 *   console.log(`visiting task: ${task.name}`);
 *   return true; // Continue traversing subtasks
 * });
 * ```
 */
export function walkTasksDepthFirst(
  project: Project,
  visitor: (parentTask: Task | undefined, task: Task) => boolean,
): void {
  function walk(parentTask: Task | undefined, tasks: Task[]): void {
    for (const task of tasks) {
      if (visitor(parentTask, task)) {
        walk(task, task.subtasks);
      }
    }
  }

  walk(undefined, project.taskSet.tasks);
}
