import type {
  XMLAllocationOutput,
  XMLBaselineOutput,
  XMLBaselineTaskOutput,
  XMLCalendarEventOutput,
  XMLCalendarOutput,
  XMLCustomPropertyDefinitionOutput,
  XMLCustomPropertyOutput,
  XMLDayTypeConfigurationOutput,
  XMLDefaultWeekOutput,
  XMLDependencyOutput,
  XMLFieldOutput,
  XMLOptionOutput,
  XMLProjectOutput,
  XMLRateOutput,
  XMLResourceCustomPropertyOutput,
  XMLResourceOutput,
  XMLResourceSetOutput,
  XMLRoleOutput,
  XMLRoleSetOutput,
  XMLTaskOutput,
  XMLTaskPropertyOutput,
  XMLTaskSetOutput,
  XMLVacationOutput,
  XMLViewOutput,
} from "./xml_elem_types.ts";
import type {
  Allocation,
  Baseline,
  BaselineTask,
  Calendar,
  CalendarEvent,
  CustomProperty,
  CustomPropertyDefinition,
  DayTypeConfiguration,
  DefaultWeek,
  Dependency,
  Field,
  Option,
  Project,
  Rate,
  Resource,
  ResourceCustomProperty,
  ResourceSet,
  Role,
  RoleSet,
  Task,
  TaskProperty,
  TaskSet,
  Vacation,
  View,
} from "./elem_types.ts";
import { TaskPriorityType } from "./elem_types.ts";
import { addWorkdays } from "./date.ts";

function convertToField(xmlField: XMLFieldOutput): Field {
  return {
    id: xmlField["@_id"],
    name: xmlField["@_name"],
    width: xmlField["@_width"],
    order: xmlField["@_order"],
  };
}

function convertToOption(xmlOption: XMLOptionOutput): Option {
  return {
    id: xmlOption["@_id"],
    value: xmlOption["@_value"],
    text: xmlOption["#text"],
  };
}

function convertToView(xmlView: XMLViewOutput): View {
  return {
    id: xmlView["@_id"],
    zoomState: xmlView["@_zooming-state"],
    fields: xmlView.field?.map(convertToField) ?? [],
    timeline: xmlView.timeline,
    options: xmlView.option?.map(convertToOption) ?? [],
  };
}

function convertToDefaultWeek(
  xmlDefaultWeek: XMLDefaultWeekOutput,
): DefaultWeek {
  return {
    id: xmlDefaultWeek["@_id"],
    name: xmlDefaultWeek["@_name"],
    weekendDays: {
      sunday: xmlDefaultWeek["@_sun"] === 1,
      monday: xmlDefaultWeek["@_mon"] === 1,
      tuesday: xmlDefaultWeek["@_tue"] === 1,
      wednesday: xmlDefaultWeek["@_wed"] === 1,
      thursday: xmlDefaultWeek["@_thu"] === 1,
      friday: xmlDefaultWeek["@_fri"] === 1,
      saturday: xmlDefaultWeek["@_sat"] === 1,
    },
  };
}

function convertToDayTypeConfiguration(
  xmlDayTypeConfig: XMLDayTypeConfigurationOutput,
): DayTypeConfiguration {
  return {
    typeIds: xmlDayTypeConfig["day-type"]?.map((dt) => dt["@_id"]) ?? [],
    defaultWeek: convertToDefaultWeek(xmlDayTypeConfig["default-week"]),
    isTaskRunnableOnWeekends: xmlDayTypeConfig["only-show-weekends"]["@_value"],
  };
}

function convertToCalendarEvent(
  xmlCalendarEvent: XMLCalendarEventOutput,
): CalendarEvent {
  return {
    year: xmlCalendarEvent["@_year"],
    month: xmlCalendarEvent["@_month"],
    day: xmlCalendarEvent["@_date"],
    type: xmlCalendarEvent["@_type"],
    color: xmlCalendarEvent["@_color"],
    description: xmlCalendarEvent["#text"],
  };
}

