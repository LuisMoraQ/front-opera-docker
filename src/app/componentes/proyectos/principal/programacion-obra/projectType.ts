export interface programacion {
    _declaration: Declaration;
    Project: Project;
}

export interface Project {
    _attributes: ProjectAttributes;
    SaveVersion: ActualsInSync;
    Name: ActualsInSync;
    Title: ActualsInSync;
    CreationDate: ActualsInSync;
    LastSaved: ActualsInSync;
    ScheduleFromStart: ActualsInSync;
    StartDate: ActualsInSync;
    FinishDate: ActualsInSync;
    FYStartDate: ActualsInSync;
    CriticalSlackLimit: ActualsInSync;
    CurrencyDigits: ActualsInSync;
    CurrencySymbol: ActualsInSync;
    CurrencyCode: ActualsInSync;
    CurrencySymbolPosition: ActualsInSync;
    CalendarUID: ActualsInSync;
    DefaultStartTime: ActualsInSync;
    DefaultFinishTime: ActualsInSync;
    MinutesPerDay: ActualsInSync;
    MinutesPerWeek: ActualsInSync;
    DaysPerMonth: ActualsInSync;
    DefaultTaskType: ActualsInSync;
    DefaultFixedCostAccrual: ActualsInSync;
    DefaultStandardRate: ActualsInSync;
    DefaultOvertimeRate: ActualsInSync;
    DurationFormat: ActualsInSync;
    WorkFormat: ActualsInSync;
    EditableActualCosts: ActualsInSync;
    HonorConstraints: ActualsInSync;
    InsertedProjectsLikeSummary: ActualsInSync;
    MultipleCriticalPaths: ActualsInSync;
    NewTasksEffortDriven: ActualsInSync;
    NewTasksEstimated: ActualsInSync;
    SplitsInProgressTasks: ActualsInSync;
    SpreadActualCost: ActualsInSync;
    SpreadPercentComplete: ActualsInSync;
    TaskUpdatesResource: ActualsInSync;
    FiscalYearStart: ActualsInSync;
    WeekStartDay: ActualsInSync;
    MoveCompletedEndsBack: ActualsInSync;
    MoveRemainingStartsBack: ActualsInSync;
    MoveRemainingStartsForward: ActualsInSync;
    MoveCompletedEndsForward: ActualsInSync;
    BaselineForEarnedValue: ActualsInSync;
    AutoAddNewResourcesAndTasks: ActualsInSync;
    CurrentDate: ActualsInSync;
    MicrosoftProjectServerURL: ActualsInSync;
    Autolink: ActualsInSync;
    NewTaskStartDate: ActualsInSync;
    NewTasksAreManual: ActualsInSync;
    DefaultTaskEVMethod: ActualsInSync;
    ProjectExternallyEdited: ActualsInSync;
    ExtendedCreationDate: ActualsInSync;
    ActualsInSync: ActualsInSync;
    RemoveFileProperties: ActualsInSync;
    AdminProject: ActualsInSync;
    UpdateManuallyScheduledTasksWhenEditingLinks: ActualsInSync;
    KeepTaskOnNearestWorkingTimeWhenMadeAutoScheduled: ActualsInSync;
    OutlineCodes: ExtendedAttributes;
    WBSMasks: ExtendedAttributes;
    ExtendedAttributes: ExtendedAttributes;
    Calendars: Calendars;
    Tasks: Tasks;
    Resources: Resources;
    Assignments: Assignments;
}

export interface ActualsInSync {
    _text?: string;
}

export interface Assignments {
    Assignment: Assignment[];
}

