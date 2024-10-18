import * as v from "valibot";
import {
  CalendarEventType,
  DependencyConstraintType,
  DependencyHardnessType,
  TaskPriorityType,
} from "./elem_types.ts";

const emptyStringToUndefined = <T>(input: T | "") =>
  input === "" ? undefined : input;

const forceToString = <T>(input: T) => String(input);

const forceToArray = <T>(input: T) =>
  (Array.isArray(input) ? input : [input]) as T extends unknown[] ? T : T[];

const stringToNumberPipeline = v.pipe(
  v.string(),
  v.decimal(),
  v.transform((input) => Number(input)),
);

const stringToBooleanPipeline = v.pipe(
  v.string(),
  v.union([v.literal("true"), v.literal("false")]),
  v.transform((input) => input === "true"),
);

export const XMLDateToDatePipeline = v.pipe(
  v.union([
    v.pipe(v.string(), v.isoDate()),
    v.custom<`${number}/${number}/${number}`>(
      // day/month/year
      // https://github.com/bardsoftware/ganttproject/blob/55e7678aa349053308d2914f77152da4f3f7376f/biz.ganttproject.core/src/main/java/biz/ganttproject/core/time/GanttCalendar.java#L59
      (input) =>
        typeof input === "string" &&
        /^[1-9][0-9]*\/[1-9][0-9]*\/[1-9][0-9]*$/.test(input),
    ),
  ]),
  v.transform((input) => {
    if (typeof input === "string" && input.includes("/")) {
      const [day, month, year] = input.split("/").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(input);
  }),
);
export type XMLDateTypeInput = v.InferInput<typeof XMLDateToDatePipeline>;
export type XMLDateTypeOutput = v.InferOutput<typeof XMLDateToDatePipeline>;

// Based on
// https://github.com/bardsoftware/ganttproject/blob/55e7678aa349053308d2914f77152da4f3f7376f/biz.ganttproject.core/src/main/java/biz/ganttproject/core/io/XmlSerializer.kt

export const XMLFieldSchema = v.object({
  "@_id": v.string(),
  "@_name": v.string(),
  "@_width": stringToNumberPipeline,
  "@_order": stringToNumberPipeline,
});
export type XMLFieldInput = v.InferInput<typeof XMLFieldSchema>;
export type XMLFieldOutput = v.InferOutput<typeof XMLFieldSchema>;

export const XMLOptionSchema = v.object({
  "@_id": v.string(),
  "@_value": v.optional(v.string()),
  "#text": v.optional(v.string()),
});
export type XMLOptionInput = v.InferInput<typeof XMLOptionSchema>;
export type XMLOptionOutput = v.InferOutput<typeof XMLOptionSchema>;

export const XMLViewSchema = v.object({
  "@_id": v.string(),
  "@_zooming-state": v.optional(v.string()),
  field: v.optional(
    v.pipe(
      v.union([XMLFieldSchema, v.array(XMLFieldSchema)]),
      v.transform(forceToArray),
    ),
  ),
  timeline: v.optional(
    v.pipe(v.union([v.number(), v.string()]), v.transform(forceToString)),
  ),
  option: v.optional(
    v.pipe(
      v.union([XMLOptionSchema, v.array(XMLOptionSchema)]),
      v.transform(forceToArray),
    ),
  ),
});
export type XMLViewInput = v.InferInput<typeof XMLViewSchema>;
export type XMLViewOutput = v.InferOutput<typeof XMLViewSchema>;

export const XMLDayTypeSchema = v.object({
  "@_id": v.string(),
});
export type XMLDayTypeInput = v.InferInput<typeof XMLDayTypeSchema>;
export type XMLDayTypeOutput = v.InferOutput<typeof XMLDayTypeSchema>;

export const XMLDefaultWeekSchema = v.object({
  "@_id": v.string(),
  "@_name": v.string(),
  "@_sun": stringToNumberPipeline,
  "@_mon": stringToNumberPipeline,
  "@_tue": stringToNumberPipeline,
  "@_wed": stringToNumberPipeline,
  "@_thu": stringToNumberPipeline,
  "@_fri": stringToNumberPipeline,
  "@_sat": stringToNumberPipeline,
});
export type XMLDefaultWeekInput = v.InferInput<typeof XMLDefaultWeekSchema>;
export type XMLDefaultWeekOutput = v.InferOutput<typeof XMLDefaultWeekSchema>;

export const XMLOnlyShowWeekendsSchema = v.object({
  "@_value": stringToBooleanPipeline,
});
export type XMLOnlyShowWeekendsInput = v.InferInput<
  typeof XMLOnlyShowWeekendsSchema
>;
export type XMLOnlyShowWeekendsOutput = v.InferOutput<
  typeof XMLOnlyShowWeekendsSchema
>;

export const XMLDayTypeConfigurationSchema = v.object({
  "day-type": v.optional(
    v.pipe(
      v.union([XMLDayTypeSchema, v.array(XMLDayTypeSchema)]),
      v.transform(forceToArray),
    ),
  ),
  "default-week": XMLDefaultWeekSchema,
  "only-show-weekends": XMLOnlyShowWeekendsSchema,
});
export type XMLDayTypeConfigurationInput = v.InferInput<
  typeof XMLDayTypeConfigurationSchema
>;
export type XMLDayTypeConfigurationOutput = v.InferOutput<
  typeof XMLDayTypeConfigurationSchema
>;

export const XMLCalendarEventSchema = v.object({
  "@_year": v.pipe(
    v.union([v.pipe(v.string(), v.digits()), v.literal("")]),
    v.transform((input) => input === "" ? undefined : Number(input)),
  ),
  "@_month": stringToNumberPipeline,
  "@_date": stringToNumberPipeline,
  "@_type": v.enum(CalendarEventType),
  "@_color": v.optional(v.string()),
  "#text": v.optional(v.string()),
});
export type XMLCalendarEventInput = v.InferInput<typeof XMLCalendarEventSchema>;
export type XMLCalendarEventOutput = v.InferOutput<
  typeof XMLCalendarEventSchema
>;

export const XMLCalendarSchema = v.object({
  "@_base-id": v.optional(v.string()),
  "day-types": XMLDayTypeConfigurationSchema,
  date: v.optional(
    v.pipe(
      v.union([XMLCalendarEventSchema, v.array(XMLCalendarEventSchema)]),
      v.transform(forceToArray),
    ),
  ),
});
export type XMLCalendarInput = v.InferInput<typeof XMLCalendarSchema>;
export type XMLCalendarOutput = v.InferOutput<typeof XMLCalendarSchema>;

export const XMLCalculationSimpleSelectSchema = v.object({
  "@_select": v.string(),
});
export type XMLCalculationSimpleSelectInput = v.InferInput<
  typeof XMLCalculationSimpleSelectSchema
>;
export type XMLCalculationSimpleSelectOutput = v.InferOutput<
  typeof XMLCalculationSimpleSelectSchema
>;

export const XMLTaskPropertySchema = v.object({
  "@_id": v.string(),
  "@_name": v.string(),
  "@_type": v.string(),
  "@_valuetype": v.string(),
  "@_defaultvalue": v.optional(v.string()),
  "simple-select": v.optional(XMLCalculationSimpleSelectSchema),
});
export type XMLTaskPropertyInput = v.InferInput<typeof XMLTaskPropertySchema>;
export type XMLTaskPropertyOutput = v.InferOutput<typeof XMLTaskPropertySchema>;

export const XMLTaskPropertySetSchema = v.object({
  "taskproperty": v.pipe(
    v.union([XMLTaskPropertySchema, v.array(XMLTaskPropertySchema)]),
    v.transform(forceToArray),
  ),
});
export type XMLTaskPropertySetInput = v.InferInput<
  typeof XMLTaskPropertySetSchema
>;
export type XMLTaskPropertySetOutput = v.InferOutput<
  typeof XMLTaskPropertySetSchema
>;

export const XMLDependencySchema = v.object({
  "@_id": stringToNumberPipeline,
  "@_type": v.enum(DependencyConstraintType),
  "@_difference": stringToNumberPipeline,
  "@_hardness": v.enum(DependencyHardnessType),
});
export type XMLDependencyInput = v.InferInput<typeof XMLDependencySchema>;
export type XMLDependencyOutput = v.InferOutput<typeof XMLDependencySchema>;

export const XMLCustomPropertySchema = v.object({
  "@_taskproperty-id": v.string(),
  "@_value": v.optional(v.string()),
});
export type XMLCustomPropertyInput = v.InferInput<
  typeof XMLCustomPropertySchema
>;
export type XMLCustomPropertyOutput = v.InferOutput<
  typeof XMLCustomPropertySchema
>;

export type XMLTaskInput = {
  "@_id": string;
  "@_uid": string;
  "@_name": string;
  "@_color"?: string;
  "@_shape"?: string;
  "@_meeting": string;
  "@_project"?: string;
  "@_start": XMLDateTypeInput;
  "@_duration": string;
  "@_complete": string;
  "@_thirdDate"?: XMLDateTypeInput;
  "@_thirdDate-constraint"?: string;
  "@_priority"?: TaskPriorityType;
  "@_webLink"?: string;
  "@_expand": string;
  "@_cost-manual-value"?: string;
  "@_cost-calculated"?: string;
  notes?: string;
  depend?: XMLDependencyInput | XMLDependencyInput[];
  customproperty?: XMLCustomPropertyInput | XMLCustomPropertyInput[];
  task?: XMLTaskInput | XMLTaskInput[];
  "@_fixed-start"?: string;
};

export type XMLTaskOutput = {
  "@_id": number;
  "@_uid": string;
  "@_name": string;
  "@_color"?: string;
  "@_shape"?: string;
  "@_meeting": boolean;
  "@_project"?: boolean;
  "@_start": XMLDateTypeOutput;
  "@_duration": number;
  "@_complete": number;
  "@_thirdDate"?: XMLDateTypeOutput;
  "@_thirdDate-constraint"?: number;
  "@_priority"?: TaskPriorityType;
  "@_webLink"?: string;
  "@_expand": boolean;
  "@_cost-manual-value"?: number;
  "@_cost-calculated"?: boolean;
  notes?: string;
  depend?: v.InferOutput<typeof XMLDependencySchema>[];
  customproperty: v.InferOutput<typeof XMLCustomPropertySchema>[];
  task?: XMLTaskOutput[];
  "@_fixed-start"?: string;
};

export const XMLTaskSchema: v.GenericSchema<XMLTaskInput, XMLTaskOutput> = v
  .object({
    "@_id": stringToNumberPipeline,
    "@_uid": v.string(),
    "@_name": v.string(),
    "@_color": v.optional(v.string()),
    "@_shape": v.optional(v.string()),
    "@_meeting": stringToBooleanPipeline,
    "@_project": v.optional(stringToBooleanPipeline),
    "@_start": XMLDateToDatePipeline,
    "@_duration": stringToNumberPipeline,
    "@_complete": stringToNumberPipeline,
    "@_thirdDate": v.optional(XMLDateToDatePipeline),
    "@_thirdDate-constraint": v.optional(stringToNumberPipeline),
    "@_priority": v.optional(v.enum(TaskPriorityType)),
    "@_webLink": v.optional(
      v.pipe(v.string(), v.transform((input) => decodeURIComponent(input))),
    ),
    "@_expand": stringToBooleanPipeline,
    "@_cost-manual-value": v.optional(stringToNumberPipeline),
    "@_cost-calculated": v.optional(stringToBooleanPipeline),
    notes: v.optional(v.string()),
    depend: v.optional(
      v.pipe(
        v.union([XMLDependencySchema, v.array(XMLDependencySchema)]),
        v.transform(forceToArray),
      ),
    ),
    customproperty: v.optional(
      v.pipe(
        v.union([XMLCustomPropertySchema, v.array(XMLCustomPropertySchema)]),
        v.transform(forceToArray),
      ),
      [],
    ),
    task: v.optional(
      v.pipe(
        v.union([
          v.lazy(() => XMLTaskSchema),
          v.array(v.lazy(() => XMLTaskSchema)),
        ]),
        v.transform(forceToArray),
      ),
    ),
    "@_fixed-start": v.optional(v.string()),
  });

export const XMLTaskSetSchema = v.object({
  "@_empty-milestones": stringToBooleanPipeline,
  taskproperties: v.pipe(
    v.union([
      XMLTaskPropertySetSchema,
      v.literal(""),
    ]),
    v.transform(emptyStringToUndefined),
  ),
  task: v.optional(
    v.pipe(
      v.union([XMLTaskSchema, v.array(XMLTaskSchema)]),
      v.transform(forceToArray),
    ),
  ),
});
export type XMLTaskSetInput = v.InferInput<typeof XMLTaskSetSchema>;
export type XMLTaskSetOutput = v.InferOutput<typeof XMLTaskSetSchema>;

export const XMLCustomPropertyDefinitionSchema = v.object({
  "@_id": v.string(),
  "@_name": v.string(),
  "@_type": v.string(),
  "@_default-value": v.optional(v.string()),
  "@_MSPROJECT_TYPE": v.optional(v.string()),
});
export type XMLCustomPropertyDefinitionInput = v.InferInput<
  typeof XMLCustomPropertyDefinitionSchema
>;
export type XMLCustomPropertyDefinitionOutput = v.InferOutput<
  typeof XMLCustomPropertyDefinitionSchema
>;

export const XMLRateSchema = v.object({
  "@_name": v.string(),
  "@_value": stringToNumberPipeline,
});
export type XMLRateInput = v.InferInput<typeof XMLRateSchema>;
export type XMLRateOutput = v.InferOutput<typeof XMLRateSchema>;

export const XMLResourceCustomPropertySchema = v.object({
  "@_definition-id": v.string(),
  "@_value": v.string(),
});
export type XMLResourceCustomPropertyInput = v.InferInput<
  typeof XMLResourceCustomPropertySchema
>;
export type XMLResourceCustomPropertyOutput = v.InferOutput<
  typeof XMLResourceCustomPropertySchema
>;

export const XMLResourceSchema = v.object({
  "@_id": stringToNumberPipeline,
  "@_name": v.string(),
  "@_function": v.string(),
  "@_contacts": v.string(),
  "@_phone": v.string(),
  rate: v.optional(XMLRateSchema),
  "custom-property": v.optional(
    v.pipe(
      v.union([
        XMLResourceCustomPropertySchema,
        v.array(XMLResourceCustomPropertySchema),
      ]),
      v.transform(forceToArray),
    ),
    [],
  ),
});
export type XMLResourceInput = v.InferInput<typeof XMLResourceSchema>;
export type XMLResourceOutput = v.InferOutput<typeof XMLResourceSchema>;

export const XMLResourceSetSchema = v.object({
  "custom-property-definition": v.optional(
    v.pipe(
      v.union([
        XMLCustomPropertyDefinitionSchema,
        v.array(XMLCustomPropertyDefinitionSchema),
      ]),
      v.transform(forceToArray),
    ),
    [],
  ),
  resource: v.optional(
    v.pipe(
      v.union([XMLResourceSchema, v.array(XMLResourceSchema)]),
      v.transform(forceToArray),
    ),
    [],
  ),
});
export type XMLResourceSetInput = v.InferInput<typeof XMLResourceSetSchema>;
export type XMLResourceSetOutput = v.InferOutput<typeof XMLResourceSetSchema>;

export const XMLAllocationSchema = v.object({
  "@_task-id": stringToNumberPipeline,
  "@_resource-id": stringToNumberPipeline,
  "@_function": v.optional(v.string()),
  "@_responsible": stringToBooleanPipeline,
  "@_load": stringToNumberPipeline,
});
export type XMLAllocationInput = v.InferInput<typeof XMLAllocationSchema>;
export type XMLAllocationOutput = v.InferOutput<typeof XMLAllocationSchema>;

export const XMLAllocationSetSchema = v.object({
  "allocation": v.pipe(
    v.union([XMLAllocationSchema, v.array(XMLAllocationSchema)]),
    v.transform(forceToArray),
  ),
});
export type XMLAllocationSetInput = v.InferInput<typeof XMLAllocationSetSchema>;
export type XMLAllocationSetOutput = v.InferOutput<
  typeof XMLAllocationSetSchema
>;

export const XMLVacationSchema = v.object({
  "@_start": XMLDateToDatePipeline,
  "@_end": XMLDateToDatePipeline,
  "@_resourceid": stringToNumberPipeline,
});
export type XMLVacationInput = v.InferInput<typeof XMLVacationSchema>;
export type XMLVacationOutput = v.InferOutput<typeof XMLVacationSchema>;

export const XMLVacationSetSchema = v.object({
  "vacation": v.pipe(
    v.union([XMLVacationSchema, v.array(XMLVacationSchema)]),
    v.transform(forceToArray),
  ),
});
export type XMLVacationSetInput = v.InferInput<typeof XMLVacationSetSchema>;
export type XMLVacationSetOutput = v.InferOutput<typeof XMLVacationSetSchema>;

export const XMLBaselineTaskSchema = v.object({
  "@_id": stringToNumberPipeline,
  "@_start": XMLDateToDatePipeline,
  "@_duration": stringToNumberPipeline,
  "@_meeting": stringToBooleanPipeline,
  "@_super": stringToBooleanPipeline,
});
export type XMLBaselineTaskInput = v.InferInput<typeof XMLBaselineTaskSchema>;
export type XMLBaselineTaskOutput = v.InferOutput<typeof XMLBaselineTaskSchema>;

export const XMLBaselineSchema = v.object({
  "@_name": v.string(),
  "previous-task": v.optional(
    v.pipe(
      v.union([XMLBaselineTaskSchema, v.array(XMLBaselineTaskSchema)]),
      v.transform(forceToArray),
    ),
  ),
});
export type XMLBaselineInput = v.InferInput<typeof XMLBaselineSchema>;
export type XMLBaselineOutput = v.InferOutput<typeof XMLBaselineSchema>;

export const XMLBaselineSetSchema = v.object({
  "previous-tasks": v.optional(
    v.pipe(
      v.union([XMLBaselineSchema, v.array(XMLBaselineSchema)]),
      v.transform(forceToArray),
    ),
    [],
  ),
});
export type XMLBaselineSetInput = v.InferInput<typeof XMLBaselineSetSchema>;
export type XMLBaselineSetOutput = v.InferOutput<typeof XMLBaselineSetSchema>;

export const XMLRoleSchema = v.object({
  "@_id": v.string(),
  "@_name": v.string(),
});
export type XMLRoleInput = v.InferInput<typeof XMLRoleSchema>;
export type XMLRoleOutput = v.InferOutput<typeof XMLRoleSchema>;

export const XMLRoleSetSchema = v.object({
  "@_roleset-name": v.optional(v.string()),
  role: v.optional(
    v.pipe(
      v.union([XMLRoleSchema, v.array(XMLRoleSchema)]),
      v.transform(forceToArray),
    ),
  ),
});
export type XMLRoleSetInput = v.InferInput<typeof XMLRoleSetSchema>;
export type XMLRoleSetOutput = v.InferOutput<typeof XMLRoleSetSchema>;

export const XMLProjectSchema = v.object({
  "@_name": v.string(),
  "@_company": v.string(),
  "@_webLink": v.string(),
  "@_view-date": XMLDateToDatePipeline,
  "@_view-index": stringToNumberPipeline,
  "@_gantt-divider-location": stringToNumberPipeline,
  "@_resource-divider-location": stringToNumberPipeline,
  "@_version": v.string(),
  "@_locale": v.string(),
  description: v.optional(v.string()),
  view: v.pipe(
    v.union([XMLViewSchema, v.array(XMLViewSchema)]),
    v.transform(forceToArray),
  ),
  calendars: XMLCalendarSchema,
  tasks: XMLTaskSetSchema,
  resources: v.pipe(
    v.union([XMLResourceSetSchema, v.literal("")]),
    v.transform(emptyStringToUndefined),
  ),
  allocations: v.pipe(
    v.union([
      XMLAllocationSetSchema,
      v.literal(""),
    ]),
    v.transform(emptyStringToUndefined),
  ),
  vacations: v.pipe(
    v.union([
      XMLVacationSetSchema,
      v.literal(""),
    ]),
    v.transform(emptyStringToUndefined),
  ),
  previous: v.pipe(
    v.union([XMLBaselineSetSchema, v.literal("")]),
    v.transform(emptyStringToUndefined),
  ),
  roles: v.pipe(
    v.union([XMLRoleSetSchema, v.array(XMLRoleSetSchema)]),
    v.transform(forceToArray),
  ),
});
export type XMLProjectInput = v.InferInput<typeof XMLProjectSchema>;
export type XMLProjectOutput = v.InferOutput<typeof XMLProjectSchema>;