function convertToCalendar(xmlCalendar: XMLCalendarOutput): Calendar {
  return {
    baseId: xmlCalendar["@_base-id"],
    dayTypeConfig: convertToDayTypeConfiguration(xmlCalendar["day-types"]),
    events: xmlCalendar.date?.map(convertToCalendarEvent) ?? [],
  };
}

function convertToTaskProperty(
  xmlTaskProperty: XMLTaskPropertyOutput,
): TaskProperty {
  return {
    id: xmlTaskProperty["@_id"],
    name: xmlTaskProperty["@_name"],
    type: xmlTaskProperty["@_type"],
    valueType: xmlTaskProperty["@_valuetype"],
    defaultValue: xmlTaskProperty["@_defaultvalue"],
    calculationSelectedField: xmlTaskProperty["simple-select"]?.["@_select"],
  };
}

function convertToDependency(xmlDependency: XMLDependencyOutput): Dependency {
  return {
    successorTaskId: xmlDependency["@_id"],
    constraintType: xmlDependency["@_type"],
    lagInDays: xmlDependency["@_difference"],
    hardnessType: xmlDependency["@_hardness"],
  };
}

function convertToCustomProperty(
  xmlCustomProperty: XMLCustomPropertyOutput,
): CustomProperty {
  return {
    propertyId: xmlCustomProperty["@_taskproperty-id"],
    value: xmlCustomProperty["@_value"],
  };
}

function convertToTask(xmlTask: XMLTaskOutput, calendar: Calendar): Task {
  const startDate = xmlTask["@_start"];
  const durationInDays = xmlTask["@_duration"];

  return {
    id: xmlTask["@_id"],
    uid: xmlTask["@_uid"],
    name: xmlTask["@_name"],
    color: xmlTask["@_color"],
    shape: xmlTask["@_shape"],
    isMilestone: xmlTask["@_meeting"],
    isProjectTask: !!xmlTask["@_project"],
    startDate,
    endDate: addWorkdays(startDate, durationInDays - 1, calendar),
    durationInDays,
    completionPercentage: xmlTask["@_complete"],
    earliestStartDate: xmlTask["@_thirdDate"],
    isEarliestStartDateEnabled: xmlTask["@_thirdDate-constraint"] === 1,
    priority: xmlTask["@_priority"] ?? TaskPriorityType.Normal,
    webLink: xmlTask["@_webLink"],
    isExpanded: xmlTask["@_expand"],
    manualCost: xmlTask["@_cost-manual-value"],
    isCostCalculated: !!xmlTask["@_cost-calculated"],
    notes: xmlTask.notes,
    dependencies: xmlTask.depend?.map(convertToDependency) ?? [],
    customProperties: xmlTask.customproperty.map(convertToCustomProperty),
    subtasks: xmlTask.task?.map((st) => convertToTask(st, calendar)) ?? [],
    legacyFixedStart: xmlTask["@_fixed-start"],
  };
}

function convertToTaskSet(
  xmlTaskSet: XMLTaskSetOutput,
  calendar: Calendar,
): TaskSet {
  return {
    allowEmptyMilestones: xmlTaskSet["@_empty-milestones"],
    taskProperties:
      xmlTaskSet.taskproperties?.taskproperty?.map(convertToTaskProperty) ?? [],
    tasks: xmlTaskSet.task?.map((task) => convertToTask(task, calendar)) ?? [],
  };
}

function convertToCustomPropertyDefinition(
  xmlCustomPropertyDef: XMLCustomPropertyDefinitionOutput,
): CustomPropertyDefinition {
  return {
    id: xmlCustomPropertyDef["@_id"],
    name: xmlCustomPropertyDef["@_name"],
    type: xmlCustomPropertyDef["@_type"],
    defaultValue: xmlCustomPropertyDef["@_default-value"],
    msProjectType: xmlCustomPropertyDef["@_MSPROJECT_TYPE"],
  };
}

function convertToRate(xmlRate: XMLRateOutput): Rate {
  return {
    name: xmlRate["@_name"],
    value: xmlRate["@_value"],
  };
}

function convertToResourceCustomProperty(
  xmlResourceCustomProp: XMLResourceCustomPropertyOutput,
): ResourceCustomProperty {
  return {
    definitionId: xmlResourceCustomProp["@_definition-id"],
    value: xmlResourceCustomProp["@_value"],
  };
}

