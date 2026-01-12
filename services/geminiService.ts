
import { GoogleGenAI, Type, Schema } from "@google/genai";
import type { 
  StudyFacts, 
  GeneratedProtocol, 
  FileData,
  AssessmentPlanInput,
  AssessmentPlanReview,
  ResearchDocType,
  ResearchDocumentResult
} from '../types';
import { HRP_591_SECTIONS, WIZARD_STEPS } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// -- Research Document Generation --

const METHODOLOGIST_INSTRUCTION = `
You are a "Research Methodologist," an expert at Penn State's IRB who helps faculty draft high-quality research documents.

GOAL: 
Generate a complete, usable draft based on the user's specific inputs. 

CRITICAL RULE - NO GENERIC TEMPLATES:
- Do NOT use generic placeholders like "[INSERT PURPOSE HERE]" or "[DESCRIBE RISKS]". 
- Instead, use the specific details provided in the prompt to write the actual text. 
- If a detail is missing, make a reasonable, standard assumption based on the study context (e.g., for risks in a survey, assume "loss of confidentiality" and write that section fully), then mention this assumption in the "Methodologist Notes".
- The output should look like a finished draft, not a template.

FORMATTING:
- Use semantic HTML (<h2>, <h3>, <p>, <ul>).
- If you absolutely must indicate a variable (like a date or specific name not provided), use: <span style="background-color: #fff7ed; color: #ea580c; font-weight: bold; padding: 0 4px; border-radius: 4px;">[Variable]</span>.

COMPLIANCE:
- Informed Consent: Key Information first. 8th-grade reading level.
- Recruitment: "Research" in subject line. No coercion.
`;

const RESEARCH_DOC_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    content: { type: Type.STRING, description: "The full document body in HTML format." },
    mentorNotes: { type: Type.STRING, description: "Explanation of choices and any assumptions made to fill in gaps." },
    complianceChecks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key requirements verified." }
  },
  required: ["title", "content", "mentorNotes", "complianceChecks"]
};

export const generateResearchDocument = async (
  docType: ResearchDocType, 
  context: string, 
  audience: string,
  fileData?: FileData | null
): Promise<ResearchDocumentResult> => {

  const promptText = `
    TASK: Create a ${docType.replace('_', ' ')}.
    
    DETAILS PROVIDED BY RESEARCHER:
    ${context}
    
    TARGET AUDIENCE:
    ${audience}
    
    INSTRUCTION:
    ${fileData ? "Use the ATTACHED DOCUMENT as the primary source of study facts. Use the Details Provided for specific focus." : "Use the Details Provided as the primary source."}
    
    Generate a complete, polished draft. Do not output a blank template. Write the actual content.
  `;

  let specificReqs = "";
  if (docType === 'informed_consent') {
    specificReqs = `
      REQUIREMENTS:
      - Follow Penn State HRP-590 Adult Consent structure.
      - Write the "Key Information" section using the provided Purpose and Risks details.
      - Write the "Procedures" section describing the activities provided.
      - Write the "Risks" section.
      - Write the "Benefits" section.
      - Ensure the reading level is appropriate (approx 8th grade).
    `;
  } else if (docType === 'survey') {
    specificReqs = `
      REQUIREMENTS:
      - Include a brief "Consent preamble" at the top (implied consent).
      - Group questions logically with headers (e.g., "Demographics", "Experience").
      - Ensure options are mutually exclusive and exhaustive.
    `;
  } else if (docType === 'interview_guide') {
    specificReqs = `
      REQUIREMENTS:
      - Introduction Script (Welcome, Recording permission).
      - Warm-up Questions.
      - Core Research Questions (Open-ended).
      - Probes/Follow-ups.
      - Debriefing/Closing Script.
    `;
  } else if (docType === 'recruitment_email') {
    specificReqs = `
      REQUIREMENTS:
      - Subject Line must be clear.
      - Salutation.
      - The "Hook" (Why participate?).
      - Eligibility Checklist.
      - Logistics (Time, Location, Payment).
      - Call to Action (Link or Reply).
      - Penn State affiliation signature.
    `;
  }

  const finalPrompt = promptText + specificReqs;

  try {
    const parts: any[] = [];
    
    if (fileData) {
        if (fileData.mimeType === 'application/pdf') {
            parts.push({ inlineData: { mimeType: 'application/pdf', data: fileData.data } });
        } else {
            parts.push({ text: `ATTACHED DOCUMENT CONTENT:\n${fileData.data}\n\n` });
        }
    }
    
    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: METHODOLOGIST_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESEARCH_DOC_SCHEMA
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as ResearchDocumentResult;
  } catch (error) {
    console.error("Mentor Generation Error:", error);
    throw new Error("The Methodologist is currently busy or had trouble reading the file. Please try again.");
  }
};

