
import type { WizardStepConfig, StudyFacts } from './types';

export const OPAIR_HANDBOOK_URL = "https://researchsupport.psu.edu/orp/irb/";
export const OPAIR_RUBRIC_URL = "https://www.psu.edu/opair";
export const PRIVACY_DISCLAIMER = "Note: Do not upload any Personally Identifiable Information (PII) or student records.";

export const LOADING_MESSAGES = [
  "Analyzing study parameters...",
  "Drafting Section 4.2 Recruitment sub-steps...",
  "Formatting Section 5.0 Consent waivers...",
  "Checking for contradictory identifiers in Section 21...",
  "Populating Data Storage checkboxes...",
  "Ensuring lay language compliance...",
  "Finalizing your HRP-591 draft..."
];

export const DEFAULT_STUDY_FACTS: StudyFacts = {
  protocolTitle: '', piName: '', piDepartment: '', piTelephone: '', piEmail: '', clinicalTrialsId: '',
  objectives: '', primaryEndpoints: '', secondaryEndpoints: '',
  scientificBackground: '', previousData: '', studyRationale: '',
  inclusionCriteria: '', internationalResearch: false, internationalCountries: '', exclusionCriteria: '', 
  vulnerablePopulations: [], withdrawalCriteria: '', withdrawalFollowUp: '',
  recruitmentMethods: [], recruitmentIdentification: '', recruitmentProcessNarrative: '',
  recruitmentHow: '', recruitmentWhere: '', recruitmentWhen: '',
  screeningProcedures: '', screeningOralWritten: false, screeningOralWrittenDesc: '',
  screeningRecords: false, screeningRecordsDesc: '', screeningActivities: false, screeningActivitiesDesc: '',
  screeningDataRetention: false, screeningDataRetentionDesc: '',
  consentProcessType: [], consentProcessDescription: '', consentCoercion: '',
  waiverDocConditions: [], waiverDocMaterials: '', waiverAlterationDetails: '',
  nonEnglishLanguage: '', impairedCapacity: false, impairedCapacityDetails: '',
  childrenInvolved: false, parentalPermission: '', childrenAssent: '',
  hipaaAuthorization: [], hipaaWaiverDetails: '',
  studyDesign: '', proceduresNarrative: '', proceduresVisit1: '', proceduresVisit2: '', duration: '',
  sampleSize: '', sampleSizeJustification: '', statisticalMethods: '',
  minimalRisk: true, dsmPlanPeriodicEval: '', dsmPlanDataReviewed: '', dsmPlanCollectionMethod: '',
  dsmPlanFrequency: '', dsmPlanReviewers: '', dsmPlanCumulative: '', dsmPlanStats: '', dsmPlanSuspension: '',
  risks: '', benefitsSubjects: '', benefitsOthers: '',
  sharingResults: '', compensation: '', costs: '', injuryCompensation: '',
  facilities: '', recruitmentFeasibility: '', piTime: '', medicalResources: '', teamTraining: '',
  externalApprovals: '', isMultiSite: false, multiSiteDetails: '',
  adverseEventsReport: true, monitoringAudit: true, references: '',
  identifiers: [], identifiersLinked: false, identifiersLinkDetails: '',
  paperRecords: false, paperRecordsLocation: '', paperRecordsAccess: false,
  electronicRecords: false, electronicCollectionMethod: '', electronicExternalAccess: false, dataLevel: '',
  storageLocations: [], storageOther: '',
  recordings: [], recordingVideoPlatform: [], recordingDetails: '', recordingDestruction: '',
  transcription: false, transcriptionDetails: '',
  coc: false, genomicSharing: false, dataRepositories: false, dataTransfer: false, dataTransferDetails: '',
  isBankingData: false, bankingDetails: ''
};