function convertToResource(xmlResource: XMLResourceOutput): Resource {
  return {
    id: xmlResource["@_id"],
    name: xmlResource["@_name"],
    role: xmlResource["@_function"],
    email: xmlResource["@_contacts"],
    phone: xmlResource["@_phone"],
    rate: xmlResource.rate ? convertToRate(xmlResource.rate) : undefined,
    customProperties: xmlResource["custom-property"].map(
      convertToResourceCustomProperty,
    ),
  };
}

function convertToResourceSet(
  xmlResourceSet: XMLResourceSetOutput,
): ResourceSet {
  return {
    propertyDefinitions: xmlResourceSet["custom-property-definition"].map(
      convertToCustomPropertyDefinition,
    ),
    resources: xmlResourceSet.resource.map(convertToResource),
  };
}

function convertToAllocation(xmlAllocation: XMLAllocationOutput): Allocation {
  return {
    taskId: xmlAllocation["@_task-id"],
    resourceId: xmlAllocation["@_resource-id"],
    role: xmlAllocation["@_function"],
    isCoordinator: xmlAllocation["@_responsible"],
    workloadPercentage: xmlAllocation["@_load"],
  };
}

function convertToVacation(xmlVacation: XMLVacationOutput): Vacation {
  return {
    startDate: xmlVacation["@_start"],
    endDate: xmlVacation["@_end"],
    resourceId: xmlVacation["@_resourceid"],
  };
}

function convertToBaselineTask(
  xmlBaselineTask: XMLBaselineTaskOutput,
  calendar: Calendar,
): BaselineTask {
  const startDate = xmlBaselineTask["@_start"];
  const durationInDays = xmlBaselineTask["@_duration"];

  return {
    id: xmlBaselineTask["@_id"],
    startDate,
    endDate: addWorkdays(startDate, durationInDays - 1, calendar),
    durationInDays,
    isMilestone: xmlBaselineTask["@_meeting"],
    isSummary: xmlBaselineTask["@_super"],
  };
}

function convertToBaseline(
  xmlBaseline: XMLBaselineOutput,
  calendar: Calendar,
): Baseline {
  return {
    name: xmlBaseline["@_name"],
    tasks:
      xmlBaseline["previous-task"]?.map((bt) =>
        convertToBaselineTask(bt, calendar)
      ) ?? [],
  };
}

function convertToRole(xmlRole: XMLRoleOutput): Role {
  return {
    id: xmlRole["@_id"],
    name: xmlRole["@_name"],
  };
}

function convertToRoleSet(xmlRoleSet: XMLRoleSetOutput): RoleSet {
  return {
    name: xmlRoleSet["@_roleset-name"],
    roles: xmlRoleSet.role?.map(convertToRole) ?? [],
  };
}

export function convertToProject(xmlProject: XMLProjectOutput): Project {
  const calendar = convertToCalendar(xmlProject.calendars);

  return {
    name: xmlProject["@_name"],
    company: xmlProject["@_company"],
    webLink: xmlProject["@_webLink"],
    viewDate: xmlProject["@_view-date"],
    viewIndex: xmlProject["@_view-index"],
    ganttDividerLocation: xmlProject["@_gantt-divider-location"],
    resourceDividerLocation: xmlProject["@_resource-divider-location"],
    version: xmlProject["@_version"],
    locale: xmlProject["@_locale"],
    description: xmlProject.description,
    views: xmlProject.view.map(convertToView),
    calendar,
    taskSet: convertToTaskSet(xmlProject.tasks, calendar),
    resourceSet: xmlProject.resources
      ? convertToResourceSet(xmlProject.resources)
      : { propertyDefinitions: [], resources: [] },
    allocations: xmlProject.allocations?.allocation.map(convertToAllocation) ??
      [],
    vacations: xmlProject.vacations?.vacation.map(convertToVacation) ?? [],
    baselines:
      xmlProject.previous?.["previous-tasks"].map((b) =>
        convertToBaseline(b, calendar)
      ) ??
        [],
    roleSets: xmlProject.roles.map(convertToRoleSet),
  };
}