// -- Protocol Generation Schema --
const PROTOCOL_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    study_facts: { 
      type: Type.OBJECT, 
      properties: {
        protocolTitle: { type: Type.STRING },
        piName: { type: Type.STRING },
        piDepartment: { type: Type.STRING },
        clinicalTrialsId: { type: Type.STRING },
        objectives: { type: Type.STRING },
        scientificBackground: { type: Type.STRING },
        studyRationale: { type: Type.STRING },
        inclusionCriteria: { type: Type.STRING },
        exclusionCriteria: { type: Type.STRING },
        recruitmentHow: { type: Type.STRING },
        recruitmentWhere: { type: Type.STRING },
        recruitmentWhen: { type: Type.STRING },
        recruitmentMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
        screeningProcedures: { type: Type.STRING },
        studyDesign: { type: Type.STRING },
        proceduresVisit1: { type: Type.STRING },
        proceduresVisit2: { type: Type.STRING },
        risks: { type: Type.STRING },
        identifiers: { type: Type.ARRAY, items: { type: Type.STRING } },
        storageLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
        consentProcessDescription: { type: Type.STRING },
        consentCoercion: { type: Type.STRING },
        waiverAlterationDetails: { type: Type.STRING },
        references: { type: Type.STRING }
      },
      required: ["protocolTitle"]
    },
    protocol_outputs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          shape: { type: Type.STRING },
          paste_text: { type: Type.STRING },
          structured: { 
            type: Type.OBJECT, 
            properties: {
              selected_options: { type: Type.ARRAY, items: { type: Type.STRING } },
              table_rows: { type: Type.ARRAY, items: { type: Type.STRING } }
            } 
          },
          sources_used: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.NUMBER }
        },
        required: ["id", "label", "paste_text", "shape"]
      }
    },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    questions_to_confirm: { type: Type.ARRAY, items: { type: Type.STRING } },
    contradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
    quality_checks: {
      type: Type.OBJECT,
      properties: {
        prohibited_content_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
        consistency_warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
        format_violations_fixed: { type: Type.BOOLEAN }
      }
    },
    next_actions: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: {
          action: { type: Type.STRING },
          suggested_item_ids: { type: Type.ARRAY, items: { type: Type.STRING } }
        } 
      } 
    }
  },
  required: ["protocol_outputs", "study_facts"]
};

const PROTOCOL_SYSTEM_INSTRUCTION = `
You are “HRP-591 Protocol Copilot,” an assistant that helps draft Penn State HRP-591 protocol responses.

Your job is to:
1) Analyze the INPUT DATA (StudyFacts).
2) Generate a response for EVERY item listed in TARGET ITEMS.
3) **Section 20.0 References**: Output a simple, unnumbered list of citations found in the document. Do not include 'References' header in the content. Do NOT put the reference list in Section 2.1 Background.
4) Do NOT return an empty 'paste_text'. 

CRITICAL SECTION RULES:
A) **2.1 Scientific Background**: This section MUST be robust (multi_paragraph, 2-3 paragraphs). You MUST include plausible placeholder citations in (Author, Year) format within the text.
B) **4.2.x Recruitment**: Ensure 4.2.1 (How), 4.2.2 (Where), and 4.2.3 (When) are distinct.
C) **21.x Data**: Be precise about checkboxes for storage locations (REDCap, OneDrive).
D) **Lay Language**: Write for a non-expert reviewer. Avoid jargon.

OUTPUT SHAPES:
1) single_sentence
2) short_paragraph
3) multi_paragraph (Required for Background)
4) numbered_steps (Required for Procedures)
5) checkbox_selection (For 4.0, 5.1, 21.1, 21.4.3)
`;