export interface Assignment {
    UID: ActualsInSync;
    TaskUID: ActualsInSync;
    ResourceUID: ActualsInSync;
    PercentWorkComplete: ActualsInSync;
    ActualCost: ActualsInSync;
    ActualOvertimeCost: ActualsInSync;
    ActualOvertimeWork: ActualsInSync;
    ActualWork: ActualsInSync;
    ACWP: ActualsInSync;
    Confirmed: ActualsInSync;
    Cost: ActualsInSync;
    CostRateTable: ActualsInSync;
    RateScale: ActualsInSync;
    CostVariance: ActualsInSync;
    CV: ActualsInSync;
    Delay: ActualsInSync;
    Finish: ActualsInSync;
    FinishVariance: ActualsInSync;
    WorkVariance: ActualsInSync;
    HasFixedRateUnits: ActualsInSync;
    FixedMaterial: ActualsInSync;
    LevelingDelay: ActualsInSync;
    LevelingDelayFormat: ActualsInSync;
    LinkedFields: ActualsInSync;
    Milestone: ActualsInSync;
    Overallocated: ActualsInSync;
    OvertimeCost: ActualsInSync;
    OvertimeWork: ActualsInSync;
    RegularWork: ActualsInSync;
    RemainingCost: ActualsInSync;
    RemainingOvertimeCost: ActualsInSync;
    RemainingOvertimeWork: ActualsInSync;
    RemainingWork: ActualsInSync;
    ResponsePending: ActualsInSync;
    Start: ActualsInSync;
    StartVariance: ActualsInSync;
    Units: ActualsInSync;
    UpdateNeeded: ActualsInSync;
    VAC: ActualsInSync;
    Work: ActualsInSync;
    WorkContour: ActualsInSync;
    BCWS: ActualsInSync;
    BCWP: ActualsInSync;
    BookingType: ActualsInSync;
    CreationDate: ActualsInSync;
    BudgetCost: ActualsInSync;
    BudgetWork: ActualsInSync;
    TimephasedData?: TimephasedDAT[] | TimephasedDAT;
}

export interface TimephasedDAT {
    Type: ActualsInSync;
    UID: ActualsInSync;
    Start: ActualsInSync;
    Finish: ActualsInSync;
    Unit: ActualsInSync;
    Value: ActualsInSync;
}

export interface Calendars {
    Calendar: Calendar;
}

export interface Calendar {
    UID: ActualsInSync;
    Name: ActualsInSync;
    IsBaseCalendar: ActualsInSync;
    IsBaselineCalendar: ActualsInSync;
    BaseCalendarUID: ActualsInSync;
    WeekDays: WeekDays;
    Exceptions: Exceptions;
}

export interface Exceptions {
    Exception: Exception;
}

export interface Exception {
    EnteredByOccurrences: ActualsInSync;
    TimePeriod: TimePeriod;
    Occurrences: ActualsInSync;
    Name: ExtendedAttributes;
    Type: ActualsInSync;
    DayWorking: ActualsInSync;
}

export interface ExtendedAttributes {
}

export interface TimePeriod {
    FromDate: ActualsInSync;
    ToDate: ActualsInSync;
}

export interface WeekDays {
    WeekDay: WeekDay[];
}

export interface WeekDay {
    DayType: ActualsInSync;
    DayWorking: ActualsInSync;
    WorkingTimes?: WorkingTimes;
    TimePeriod?: TimePeriod;
}

export interface WorkingTimes {
    WorkingTime: WorkingTime[];
}

export interface WorkingTime {
    FromTime: ActualsInSync;
    ToTime: ActualsInSync;
}

export interface Resources {
    Resource: { [key: string]: ActualsInSync };
}

export interface Tasks {
    Task: task[];
}

