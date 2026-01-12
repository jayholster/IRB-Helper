
export type AppMode = 'home' | 'wizard' | 'research-tools';

// -- Core Data Model --
export interface StudyFacts {
  // Page 1: Header Info
  protocolTitle: string;
  piName: string;
  piDepartment: string;
  piTelephone: string;
  piEmail: string;
  clinicalTrialsId: string; // or 'N/A'

  // 1.0 Objectives
  objectives: string; // 1.1 (Include AI desc if applicable)
  primaryEndpoints: string; // 1.2
  secondaryEndpoints: string; // 1.3
  
  // 2.0 Background
  scientificBackground: string; // 2.1
  previousData: string; // 2.2
  studyRationale: string; // 2.3
  
  // 3.0 Inclusion/Exclusion
  inclusionCriteria: string; // 3.1
  internationalResearch: boolean; // 3.1.1 Checkbox
  internationalCountries: string; // 3.1.1 Detail
  exclusionCriteria: string; // 3.2
  vulnerablePopulations: string[]; 
  withdrawalCriteria: string; // 3.3.1
  withdrawalFollowUp: string; // 3.3.2

  // 4.0 Recruitment
  recruitmentMethods: string[]; // 4.0 Checkboxes/List (StudyFinder, etc)
  recruitmentIdentification: string; // 4.1
  recruitmentProcessNarrative: string; // 4.2
  recruitmentHow: string; // 4.2.1
  recruitmentWhere: string; // 4.2.2
  recruitmentWhen: string; // 4.2.3
  
  // 4.2.4 Screening
  screeningProcedures: string; // 4.2.4 Narrative
  screeningOralWritten: boolean; // 4.2.4.1 Yes/No
  screeningOralWrittenDesc: string;
  screeningRecords: boolean; // 4.2.4.2 Yes/No
  screeningRecordsDesc: string;
  screeningActivities: boolean; // 4.2.4.3 Yes/No
  screeningActivitiesDesc: string;
  screeningDataRetention: boolean; // 4.2.4.4 Yes/No
  screeningDataRetentionDesc: string;

  // 5.0 Consent
  consentProcessType: string[]; // 5.1 Checkboxes
  consentProcessDescription: string; // 5.2.1
  consentCoercion: string; // 5.2.2
  
  // 5.3 Waiver of Documentation
  waiverDocConditions: string[]; // 5.3.1 Checkboxes
  waiverDocMaterials: string; // 5.3.2

  // 5.4 Alteration / 5.5 Waiver
  waiverAlterationDetails: string; // Mapped to 5.4.1-5.4.6 / 5.5.1-5.5.5

  // 5.6 Other Consent
  nonEnglishLanguage: string; // 5.6.1
  impairedCapacity: boolean; // 5.6.2
  impairedCapacityDetails: string; 
  childrenInvolved: boolean; // 5.6.3
  parentalPermission: string; // 5.6.3.1
  childrenAssent: string; // 5.6.3.2

  // 6.0 HIPAA
  hipaaAuthorization: string[]; // 6.1 Checkboxes
  hipaaWaiverDetails: string; // 6.2

  // 7.0 Procedures
  studyDesign: string; // 7.1
  proceduresNarrative: string; // 7.2
  proceduresVisit1: string; // 7.2.1
  proceduresVisit2: string; // 7.2.2
  duration: string; // 7.3
  
  // 8.0 Stats
  sampleSize: string; // 8.1
  sampleSizeJustification: string; // 8.2
  statisticalMethods: string; // 8.3

  // 9.0 DSM Plan
  minimalRisk: boolean; // If true, 9.x is N/A
  dsmPlanPeriodicEval: string; // 9.1
  dsmPlanDataReviewed: string; // 9.2
  dsmPlanCollectionMethod: string; // 9.3
  dsmPlanFrequency: string; // 9.4
  dsmPlanReviewers: string; // 9.5
  dsmPlanCumulative: string; // 9.6
  dsmPlanStats: string; // 9.7
  dsmPlanSuspension: string; // 9.8

  // 10.0 Risks
  risks: string; 
  
  // 11.0 Benefits
  benefitsSubjects: string; // 11.1
  benefitsOthers: string; // 11.2

  // 12.0 Sharing Results
  sharingResults: string;

  // 13.0 Payment
  compensation: string; 

  // 14.0 Costs
  costs: string; // 14.1
  injuryCompensation: string; // 14.2

  // 15.0 Resources
  facilities: string; // 15.1
  recruitmentFeasibility: string; // 15.2
  piTime: string; // 15.3
  medicalResources: string; // 15.4
  teamTraining: string; // 15.5

  // 16.0 Other Approvals
  externalApprovals: string; // 16.1

  // 17.0 Multi-Site
  isMultiSite: boolean;
  multiSiteDetails: string; // 17.1 - 17.6

  // 18.0 Adverse Events
  adverseEventsReport: boolean; // 18.1 Confirmation

  // 19.0 Monitoring
  monitoringAudit: boolean; // 19.1 Confirmation

  // 20.0 References
  references: string;

  // 21.0 Data Management
  identifiers: string[]; // 21.1 Checkboxes
  identifiersLinked: boolean; // 21.2
  identifiersLinkDetails: string; // 21.2.1
  