export const HRP_591_SECTIONS = [
  { id: "1.1", title: "1.1 Study Objectives" },
  { id: "1.2", title: "1.2 Primary Endpoints" },
  { id: "1.3", title: "1.3 Secondary Endpoints" },
  { id: "2.1", title: "2.1 Scientific Background and Gaps" },
  { id: "2.2", title: "2.2 Previous Data" },
  { id: "2.3", title: "2.3 Study Rationale" },
  { id: "3.1", title: "3.1 Inclusion Criteria" },
  { id: "3.1.1", title: "3.1.1 International Research" },
  { id: "3.2", title: "3.2 Exclusion Criteria" },
  { id: "3.3", title: "3.3 Early Withdrawal of Subjects" },
  { id: "3.3.1", title: "3.3.1 Criteria for removal from study" },
  { id: "3.3.2", title: "3.3.2 Follow-up for withdrawn subjects" },
  { id: "4.1", title: "4.1 Identification of subjects" },
  { id: "4.2", title: "4.2 Recruitment process" },
  { id: "4.2.1", title: "4.2.1 How potential subjects will be recruited" },
  { id: "4.2.2", title: "4.2.2 Where potential subjects will be recruited" },
  { id: "4.2.3", title: "4.2.3 When potential subjects will be recruited" },
  { id: "4.2.4", title: "4.2.4 Screening and determining eligibility" },
  { id: "5.1", title: "5.1 Consent Process (Checkboxes)" },
  { id: "5.2.1", title: "5.2.1 Consent Process" },
  { id: "5.2.2", title: "5.2.2 Coercion or Undue Influence" },
  { id: "5.3", title: "5.3 Waiver of Written Documentation" },
  { id: "5.4", title: "5.4 Alteration of Consent" },
  { id: "5.5", title: "5.5 Waiver of Consent" },
  { id: "5.6", title: "5.6 Consent – Other Considerations" },
  { id: "6.1", title: "6.1 HIPAA Authorization" },
  { id: "6.2", title: "6.2 HIPAA Waiver/Alteration Details" },
  { id: "7.1", title: "7.1 Study Design" },
  { id: "7.2", title: "7.2 Study Procedures" },
  { id: "7.2.1", title: "7.2.1 Visit 1 / Day 1" },
  { id: "7.2.2", title: "7.2.2 Visit 2 / Day 2 (if applicable)" },
  { id: "7.3", title: "7.3 Duration of Participation" },
  { id: "8.1", title: "8.1 Number of Subjects" },
  { id: "8.2", title: "8.2 Sample Size Determination" },
  { id: "8.3", title: "8.3 Statistical or Analytic Methods" },
  { id: "9.0", title: "9.0 Data and Safety Monitoring Plan" },
  { id: "10.0", title: "10.0 Risks" },
  { id: "11.1", title: "11.1 Potential Benefits to Subjects" },
  { id: "11.2", title: "11.2 Potential Benefits to Others" },
  { id: "12.0", title: "12.0 Sharing Results with Subjects" },
  { id: "13.0", title: "13.0 Subject Payment" },
  { id: "14.1", title: "14.1 Costs" },
  { id: "14.2", title: "14.2 Compensation for research-related injury" },
  { id: "15.0", title: "15.0 Resources Available" },
  { id: "16.0", title: "16.0 Other Approvals" },
  { id: "17.0", title: "17.0 Multi-Site Study" },
  { id: "18.0", title: "18.0 Adverse Event Reporting" },
  { id: "19.0", title: "19.0 Study Monitoring, Auditing, and Inspecting" },
  { id: "20.0", title: "20.0 References" },
  { id: "21.1", title: "21.1 Identifiers (Checkboxes)" },
  { id: "21.2", title: "21.2 Data Linking" },
  { id: "21.3", title: "21.3 Storage of Paper Records" },
  { id: "21.4", title: "21.4 Storage of Electronic Records" },
  { id: "21.5", title: "21.5 Recordings" },
  { id: "21.6", title: "21.6 Certificate of Confidentiality" },
  { id: "21.7", title: "21.7 Genomic Data Sharing" },
  { id: "21.9", title: "21.9 Data Transfer" },
  { id: "22.0", title: "22.0 Data/Specimen Banking" },
];