export const generateProtocolContent = async (facts: StudyFacts): Promise<GeneratedProtocol> => {
  // Map our constants to target items
  const targetItems = HRP_591_SECTIONS.map(s => ({ id: s.id, label: s.title }));

  const prompt = `
    INPUT DATA:
    ${JSON.stringify(facts, null, 2)}

    REQUEST:
    Generate a Full HRP-591 Protocol Draft for the following target items.
    
    TARGET ITEMS:
    ${JSON.stringify(targetItems, null, 2)}
    
    Adhere strictly to the "HRP-591 Protocol Copilot" system instructions.
    Return valid JSON matching the defined schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: PROTOCOL_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: PROTOCOL_RESPONSE_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as GeneratedProtocol;
  } catch (error) {
    console.error("Gemini Protocol Error:", error);
    throw new Error("Failed to generate protocol content.");
  }
};

export const extractFromDocument = async (file: FileData): Promise<StudyFacts> => {
  const prompt = `
    Act as an Expert Research Coordinator. Extract study facts from the provided document to fill the HRP-591 Protocol Wizard.
    
    CRITICAL INSTRUCTIONS:
    1. **Infer and Draft**: If a section is not explicitly titled (e.g., "Recruitment"), you MUST INFER the likely procedure based on the study context.
       - Example: If the study mentions "surveying students", INFER that recruitment is likely via "Email/Listservs" or "Classroom Announcements" and draft a text for it.
       - Example: If "Objectives" is missing, look for "Specific Aims", "Goals", "Purpose", or "Hypotheses".
    2. **Populate All Fields**: Do not leave fields empty if you can reasonably draft a starting point based on the text.
    3. **Summarize**: Keep narrative sections concise (max 200 words).
    4. **References**: Extract bibliography into the 'references' key as a plain list.
    
    Keys to Extract:
    - protocolTitle
    - piName
    - piDepartment
    - clinicalTrialsId
    - objectives (Look for Aims/Goals)
    - scientificBackground (Summarize intro/background)
    - studyRationale (Why is this needed?)
    - inclusionCriteria (List inclusion)
    - exclusionCriteria (List exclusion)
    - vulnerablePopulations (Array: 'Children', 'Prisoners', etc.)
    - recruitmentMethods (Array: 'StudyFinder', 'Flyers/Posters', 'Email/Listservs', etc.)
    - recruitmentHow (Draft a plan based on methods)
    - recruitmentWhere (Draft locations)
    - recruitmentWhen (Draft timeline)
    - screeningProcedures (How are they screened?)
    - studyDesign (Cross-sectional, randomized, etc.)
    - proceduresVisit1 (What happens first?)
    - proceduresVisit2 (Follow up?)
    - duration (Time commitment)
    - sampleSize (N=?)
    - risks (Infer risks based on procedure, e.g. breach of confidentiality)
    - benefitsSubjects (Direct benefits?)
    - identifiers (Array: Names, Emails, etc.)
    - electronicRecords (boolean)
    - storageLocations (Array: REDCap, OneDrive, etc.)
    - recordings (Array: Audio, Video)
    - consentProcessType (Array: Written, Waiver, etc.)
    - consentProcessDescription (Draft the process)
    - consentCoercion (How to minimize pressure?)
    - references (Plain text list)
  `;

  // Schema matching StudyFacts
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      protocolTitle: { type: Type.STRING },
      piName: { type: Type.STRING },
      piDepartment: { type: Type.STRING },
      clinicalTrialsId: { type: Type.STRING },
      objectives: { type: Type.STRING },
      scientificBackground: { type: Type.STRING },
      studyRationale: { type: Type.STRING },
      inclusionCriteria: { type: Type.STRING },
      exclusionCriteria: { type: Type.STRING },
      vulnerablePopulations: { type: Type.ARRAY, items: { type: Type.STRING } },
      recruitmentMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
      recruitmentHow: { type: Type.STRING },
      recruitmentWhere: { type: Type.STRING },
      recruitmentWhen: { type: Type.STRING },
      screeningProcedures: { type: Type.STRING },
      studyDesign: { type: Type.STRING },
      proceduresVisit1: { type: Type.STRING },
      proceduresVisit2: { type: Type.STRING },
      duration: { type: Type.STRING },
      sampleSize: { type: Type.STRING },
      risks: { type: Type.STRING },
      benefitsSubjects: { type: Type.STRING },
      identifiers: { type: Type.ARRAY, items: { type: Type.STRING } },
      electronicRecords: { type: Type.BOOLEAN },
      storageLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
      recordings: { type: Type.ARRAY, items: { type: Type.STRING } },
      consentProcessType: { type: Type.ARRAY, items: { type: Type.STRING } },
      consentProcessDescription: { type: Type.STRING },
      consentCoercion: { type: Type.STRING },
      references: { type: Type.STRING }
    }
  };

  try {
    const parts: any[] = [];
    if (file.mimeType === 'application/pdf') {
        parts.push({ inlineData: { mimeType: 'application/pdf', data: file.data } });
        parts.push({ text: prompt });
    } else {
        parts.push({ text: `DOCUMENT CONTENT:\n${file.data}\n\n${prompt}` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        maxOutputTokens: 8192
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as StudyFacts;
  } catch (error) {
    console.error("Extraction Error:", error);
    throw new Error("Failed to extract study facts. The document might be too large or malformed.");
  }
};

export const extractSpecificScope = async (file: FileData, fieldsToExtract: string[]): Promise<Partial<StudyFacts>> => {
    // Dynamically build a schema for JUST the requested fields
    // This forces the model to focus and infer answers for these specific items
    
    // Inject options from WIZARD_STEPS to ensure AI picks valid choices for checkboxes/selects
    let optionHints = "";
    fieldsToExtract.forEach(fieldId => {
        for (const step of WIZARD_STEPS) {
            const field = step.fields.find(f => f.id === fieldId);
            if (field && field.options) {
                optionHints += `- ${fieldId}: Select from [${field.options.join(', ')}].\n`;
            }
        }
    });

    const properties: Record<string, any> = {};
    fieldsToExtract.forEach(field => {
        if (field.includes('Methods') || field.includes('Populations') || field.includes('identifiers') || field.includes('Locations') || field.includes('recordings') || field.includes('Type') || field.includes('Conditions')) {
            properties[field] = { type: Type.ARRAY, items: { type: Type.STRING } };
        } else if (field.startsWith('is') || field.includes('Records') || field.includes('Risk') || field.includes('Audit') || field.includes('Report') || field.includes('Research') || field.includes('transcription')) {
             properties[field] = { type: Type.BOOLEAN };
        } else {
            properties[field] = { type: Type.STRING };
        }
    });

    const dynamicSchema: Schema = {
        type: Type.OBJECT,
        properties: properties
    };

    const prompt = `
      Act as an expert IRB Analyst. Review the document and populate the following fields.
      
      FIELDS TO POPULATE: ${fieldsToExtract.join(', ')}.

      CONSTRAINTS FOR CHECKBOXES/SELECTS:
      ${optionHints}

      INSTRUCTION:
      - Look for explicit answers in the text.
      - **IF NOT FOUND**: Infer the most likely answer based on the study context (e.g. if study is online survey, 'recruitmentWhere' is 'Online').
      - For fields with constraints, ONLY return values from the provided lists.
      - Draft concise, academic responses for text fields.
    `;

    try {
        const parts: any[] = [];
        if (file.mimeType === 'application/pdf') {
            parts.push({ inlineData: { mimeType: 'application/pdf', data: file.data } });
            parts.push({ text: prompt });
        } else {
            parts.push({ text: `DOCUMENT CONTENT:\n${file.data}\n\n${prompt}` });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: dynamicSchema
            }
        });

        if (!response.text) throw new Error("No response");
        return JSON.parse(response.text) as Partial<StudyFacts>;
    } catch (e) {
        console.error("Scoped Extraction Failed", e);
        throw e;
    }
};

export const refineFieldContent = async (fieldLabel: string, currentValue: string, action: 'improve' | 'expand' | 'fix_grammar' | 'generate_from_scratch' | 'explain', context: string): Promise<string> => {
    let promptText = "";
    
    if (action === 'explain') {
        promptText = `Explain the requirements for HRP-591 Section: "${fieldLabel}" in 1 brief sentence.`;
    } else if (action === 'generate_from_scratch') {
        promptText = `Draft content for HRP-591 Section: "${fieldLabel}". 
        Context: "${context}".
        CONSTRAINT: Be concise. Maximum 1-2 sentences or 1-2 short paragraphs. Focus on the core requirements. If a list fits, use that.`;
    } else {
        promptText = `Refine this text for HRP-591 Section: "${fieldLabel}".
        Action: ${action}.
        Context: "${context}".
        
        Text: "${currentValue}"`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: promptText }] }
        });
        return response.text || currentValue;
    } catch (e) {
        console.error("Refine Error", e);
        return currentValue;
    }
};

export const refineArtifactSection = async (content: string, instruction: string): Promise<string> => {
  const prompt = `
    Refine the following HTML content based on the user's instruction.
    Maintain the HTML structure but update the text/logic.
    
    CONTENT:
    ${content}
    
    INSTRUCTION:
    ${instruction}
    
    Return only the updated HTML.
  `;

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview', 
          contents: prompt
      });
      return response.text || content;
  } catch (e) {
      console.error(e);
      return content;
  }
};

// ... (Assessment functions remain unchanged) ...
const SECTION_FEEDBACK_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER },
        status: { type: Type.STRING, enum: ['Strong', 'Adequate', 'Needs Improvement'] },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        rewriteSuggestion: { type: Type.STRING },
        rationale: { type: Type.STRING }
    }
};

const REVIEW_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.NUMBER },
        executiveSummary: { type: Type.STRING },
        sections: {
            type: Type.OBJECT,
            properties: {
                plan: SECTION_FEEDBACK_SCHEMA,
                results: SECTION_FEEDBACK_SCHEMA,
                closingLoop: SECTION_FEEDBACK_SCHEMA,
                future: SECTION_FEEDBACK_SCHEMA
            }
        }
    }
};

export const reviewAssessmentPlan = async (input: AssessmentPlanInput): Promise<AssessmentPlanReview> => {
  const prompt = `
    Review this Program Assessment Plan based on OPAIR best practices.
    
    PLAN DATA:
    ${JSON.stringify(input, null, 2)}
    
    Provide a score (0-100), an executive summary, and detailed feedback for each section.
  `;

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview', 
          contents: prompt,
          config: {
              responseMimeType: 'application/json',
              responseSchema: REVIEW_SCHEMA
          }
      });
      if (!response.text) throw new Error("No response");
      return JSON.parse(response.text) as AssessmentPlanReview;
  } catch (e) {
      console.error(e);
      throw new Error("Failed to review assessment plan");
  }
};

const PARSE_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        programName: { type: Type.STRING },
        learningObjective: { type: Type.STRING },
        curriculumAnchor: { type: Type.STRING },
        assessmentMethod: { type: Type.STRING },
        performanceTarget: { type: Type.STRING },
        findings: { type: Type.STRING },
        actionPlan: { type: Type.STRING },
        assessmentImpact: { type: Type.STRING },
        nextYearPlan: { type: Type.STRING },
    }
};

export const parseAssessmentDocument = async (file: FileData): Promise<AssessmentPlanInput> => {
    const prompt = `
      Extract Program Assessment Plan details. Map to fields: programName, learningObjective, curriculumAnchor, assessmentMethod, performanceTarget, findings, actionPlan, assessmentImpact, nextYearPlan.
    `;
    
    try {
        const parts: any[] = [];
        if (file.mimeType === 'application/pdf') {
             parts.push({ inlineData: { mimeType: 'application/pdf', data: file.data } });
             parts.push({ text: prompt });
        } else {
             parts.push({ text: `DOCUMENT CONTENT:\n${file.data}\n\n${prompt}` });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts },
            config: {
                responseMimeType: 'application/json',
                responseSchema: PARSE_SCHEMA
            }
        });
        if (!response.text) throw new Error("No response");
        return JSON.parse(response.text) as AssessmentPlanInput;
    } catch (e) {
        console.error(e);
        throw new Error("Failed to parse document");
    }
};
