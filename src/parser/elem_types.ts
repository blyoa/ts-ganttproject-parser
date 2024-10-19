export const CalendarEventType = {
  Holiday: "HOLIDAY",
  WorkingDay: "WORKING_DAY",
  Neutral: "NEUTRAL",
} as const;
export type CalendarEventType =
  typeof CalendarEventType[keyof typeof CalendarEventType];

export const DependencyConstraintType = {
  StartStart: "1",
  FinishStart: "2",
  FinishFinish: "3",
  StartFinish: "4",
} as const;
export type DependencyConstraintType =
  typeof DependencyConstraintType[keyof typeof DependencyConstraintType];

export const DependencyHardnessType = {
  Strong: "Strong",
  Rubber: "Rubber",
} as const;
export type DependencyHardnessType =
  typeof DependencyHardnessType[keyof typeof DependencyHardnessType];

export const TaskPriorityType = {
  Lowest: "3",
  Low: "0",
  Normal: "1",
  High: "2",
  Highest: "4",
};
export type TaskPriorityType =
  typeof TaskPriorityType[keyof typeof TaskPriorityType];

export type Field = {
  id: string;
  name: string;
  width: number;
  order: number;
};

export type Option = {
  id: string;
  value?: string;
  text?: string;
};

export type View = {
  id: string;
  zoomState?: string;
  fields: Field[];
  timeline?: string;
  options: Option[];
};

export type DefaultWeek = {
  id: string;
  name: string;
  weekendDays: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
};

export type DayTypeConfiguration = {
  typeIds: string[];
  defaultWeek: DefaultWeek;
  isTaskRunnableOnWeekends: boolean;
};

export type CalendarEvent = {
  year?: number;
  month: number;
  day: number;
  type: CalendarEventType;
  color?: string;
  description?: string;
};

export type Calendar = {
  baseId?: string;
  dayTypeConfig: DayTypeConfiguration;
  events: CalendarEvent[];
};

export type TaskProperty = {
  id: string;
  name: string;
  type: string;
  valueType: string;
  defaultValue?: string;
  calculationSelectedField?: string;
};

export type Dependency = {
  successorTaskId: number;
  constraintType: DependencyConstraintType;
  lagInDays: number;
  hardnessType: DependencyHardnessType;
};

export type CustomProperty = {
  propertyId: string;
  value?: string;
};

export type Task = {
  id: number;
  uid: string;
  name: string;
  color?: string;
  shape?: string;
  isMilestone: boolean;
  isProjectTask: boolean;
  startDate: Date;
  endDate: Date;
  durationInDays: number;
  completionPercentage: number;
  earliestStartDate?: Date;
  isEarliestStartDateEnabled: boolean;
  priority: TaskPriorityType;
  webLink?: string;
  isExpanded: boolean;
  manualCost?: number;
  isCostCalculated: boolean;
  notes?: string;
  dependencies: Dependency[];
  customProperties: CustomProperty[];
  subtasks: Task[];
  legacyFixedStart?: string;
};

export type TaskSet = {
  allowEmptyMilestones: boolean;
  taskProperties: TaskProperty[];
  tasks: Task[];
};

export type CustomPropertyDefinition = {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
  msProjectType?: string;
};

export type Rate = {
  name: string;
  value: number;
};

export type ResourceCustomProperty = {
  definitionId: string;
  value: string;
};

export type Resource = {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  rate?: Rate;
  customProperties: ResourceCustomProperty[];
};

export type ResourceSet = {
  propertyDefinitions: CustomPropertyDefinition[];
  resources: Resource[];
};

export type Allocation = {
  taskId: number;
  resourceId: number;
  role?: string;
  isCoordinator: boolean;
  workloadPercentage: number;
};

export type Vacation = {
  startDate: Date;
  endDate: Date;
  resourceId: number;
};

export type BaselineTask = {
  id: number;
  startDate: Date;
  endDate: Date;
  durationInDays: number;
  isMilestone: boolean;
  isSummary: boolean;
};

export type Baseline = {
  name: string;
  tasks: BaselineTask[];
};

export type Role = {
  id: string;
  name: string;
};

export type RoleSet = {
  name?: string;
  roles: Role[];
};

export type Project = {
  name: string;
  company: string;
  webLink: string;
  viewDate: Date;
  viewIndex: number;
  ganttDividerLocation: number;
  resourceDividerLocation: number;
  version: string;
  locale: string;
  description?: string;
  views: View[];
  calendar: Calendar;
  taskSet: TaskSet;
  resourceSet: ResourceSet;
  allocations: Allocation[];
  vacations: Vacation[];
  baselines: Baseline[];
  roleSets: RoleSet[];
};