export const PREFLIGHT_QUESTIONS = [
  {
    id: 'protocolTitle',
    text: 'What is the full title of your study?',
    subText: 'As listed in item 1 on the Basic Information page in CATS IRB.',
    type: 'text',
    placeholder: 'e.g., Impact of Sleep on Memory'
  },
  {
    id: 'population',
    text: 'Who is your target population?',
    subText: 'Be specific about age range and affiliation (e.g. PSU Students).',
    type: 'text',
    placeholder: 'e.g., Adults 18+ living in Centre County'
  },
  {
    id: 'dataCollection',
    text: 'How will you collect identifiers?',
    subText: 'This determines your privacy level.',
    type: 'select',
    options: ['Anonymous', 'Confidential', 'Identifiable']
  },
  {
    id: 'minimalRisk',
    text: 'Is this study more than minimal risk?',
    subText: 'Minimal risk means harm is not greater than daily life.',
    type: 'select',
    options: ['No (Minimal Risk)', 'Yes (Greater than Minimal Risk)']
  }
];

export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: 'basics',
    title: '1. Administrative & Objectives',
    description: 'Protocol Title, PI Info, and Core Objectives (Sections 1.0 - 2.0).',
    fields: [
      {
        id: 'protocolTitle',
        label: 'Protocol Title',
        type: 'text',
        placeholder: 'Full title as listed in CATS IRB'
      },
      {
        id: 'piName',
        label: 'Principal Investigator Name',
        type: 'text',
        placeholder: 'e.g., Dr. Jane Smith'
      },
      {
        id: 'clinicalTrialsId',
        label: 'ClinicalTrials.gov ID (if applicable)',
        type: 'text',
        placeholder: 'e.g., NCT12345678 or N/A'
      },
      {
        id: 'objectives',
        label: '1.1 Study Objectives',
        type: 'textarea',
        helperText: 'State purpose, aims, hypotheses. Mention AI usage if applicable.',
        placeholder: 'The purpose of this study is to...'
      },
      {
        id: 'scientificBackground',
        label: '2.1 Scientific Background',
        type: 'textarea',
        helperText: 'Describe background and gaps. 2-3 Paragraphs required.',
        placeholder: 'Previous research suggests...'
      },
      {
        id: 'studyRationale',
        label: '2.3 Study Rationale',
        type: 'textarea',
        placeholder: 'Why is this research important now?'
      }
    ]
  },
  {
    id: 'subjects',
    title: '2. Subjects & Criteria',
    description: 'Inclusion, Exclusion, and Vulnerable Populations (Section 3.0).',
    fields: [
      {
        id: 'inclusionCriteria',
        label: '3.1 Inclusion Criteria',
        type: 'textarea',
        placeholder: 'Numbered list: 1. Age 18+...'
      },
      {
        id: 'internationalResearch',
        label: '3.1.1 International Research?',
        type: 'boolean-toggle',
        options: ['No', 'Yes']
      },
      {
        id: 'exclusionCriteria',
        label: '3.2 Exclusion Criteria',
        type: 'textarea',
        placeholder: 'Numbered list: 1. History of...'
      },
      {
        id: 'vulnerablePopulations',
        label: 'Vulnerable Populations',
        type: 'checkbox-group',
        options: [
          'Children (Minors)',
          'Pregnant Women / Neonates',
          'Prisoners',
          'Adults with Impaired Decision-Making',
          'None of the above'
        ]
      },
      {
        id: 'withdrawalCriteria',
        label: '3.3.1 Criteria for Removal',
        type: 'textarea',
        placeholder: 'Subjects will be removed if...'
      }
    ]
  },
  {
    id: 'recruitment',
    title: '3. Recruitment Logistics',
    description: 'Identification, Contact, and Screening (Section 4.0).',
    fields: [
      {
        id: 'recruitmentMethods',
        label: '4.0 Recruitment Methods',
        type: 'multi-select',
        options: [
          'StudyFinder',
          'Penn State Health EIM',
          'Flyers/Posters',
          'Email/Listservs',
          'Social Media',
          'Classroom Announcement'
        ]
      },
      {
        id: 'recruitmentIdentification',
        label: '4.1 Identification of Subjects',
        type: 'textarea',
        helperText: 'Source of subjects (e.g. listservs, databases).',
        placeholder: 'Subjects will be identified via...'
      },
      {
        id: 'recruitmentHow',
        label: '4.2.1 How subjects will be recruited',
        type: 'textarea',
        placeholder: 'We will approach subjects...'
      },
      {
        id: 'recruitmentWhere',
        label: '4.2.2 Where recruitment occurs',
        type: 'textarea',
        placeholder: 'Recruitment will take place at...'
      },
      {
        id: 'recruitmentWhen',
        label: '4.2.3 When recruitment occurs',
        type: 'textarea',
        placeholder: 'Subjects will be recruited prior to...'
      },
      {
        id: 'screeningProcedures',
        label: '4.2.4 Screening Procedures',
        type: 'textarea',
        helperText: 'Describe how eligibility is determined.',
        placeholder: 'Potential subjects will complete a screening survey...'
      }
    ]
  },
  {
    id: 'consent',
    title: '4. Consent & HIPAA',
    description: 'Process, Waivers, and HIPAA (Sections 5.0 - 6.0).',
    fields: [
      {
        id: 'consentProcessType',
        label: '5.1 Consent Process',
        type: 'checkbox-group',
        options: [
          'Written Documentation (Signed Form)',
          'Waiver of Documentation (Verbal/Implied)',
          'Waiver of Consent',
          'Alteration of Consent'
        ],
        optionHelp: {
            'Written Documentation (Signed Form)': 'Standard. Participant signs a physical/electronic form.',
            'Waiver of Documentation (Verbal/Implied)': 'For minimal risk surveys (anonymous) or when signature is the only link to harm.',
            'Waiver of Consent': 'No consent obtained at all (e.g. Retrospective chart review).',
            'Alteration of Consent': 'Consent is obtained but elements are missing (e.g. Deception studies).'
        }
      },
      {
        id: 'consentProcessDescription',
        label: '5.2.1 Consent Process Description',
        type: 'textarea',
        placeholder: 'Consent will be obtained...'
      },
      {
        id: 'consentCoercion',
        label: '5.2.2 Steps to Minimize Coercion',
        type: 'textarea',
        placeholder: 'Subjects will be assured participation is voluntary...'
      },
      {
        id: 'hipaaAuthorization',
        label: '6.1 HIPAA Authorization',
        type: 'checkbox-group',
        options: [
          'Not Applicable',
          'Signed Authorization',
          'Partial Waiver (Recruitment)',
          'Full Waiver',
          'Alteration (Verbal)'
        ],
        optionHelp: {
            'Not Applicable': 'Study does NOT access Protected Health Information (PHI).',
            'Signed Authorization': 'Standard. Participant signs HIPAA form.',
            'Partial Waiver (Recruitment)': 'Accessing PHI only to identify/recruit subjects.',
            'Full Waiver': 'Accessing PHI without ever getting signature (e.g. Chart review).'
        }
      }
    ]
  },
  {
    id: 'procedures',
    title: '5. Design & Procedures',
    description: 'Study Design, Visits, and Risks (Sections 7.0 - 10.0).',
    fields: [
      {
        id: 'studyDesign',
        label: '7.1 Study Design',
        type: 'textarea',
        placeholder: 'This is a cross-sectional study...'
      },
      {
        id: 'proceduresVisit1',
        label: '7.2.1 Visit 1 Procedures',
        type: 'textarea',
        placeholder: 'Step-by-step description...'
      },
      {
        id: 'duration',
        label: '7.3 Duration',
        type: 'text',
        placeholder: 'e.g., 45 minutes'
      },
      {
        id: 'sampleSize',
        label: '8.1 Sample Size',
        type: 'text',
        placeholder: 'e.g., 100'
      },
      {
        id: 'minimalRisk',
        label: 'Is this Minimal Risk?',
        type: 'select',
        options: ['Yes (Minimal Risk)', 'No (Greater than Minimal Risk)'],
        optionHelp: {
            'Yes (Minimal Risk)': 'Harm is not greater than daily life (e.g. Surveys, Blood draw).',
            'No (Greater than Minimal Risk)': 'Sensitive topics, invasive procedures, or vulnerable populations.'
        }
      },
      {
        id: 'risks',
        label: '10.0 Risks',
        type: 'textarea',
        helperText: 'Physical, psychological, economic, etc.',
        placeholder: 'The primary risk is loss of confidentiality...'
      }
    ]
  },
  {
    id: 'benefits_costs',
    title: '6. Benefits, Costs & Payment',
    description: 'Benefits, Payment, Costs, Resources (Sections 11.0 - 15.0).',
    fields: [
      {
        id: 'benefitsSubjects',
        label: '11.1 Benefits to Subjects',
        type: 'textarea',
        placeholder: 'There are no direct benefits...'
      },
      {
        id: 'sharingResults',
        label: '12.0 Sharing Results',
        type: 'textarea',
        placeholder: 'Results will not be shared...'
      },
      {
        id: 'compensation',
        label: '13.0 Compensation',
        type: 'text',
        placeholder: 'e.g., $10 Gift Card'
      },
      {
        id: 'costs',
        label: '14.1 Costs to Subjects',
        type: 'text',
        placeholder: 'None'
      },
      {
        id: 'facilities',
        label: '15.1 Facilities & Locations',
        type: 'textarea',
        placeholder: 'Research will be conducted at...'
      }
    ]
  },
  {
    id: 'safety_monitoring',
    title: '7. Safety, Monitoring & References',
    description: 'Adverse Events, Monitoring, References (Sections 18.0 - 20.0).',
    fields: [
      {
        id: 'adverseEventsReport',
        label: '18.1 Confirm Adverse Event Reporting',
        type: 'boolean-toggle',
        options: ['No', 'Yes']
      },
      {
        id: 'monitoringAudit',
        label: '19.1 Confirm Auditing Compliance',
        type: 'boolean-toggle',
        options: ['No', 'Yes']
      },
      {
        id: 'references',
        label: '20.0 References',
        type: 'textarea',
        helperText: 'List relevant references. Do NOT include in background section.',
        placeholder: 'Smith, J. (2023)...'
      }
    ]
  },
  {
    id: 'data',
    title: '8. Data Management',
    description: 'Identifiers, Storage, and Recording (Section 21.0 - 22.0).',
    fields: [
      {
        id: 'identifiers',
        label: '21.1 Identifiers Recorded',
        type: 'checkbox-group',
        options: [
          'Names / Initials',
          'Dates (birth, admission, etc)',
          'Telephone numbers',
          'Email addresses',
          'Social Security Numbers',
          'Medical Record Numbers',
          'Addresses/Geographic Data',
          'IP Addresses',
          'Biometric identifiers',
          'Full face photos',
          'Audio/Video Recordings',
          'None (Anonymous)'
        ]
      },
      {
        id: 'paperRecords',
        label: '21.3 Paper Records?',
        type: 'boolean-toggle',
        options: ['No', 'Yes']
      },
      {
        id: 'electronicRecords',
        label: '21.4 Electronic Records?',
        type: 'boolean-toggle',
        options: ['No', 'Yes']
      },
      {
        id: 'storageLocations',
        label: '21.4.3 Electronic Storage Location',
        type: 'checkbox-group',
        options: [
          'Penn State REDCap',
          'Penn State Qualtrics',
          'Penn State OneDrive/SharePoint',
          'Penn State GoogleDrive',
          'Other'
        ]
      },
      {
        id: 'recordings',
        label: '21.5 Recordings',
        type: 'checkbox-group',
        options: [
          'None',
          'Audio',
          'Video',
          'Photographs',
          'Live Stream (No Recording)'
        ]
      },
      {
        id: 'recordingVideoPlatform',
        label: '21.5.1 Video Platform (if applicable)',
        type: 'checkbox-group',
        options: [
          'Teams',
          'Zoom',
          'Other'
        ]
      },
      {
        id: 'transcription',
        label: 'Will recordings be transcribed?',
        type: 'boolean-toggle',
        options: ['No', 'Yes']
      },
      {
        id: 'isBankingData',
        label: '22.0 Banking Data/Specimens?',
        type: 'boolean-toggle',
        options: ['No', 'Yes']
      }
    ]
  }
];