  paperRecords: boolean; // 21.3
  paperRecordsLocation: string; // 21.3.1
  paperRecordsAccess: boolean; // 21.3.2

  electronicRecords: boolean; // 21.4
  electronicCollectionMethod: string; // 21.4.1
  electronicExternalAccess: boolean; // 21.4.1.1
  dataLevel: string; // 21.4.2
  
  storageLocations: string[]; // 21.4.3 Checkboxes (REDCap, Qualtrics, etc)
  storageOther: string;

  recordings: string[]; // 21.5 Checkboxes (Audio, Video, Photo, Live Stream)
  recordingVideoPlatform: string[]; // 21.5.1
  recordingDetails: string; // 21.5.2
  transcription: boolean; // 21.5.3
  transcriptionDetails: string;
  recordingDestruction: string; // 21.5.4

  coc: boolean; // 21.6
  genomicSharing: boolean; // 21.7
  dataRepositories: boolean; // 21.8
  dataTransfer: boolean; // 21.9
  dataTransferDetails: string; // 21.9.1 & 21.9.2

  // 22.0 Banking
  isBankingData: boolean;
  bankingDetails: string; // 22.1 - 22.6

  [key: string]: any; 
}

export interface WizardStepConfig {
  id: string;
  title: string;
  description: string;
  fields: WizardField[];
}

export interface WizardField {
  id: keyof StudyFacts;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multi-select' | 'checkbox-group' | 'boolean-toggle';
  options?: string[];
  optionHelp?: Record<string, string>; // Maps option text to a description
  placeholder?: string;
  helperText?: string;
}

// -- Protocol Types --

export interface ProtocolOutput {
  id: string;
  label: string;
  shape: string;
  paste_text: string;
  structured?: {
    selected_options?: string[];
    table_rows?: any[];
  };
  sources_used?: string[];
  confidence?: number;
}

export interface ProtocolDiagnostics {
  prohibited_content_detected: string[];
  consistency_warnings: string[];
  format_violations_fixed: boolean;
}

export interface GeneratedProtocol {
  study_facts: StudyFacts;
  protocol_outputs: ProtocolOutput[];
  assumptions: string[];
  questions_to_confirm: string[];
  contradictions: string[];
  quality_checks: ProtocolDiagnostics;
  next_actions: any[];
}

export interface FileData {
  mimeType: string;
  data: string; // base64
}

// -- Research Document Tools --

export type ResearchDocType = 'informed_consent' | 'survey' | 'interview_guide' | 'recruitment_email' | 'debriefing';

export interface ResearchDocumentResult {
  title: string;
  content: string; // HTML formatted
  mentorNotes: string; // "Why I wrote it this way"
  complianceChecks: string[]; // "Reading level check", "Required elements check"
}

// -- Legacy/Other Types (Kept for compatibility if needed) --
export interface AssessmentPlanInput {
    programName: string;
    learningObjective: string;
    curriculumAnchor: string;
    assessmentMethod: string;
    performanceTarget: string;
    findings: string;
    actionPlan: string;
    assessmentImpact: string;
    nextYearPlan: string;
}

export interface SectionFeedback {
    score: number; 
    status: 'Strong' | 'Adequate' | 'Needs Improvement';
    strengths: string[];
    weaknesses: string[];
    rewriteSuggestion?: string;
    rationale?: string;
}

export interface AssessmentPlanReview {
    overallScore: number;
    executiveSummary: string;
    sections: {
        plan: SectionFeedback;
        results: SectionFeedback;
        closingLoop: SectionFeedback;
        future: SectionFeedback;
    };
}

// -- Assignment Designer Types --

export interface LearningObjective {
  id: string;
  title: string;
  description: string;
}

export type CourseLevel = '100 (Introductory)' | '200 (Intermediate)' | '300 (Advanced)' | '400 (Senior/Capstone)' | 'Graduate';
export type ClassSize = string;

export type AssessmentType = 'Written' | 'Oral/Presentation' | 'Multimedia/Creative' | 'Group Collaboration' | 'Exam/Quiz' | 'Open to Anything';
export type AssignmentDuration = 'In-Class Activity (15-50 mins)' | 'Short Assignment (Homework / 1 Week)' | 'Major Project / Paper (2-4 Weeks)' | 'Semester-Long Capstone';

export interface AssignmentIdea {
  title: string;
  description: string;
  implementationSteps: string[];
  connectionToObjectives: string;
  assessmentStrategy: string;
}

export interface RefinementSuggestion {
  suggestion: string;
  currentApproachContext: string;
  assessmentStrategy: string;
}

export interface GeneratedContent {
  newAssignmentIdeas: AssignmentIdea[];
  refinementSuggestions: RefinementSuggestion[];
}

export interface GeneratedArtifact {
  title: string;
  type: 'handout' | 'rubric' | 'diagram';
  content: string;
}

export interface AlignmentEvaluation {
    score: number;
    rating: 'Strong' | 'Moderate' | 'Weak';
    strengths: string[];
    weaknesses: string[];
    suggestion: string;
}

export interface SharedAssignment {
  id: string;
  title: string;
  description: string;
  level: string; // Using string to allow flexibility, or use CourseLevel
  author: string;
  tags: string[];
  date: string;
}
