import { beforeEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";

import { collectTasksDepthFirst, walkTasksDepthFirst } from "./task.ts";
import type { Project, Task } from "../parser/mod.ts";

function createTask(name: string): Task {
  return {
    id: 0,
    uid: "",
    name,
    isMilestone: false,
    isProjectTask: false,
    startDate: new Date(),
    endDate: new Date(),
    durationInDays: 0,
    completionPercentage: 0,
    isEarliestStartDateEnabled: false,
    priority: "",
    isExpanded: false,
    isCostCalculated: false,
    dependencies: [],
    customProperties: [],
    subtasks: [],
  };
}

let project: Project;
beforeEach(() => {
  project = {
    company: "company",
    name: "project name",
    webLink: "",
    viewIndex: 0,
    viewDate: new Date(),
    ganttDividerLocation: 0,
    resourceDividerLocation: 0,
    version: "",
    locale: "",
    views: [],
    calendar: {
      baseId: undefined,
      dayTypeConfig: {
        typeIds: [],
        defaultWeek: {
          id: "",
          name: "",
          weekendDays: {
            sunday: false,
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
          },
        },
        isTaskRunnableOnWeekends: false,
      },
      events: [],
    },
    resourceSet: {
      propertyDefinitions: [],
      resources: [],
    },
    allocations: [],
    vacations: [],
    baselines: [],
    roleSets: [],
    taskSet: {
      allowEmptyMilestones: true,
      taskProperties: [],
      tasks: [],
    },
  };
});
describe("walkTasksDepthFirst", () => {
  it("should not visit any task if no task exists", () => {
    let numOfCalls = 0;
    project.taskSet.tasks = [];

    walkTasksDepthFirst(project, () => {
      numOfCalls++;
      return true;
    });

    expect(numOfCalls).toBe(0);
  });

  it("should visit task in depth-first order", () => {
    const visitedTaskNames: { parentTask: string | undefined; task: string }[] =
      [];
    project.taskSet.tasks = [
      createTask("1"),
      {
        ...createTask("2"),
        subtasks: [
          {
            ...createTask("3"),
            subtasks: [
              createTask("4"),
            ],
          },
        ],
      },
      createTask("5"),
    ];

    walkTasksDepthFirst(project, (p, t) => {
      visitedTaskNames.push({ parentTask: p?.name, task: t.name });
      return true;
    });

    expect(visitedTaskNames).toEqual([
      { parentTask: undefined, task: "1" },
      { parentTask: undefined, task: "2" },
      { parentTask: "2", task: "3" },
      { parentTask: "3", task: "4" },
      { parentTask: undefined, task: "5" },
    ]);
  });
});

describe("collectTasksDepthFirst", () => {
  it("should return an empty array if no task exists", () => {
    project.taskSet.tasks = [];
    expect(collectTasksDepthFirst(project)).toEqual([]);
  });

  it("should return tasks in depth-first order", () => {
    project.taskSet.tasks = [
      createTask("1"),
      {
        ...createTask("2"),
        subtasks: [
          {
            ...createTask("3"),
            subtasks: [
              createTask("4"),
            ],
          },
        ],
      },
      createTask("5"),
    ];
    expect(collectTasksDepthFirst(project).map((t) => t.name)).toEqual(
      ["1", "2", "3", "4", "5"],
    );
  });
});