export interface task {
    UID: ActualsInSync;
    ID: ActualsInSync;
    Name: ActualsInSync;
    Active: ActualsInSync;
    Manual: ActualsInSync;
    Type: ActualsInSync;
    IsNull: ActualsInSync;
    CreateDate: ActualsInSync;
    WBS: ActualsInSync;
    OutlineNumber: ActualsInSync;
    OutlineLevel: ActualsInSync;
    Priority: ActualsInSync;
    Start: ActualsInSync;
    Finish: ActualsInSync;
    Duration: ActualsInSync;
    ManualStart: ActualsInSync;
    ManualFinish: ActualsInSync;
    ManualDuration: ActualsInSync;
    DurationFormat: ActualsInSync;
    Work: ActualsInSync;
    ResumeValid: ActualsInSync;
    EffortDriven: ActualsInSync;
    Recurring: ActualsInSync;
    OverAllocated: ActualsInSync;
    Estimated: ActualsInSync;
    Milestone: ActualsInSync;
    Summary: ActualsInSync;
    DisplayAsSummary: ActualsInSync;
    Critical: ActualsInSync;
    IsSubproject: ActualsInSync;
    IsSubprojectReadOnly: ActualsInSync;
    ExternalTask: ActualsInSync;
    EarlyStart: ActualsInSync;
    EarlyFinish: ActualsInSync;
    LateStart: ActualsInSync;
    LateFinish: ActualsInSync;
    StartVariance: ActualsInSync;
    FinishVariance: ActualsInSync;
    WorkVariance: ActualsInSync;
    FreeSlack: ActualsInSync;
    TotalSlack: ActualsInSync;
    StartSlack: ActualsInSync;
    FinishSlack: ActualsInSync;
    FixedCost: ActualsInSync;
    FixedCostAccrual: ActualsInSync;
    PercentComplete: ActualsInSync;
    PercentWorkComplete: ActualsInSync;
    Cost: ActualsInSync;
    OvertimeCost: ActualsInSync;
    OvertimeWork: ActualsInSync;
    ActualDuration: ActualsInSync;
    ActualCost: ActualsInSync;
    ActualOvertimeCost: ActualsInSync;
    ActualWork: ActualsInSync;
    ActualOvertimeWork: ActualsInSync;
    RegularWork: ActualsInSync;
    RemainingDuration: ActualsInSync;
    RemainingCost: ActualsInSync;
    RemainingWork: ActualsInSync;
    RemainingOvertimeCost: ActualsInSync;
    RemainingOvertimeWork: ActualsInSync;
    ACWP: ActualsInSync;
    CV: ActualsInSync;
    ConstraintType: ActualsInSync;
    CalendarUID: ActualsInSync;
    LevelAssignments: ActualsInSync;
    LevelingCanSplit: ActualsInSync;
    LevelingDelay: ActualsInSync;
    LevelingDelayFormat: ActualsInSync;
    IgnoreResourceCalendar: ActualsInSync;
    HideBar: ActualsInSync;
    Rollup: ActualsInSync;
    BCWS: ActualsInSync;
    BCWP: ActualsInSync;
    PhysicalPercentComplete: ActualsInSync;
    EarnedValueMethod: ActualsInSync;
    IsPublished: ActualsInSync;
    CommitmentType: ActualsInSync;
    PredecessorLink?: PredecessorLinkElement[] | PredecessorLinkElement;
}

export interface PredecessorLinkElement {
    PredecessorUID: ActualsInSync;
    Type: ActualsInSync;
    CrossProject: ActualsInSync;
    LinkLag: ActualsInSync;
    LagFormat: ActualsInSync;
}

export interface ProjectAttributes {
    xmlns: string;
}

export interface Declaration {
    _attributes: DeclarationAttributes;
}

export interface DeclarationAttributes {
    version: string;
    encoding: string;
    standalone: string;
}


export interface taskPartida {
    condfin: string;
    condini: string;
    cuadrilla: number;
    descripcion: string;
    duracion: number;
    duracionreq: number;
    duraciontot: number;
    editarCua: boolean;
    editarDur: boolean;
    editarFF: boolean;
    editarFI: boolean;
    editarPred: boolean;
    editarRest: boolean;
    fechafin: string;
    fechafinBD: boolean;
    fechaini: string;
    fechainiBD: boolean;
    hijos: string;
    icomost: number;
    id_proyecto: number;
    id_usuario: number;
    idgantt: number;
    ind: number;
    ind2: number;
    indice: number;
    hijos_uid: string;
    item: string;
    metrado: any;
    mostrar: number;
    nivel: number;
    nroclick: number;
    predecesor: boolean;
    referencia: string;
    referenciados: string;
    rendimiento: null;
    restriccion: string;
    restriccion2: string;
    unidad: string;
    uid: number;
}