import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
  DependencyConstraintType,
  DependencyHardnessType,
  TaskPriorityType,
} from "./elem_types.ts";
import { ParseError, parseGanttProjectXML } from "./gan_parser.ts";

const testDataDir = `${import.meta.dirname}/test_data`;

describe("parseGanttProjectXML", () => {
  it("should be able to parse an empty project file", async () => {
    const text = await Deno.readTextFile(`${testDataDir}/empty-project.gan`);
    const project = parseGanttProjectXML(text);

    expect(project.name).toBe("");
    expect(project.company).toBe("");
    expect(project.webLink).toBe("");
    expect(project.viewDate).toEqual(new Date(Date.UTC(2023, 11, 28)));
    expect(project.viewIndex).toBe(0);
    expect(project.ganttDividerLocation).toBe(421);
    expect(project.resourceDividerLocation).toBe(399);
    expect(project.version).toBe("3.3.3312");
    expect(project.locale).toBe("en");

    expect(project.description).toBe("");

    expect(project.views).toHaveLength(2);
    expect(project.views[0].zoomState).toBe("default:3");
    expect(project.views[0].id).toBe("gantt-chart");

    expect(project.views[0].fields).toHaveLength(5);
    expect(project.views[0].fields[0]).toEqual({
      id: "tpd13",
      name: "Resources",
      width: 20,
      order: 0,
    });

    expect(project.views[0].options).toHaveLength(5);
    expect(project.views[0].options[0]).toEqual({
      id: "filter.completedTasks",
      value: "false",
      text: undefined,
    });
    expect(project.views[0].options[4]).toEqual({
      id: "color.recent",
      value: undefined,
      text: "#ff9999",
    });

    expect(project.views[0].timeline).toBeUndefined;

    expect(project.calendar.baseId).toBe("none");
    expect(project.calendar.dayTypeConfig.typeIds).toEqual(["0", "1"]);
    expect(project.calendar.dayTypeConfig.defaultWeek).toEqual({
      id: "1",
      name: "default",
      weekendDays: {
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
      },
    });
    expect(project.calendar.dayTypeConfig.isTaskRunnableOnWeekends).toEqual(
      false,
    );
    expect(project.calendar.events).toHaveLength(0);

    expect(project.taskSet.allowEmptyMilestones).toBe(true);
    expect(project.taskSet.taskProperties).toHaveLength(10);
    expect(project.taskSet.taskProperties[0]).toEqual({
      id: "tpd0",
      name: "type",
      type: "default",
      valueType: "icon",
      defaultValue: undefined,
      calculationSelectedField: undefined,
    });
    expect(project.taskSet.tasks).toHaveLength(0);

    expect(project.resourceSet.propertyDefinitions).toHaveLength(0);
    expect(project.resourceSet.resources).toHaveLength(0);

    expect(project.allocations).toHaveLength(0);
    expect(project.vacations).toHaveLength(0);
    expect(project.baselines).toHaveLength(0);
    expect(project.roleSets).toHaveLength(1);
    expect(project.roleSets[0].name).toBe("Default");
  });

  describe("project metadata", () => {
    it("metadata of a project should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/project-with-metadata.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.name).toBe("project-name");
      expect(project.company).toBe("company-name");
      expect(project.webLink).toBe(
        "https://example.test:8080?q1=v1&q2=v2#fragment",
      );
      expect(project.viewDate).toEqual(new Date(Date.UTC(2023, 11, 28)));
      expect(project.viewIndex).toBe(0);
      expect(project.ganttDividerLocation).toBe(421);
      expect(project.resourceDividerLocation).toBe(399);
      expect(project.version).toBe("3.3.3312");
      expect(project.locale).toBe("en");
      expect(project.description).toBe(
        "This is the first sentence of description.\nThis is the second sentence of the description.",
      );
    });
  });

  describe("view", () => {
    it("timeline should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/view/task-shown-in-timeline.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.views).toHaveLength(2);
      expect(project.views[0].timeline).toBe("0");
    });
  });

  describe("task", () => {
    it("basic properties of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-on-work-days.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0]).toEqual({
        id: 0,
        uid: "882bb9c5dfb5465389eb4d1ca82ece19",
        isMilestone: false,
        name: "task",
        startDate: new Date(Date.UTC(2024, 0, 4)),
        durationInDays: 2,
        completionPercentage: 0,
        isExpanded: true,

        color: undefined,
        customProperties: [],
        dependencies: [],
        earliestStartDate: undefined,
        isCostCalculated: false,
        isEarliestStartDateEnabled: false,
        isProjectTask: false,
        legacyFixedStart: undefined,
        manualCost: undefined,
        notes: undefined,
        priority: TaskPriorityType.Normal,
        shape: undefined,
        subtasks: [],
        webLink: undefined,
      });
    });

    it("`isMilestone` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/milestone-task.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].isMilestone).toBe(true);
    });

    it("`color` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-color.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].color).toBe("#ff9999");
    });

    it("`completionPercentage` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-completion-percentage.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].completionPercentage).toBe(64);
    });

    it("`customProperties` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-custom-properties.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.taskProperties).toHaveLength(11);
      expect(project.taskSet.taskProperties[10]).toEqual({
        id: "tpc0",
        name: "Sample property",
        type: "custom",
        valueType: "text",
        defaultValue: "default value for test",
        calculationSelectedField: undefined,
      });

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].customProperties).toEqual([
        {
          propertyId: "tpc0",
          value: "value for test",
        },
      ]);
    });

    it("`earliestStartDate` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-earliest-start-date.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].isEarliestStartDateEnabled).toBe(true);
      expect(project.taskSet.tasks[0].earliestStartDate).toEqual(
        new Date(Date.UTC(2024, 0, 4)),
      );
    });

    it("`priority` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-priority.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(5);
      expect(project.taskSet.tasks[0].name).toBe("task lowest");
      expect(project.taskSet.tasks[0].priority).toBe(TaskPriorityType.Lowest);

      expect(project.taskSet.tasks[1].name).toBe("task low");
      expect(project.taskSet.tasks[1].priority).toBe(TaskPriorityType.Low);

      expect(project.taskSet.tasks[2].name).toBe("task normal");
      expect(project.taskSet.tasks[2].priority).toBe(TaskPriorityType.Normal);

      expect(project.taskSet.tasks[3].name).toBe("task high");
      expect(project.taskSet.tasks[3].priority).toBe(TaskPriorityType.High);

      expect(project.taskSet.tasks[4].name).toBe("task highest");
      expect(project.taskSet.tasks[4].priority).toBe(TaskPriorityType.Highest);
    });

    it("`manualCost` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-manual-cost.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].manualCost).toBe(64);
    });

    it("`notes` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-notes.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].notes).toBe(
        "This is the first sentence.\nThis is the second sentence.",
      );
    });

    it("`shape` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-shape.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].shape).toBe(
        "1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1",
      );
    });

    it("`webLink` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-web-link.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].webLink).toBe(
        "https://example.test:8080?q1=v1&q2=v2#fragment",
      );
    });

    describe("`subtasks`", () => {
      it("expanded `subtasks` should be parsed", async () => {
        const text = await Deno.readTextFile(
          `${testDataDir}/task/task-with-expanded-subtasks.gan`,
        );
        const project = parseGanttProjectXML(text);

        // - task A
        //   - task Aa
        //   - task Ab
        //     - task Ab1
        // - task B
        //   - task Bb
        expect(project.taskSet.tasks).toHaveLength(2);
        expect(project.taskSet.tasks[0].name).toBe("task A");
        expect(project.taskSet.tasks[0].subtasks).toHaveLength(2);
        expect(project.taskSet.tasks[0].isExpanded).toBe(true);

        expect(project.taskSet.tasks[0].subtasks[0].name).toBe("task Aa");
        expect(project.taskSet.tasks[0].subtasks[0].subtasks).toHaveLength(0);
        expect(project.taskSet.tasks[0].subtasks[0].isExpanded).toBe(true);

        expect(project.taskSet.tasks[0].subtasks[1].name).toBe("task Ab");
        expect(project.taskSet.tasks[0].subtasks[1].subtasks).toHaveLength(1);
        expect(project.taskSet.tasks[0].subtasks[1].isExpanded).toBe(true);

        expect(project.taskSet.tasks[0].subtasks[1].subtasks[0].name).toBe(
          "task Ab1",
        );
        expect(project.taskSet.tasks[0].subtasks[1].subtasks[0].subtasks)
          .toHaveLength(0);
        expect(project.taskSet.tasks[0].subtasks[1].subtasks[0].isExpanded)
          .toBe(true);

        expect(project.taskSet.tasks[1].name).toBe("task B");
        expect(project.taskSet.tasks[1].subtasks).toHaveLength(1);
        expect(project.taskSet.tasks[1].isExpanded).toBe(true);

        expect(project.taskSet.tasks[1].subtasks[0].name).toBe("task Bb");
        expect(project.taskSet.tasks[1].subtasks[0].subtasks).toHaveLength(0);
        expect(project.taskSet.tasks[1].subtasks[0].isExpanded).toBe(true);
      });

      it("collapsed `subtasks` should be parsed", async () => {
        const text = await Deno.readTextFile(
          `${testDataDir}/task/task-with-collapsed-subtasks.gan`,
        );
        const project = parseGanttProjectXML(text);

        // [+] task A
        //   - task Aa
        //   - task Ab
        //     - task Ab1
        // [+] task B
        //   - task Bb
        expect(project.taskSet.tasks).toHaveLength(2);
        expect(project.taskSet.tasks[0].name).toBe("task A");
        expect(project.taskSet.tasks[0].subtasks).toHaveLength(2);
        expect(project.taskSet.tasks[0].isExpanded).toBe(false);

        expect(project.taskSet.tasks[0].subtasks[0].name).toBe("task Aa");
        expect(project.taskSet.tasks[0].subtasks[0].subtasks).toHaveLength(0);
        expect(project.taskSet.tasks[0].subtasks[0].isExpanded).toBe(true);

        expect(project.taskSet.tasks[0].subtasks[1].name).toBe("task Ab");
        expect(project.taskSet.tasks[0].subtasks[1].subtasks).toHaveLength(1);
        expect(project.taskSet.tasks[0].subtasks[1].isExpanded).toBe(true);

        expect(project.taskSet.tasks[0].subtasks[1].subtasks[0].name).toBe(
          "task Ab1",
        );
        expect(project.taskSet.tasks[0].subtasks[1].subtasks[0].subtasks)
          .toHaveLength(0);
        expect(project.taskSet.tasks[0].subtasks[1].subtasks[0].isExpanded)
          .toBe(true);

        expect(project.taskSet.tasks[1].name).toBe("task B");
        expect(project.taskSet.tasks[1].subtasks).toHaveLength(1);
        expect(project.taskSet.tasks[1].isExpanded).toBe(false);

        expect(project.taskSet.tasks[1].subtasks[0].name).toBe("task Bb");
        expect(project.taskSet.tasks[1].subtasks[0].subtasks).toHaveLength(0);
        expect(project.taskSet.tasks[1].subtasks[0].isExpanded).toBe(true);
      });
    });

    it("`dependencies` of a task should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/task/task-with-dependencies.gan`,
      );
      const project = parseGanttProjectXML(text);

      // - task A
      //   - task Aa
      //   - task Ab
      //     - task Ab1
      // - task B
      //   - task Bb
      expect(project.taskSet.tasks).toHaveLength(5);
      expect(project.taskSet.tasks[0].name).toBe("task A");
      expect(project.taskSet.tasks[0].dependencies).toHaveLength(1);
      expect(project.taskSet.tasks[0].dependencies[0]).toEqual({
        successorTaskId: 1,
        constraintType: DependencyConstraintType.StartStart,
        lagInDays: 0,
        hardnessType: DependencyHardnessType.Strong,
      });

      expect(project.taskSet.tasks[1].name).toBe("task B");
      expect(project.taskSet.tasks[1].dependencies).toHaveLength(1);
      expect(project.taskSet.tasks[1].dependencies[0]).toEqual({
        successorTaskId: 2,
        constraintType: DependencyConstraintType.FinishStart,
        lagInDays: 0,
        hardnessType: DependencyHardnessType.Rubber,
      });

      expect(project.taskSet.tasks[2].name).toBe("task C");
      expect(project.taskSet.tasks[2].dependencies).toHaveLength(1);
      expect(project.taskSet.tasks[2].dependencies[0]).toEqual({
        successorTaskId: 3,
        constraintType: DependencyConstraintType.FinishFinish,
        lagInDays: -1,
        hardnessType: DependencyHardnessType.Strong,
      });

      expect(project.taskSet.tasks[3].name).toBe("task D");
      expect(project.taskSet.tasks[3].dependencies).toHaveLength(1);
      expect(project.taskSet.tasks[3].dependencies[0]).toEqual({
        successorTaskId: 4,
        constraintType: DependencyConstraintType.StartFinish,
        lagInDays: 0,
        hardnessType: DependencyHardnessType.Strong,
      });

      expect(project.taskSet.tasks[4].name).toBe("task E");
      expect(project.taskSet.tasks[4].dependencies).toHaveLength(0);
    });
  });

  describe("resources", () => {
    it("default values of a resource should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/resource/resource-with-default-values.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.resourceSet.propertyDefinitions).toHaveLength(0);
      expect(project.resourceSet.resources).toHaveLength(1);
      expect(project.resourceSet.resources[0]).toEqual({
        id: 0,
        name: "",
        // `"Default:0" is shown as `undefined` in the GanttProject app
        role: "Default:0",
        email: "",
        phone: "",
        rate: undefined,
        customProperties: [],
      });
    });

    it("`name` of a resource should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/resource/resource-with-name.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.resourceSet.resources).toHaveLength(1);
      expect(project.resourceSet.resources[0].name).toBe("John Doe");
    });

    it("`role` of a resource that is a project manager should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/resource/resource-with-project-manager-role.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.resourceSet.resources).toHaveLength(1);
      expect(project.resourceSet.resources[0].role).toBe("Default:1");
    });

    it("`email` of a resource should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/resource/resource-with-email.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.resourceSet.resources).toHaveLength(1);
      expect(project.resourceSet.resources[0].email).toBe("john@example.test");
    });

    it("`phone` of a resource should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/resource/resource-with-phone.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.resourceSet.resources).toHaveLength(1);
      expect(project.resourceSet.resources[0].phone).toBe("(212) 555-1234");
    });

    it("`rate` of a resource should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/resource/resource-with-rate.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.resourceSet.resources).toHaveLength(1);
      expect(project.resourceSet.resources[0].rate).toEqual({
        name: "standard",
        value: 64,
      });
    });

    it("`customProperties` of a resource should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/resource/resource-with-custom-properties.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.resourceSet.propertyDefinitions).toHaveLength(1);
      expect(project.resourceSet.propertyDefinitions[0]).toEqual({
        id: "tpc0",
        name: "Sample property",
        type: "text",
        defaultValue: "default value for test",
        msProjectType: undefined,
      });

      expect(project.resourceSet.resources).toHaveLength(1);
      expect(project.resourceSet.resources[0].customProperties).toHaveLength(1);
      expect(project.resourceSet.resources[0].customProperties[0]).toEqual({
        definitionId: "tpc0",
        value: "value for test",
      });
    });
  });

  describe("allocations", () => {
    it("basic properties of a resource should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/allocation/task-with-basic-assignee.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.resourceSet.resources).toHaveLength(1);
      expect(project.resourceSet.resources[0].name).toBe("John Doe");
      expect(project.resourceSet.resources[0].role).toBe("Default:1");

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].name).toBe("task A");

      expect(project.allocations).toHaveLength(1);
      expect(project.allocations[0]).toEqual({
        taskId: 0,
        resourceId: 1,
        role: "Default:0",
        isCoordinator: false,
        workloadPercentage: 100,
      });
    });

    it("enabled `isCoordinator` of a resource should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/allocation/task-with-coordinator-assignee.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.resourceSet.resources).toHaveLength(2);
      expect(project.resourceSet.resources[0].name).toBe("John Doe");
      expect(project.resourceSet.resources[0].role).toBe("Default:1");
      expect(project.resourceSet.resources[1].name).toBe("Jane Doe");
      expect(project.resourceSet.resources[1].role).toBe("Default:0");

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].name).toBe("task A");

      expect(project.allocations).toHaveLength(2);
      expect(project.allocations[0]).toEqual({
        taskId: 0,
        resourceId: 1,
        role: "Default:1",
        isCoordinator: true,
        workloadPercentage: 50,
      });
      expect(project.allocations[1]).toEqual({
        taskId: 0,
        resourceId: 2,
        role: "Default:0",
        isCoordinator: false,
        workloadPercentage: 50,
      });
    });
  });

  describe("vacations", () => {
    it("`vacations` should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/vacation/resource-with-vacation.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.vacations).toHaveLength(1);
      expect(project.vacations[0]).toEqual({
        resourceId: 1,
        startDate: new Date(Date.UTC(2024, 0, 1)),
        endDate: new Date(Date.UTC(2024, 1, 1)),
      });
    });
  });

  describe("baselines", () => {
    it("basic properties of a baseline should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/baseline/basic-baseline.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].name).toBe("task A");
      expect(project.taskSet.tasks[0].startDate).toEqual(
        new Date(Date.UTC(2024, 0, 1)),
      );

      expect(project.baselines).toHaveLength(1);
      expect(project.baselines[0].name).toBe("baseline A");
      expect(project.baselines[0].tasks).toHaveLength(1);
      expect(project.baselines[0].tasks[0]).toEqual({
        id: 0,
        startDate: new Date(Date.UTC(2024, 0, 4)),
        durationInDays: 2,
        isMilestone: false,
        isSummary: false,
      });
    });

    it("a milestone of a baseline should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/baseline/baseline-with-milestone.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].name).toBe("task A");
      expect(project.taskSet.tasks[0].startDate).toEqual(
        new Date(Date.UTC(2024, 0, 1)),
      );

      expect(project.baselines).toHaveLength(1);
      expect(project.baselines[0].name).toBe("baseline A");
      expect(project.baselines[0].tasks).toHaveLength(1);
      expect(project.baselines[0].tasks[0]).toEqual({
        id: 0,
        startDate: new Date(Date.UTC(2024, 0, 4)),
        durationInDays: 0,
        isMilestone: true,
        isSummary: false,
      });
    });

    it("`isSummary` of a task in a baseline should be parsed", async () => {
      const text = await Deno.readTextFile(
        `${testDataDir}/baseline/baseline-with-subtasks.gan`,
      );
      const project = parseGanttProjectXML(text);

      expect(project.taskSet.tasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].name).toBe("task A");
      expect(project.taskSet.tasks[0].startDate).toEqual(
        new Date(Date.UTC(2024, 0, 1)),
      );

      expect(project.taskSet.tasks[0].subtasks).toHaveLength(1);
      expect(project.taskSet.tasks[0].subtasks[0].name).toBe("task Aa");
      expect(project.taskSet.tasks[0].subtasks[0].startDate).toEqual(
        new Date(Date.UTC(2024, 0, 1)),
      );

      expect(project.baselines).toHaveLength(1);
      expect(project.baselines[0].name).toBe("baseline A");
      expect(project.baselines[0].tasks).toHaveLength(2);
      expect(project.baselines[0].tasks[0]).toEqual({
        id: 0,
        startDate: new Date(Date.UTC(2024, 0, 4)),
        durationInDays: 2,
        isMilestone: false,
        isSummary: true,
      });
      expect(project.baselines[0].tasks[1]).toEqual({
        id: 1,
        startDate: new Date(Date.UTC(2024, 0, 4)),
        durationInDays: 2,
        isMilestone: false,
        isSummary: false,
      });
    });
  });

  describe("error", () => {
    it("should throw an error when a .gan file is invalid", () => {
      expect(() =>
        parseGanttProjectXML(
          `<?xml version="1.0" encoding="UTF-8"?><invalid-element></invalid-element>`,
        )
      ).toThrow(ParseError);
    });
  });
});
