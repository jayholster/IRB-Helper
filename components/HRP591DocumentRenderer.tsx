
import React from 'react';
import type { StudyFacts } from '../types';

interface Props {
  facts: StudyFacts;
  onClose: () => void;
}

const HRP591DocumentRenderer: React.FC<Props> = ({ facts, onClose }) => {
  
  // Helper to render the Gray Instructional Boxes
  const GrayBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-[#D9D9D9] border border-black/20 p-2 mb-4 text-sm font-sans text-black leading-snug print:bg-gray-200 break-inside-avoid">
      {children}
    </div>
  );

  // Helper for user input fields
  const InputText: React.FC<{ value?: string; placeholder?: string; alwaysShowPlaceholder?: boolean }> = ({ value, placeholder = "[Type protocol text here]", alwaysShowPlaceholder = false }) => (
    <div className="mb-6 font-serif text-black min-h-[1.5em] whitespace-pre-wrap break-words max-w-full">
      {value ? value : (
          alwaysShowPlaceholder 
            ? <span className="text-red-500 bg-red-50 print:hidden">{placeholder}</span>
            : "Not applicable"
      )}
    </div>
  );

  const NAInput: React.FC<{ value?: string }> = ({ value }) => (
    <InputText value={value} />
  );

  // Helper for Checkboxes
  const Checkbox: React.FC<{ checked: boolean; label: string; inline?: boolean }> = ({ checked, label, inline }) => (
    <div className={`flex items-start ${inline ? 'mr-6' : 'mb-2'}`}>
      <div className="w-4 h-4 border border-black flex items-center justify-center mr-2 flex-shrink-0 bg-white mt-0.5 print:border-black">
        {checked && <span className="text-black font-bold text-xs">X</span>}
      </div>
      <span className="font-serif text-black leading-snug">{label}</span>
    </div>
  );

  // Page Container
  const Page: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`w-[8.5in] min-h-[11in] mx-auto bg-white shadow-2xl mb-8 p-[1in] font-serif text-[11pt] text-black leading-normal relative print:shadow-none print:mb-0 print:w-full print:h-auto print:min-h-0 print:break-after-page print:p-0 page-break-after ${className}`}>
      {children}
      <div className="absolute bottom-8 left-0 right-0 text-center text-[9pt] text-gray-500 print:hidden">
         (IRB USE ONLY: V.11/01/2025) DO NOT ALTER OR DELETE
      </div>
    </div>
  );

  // --- Strict Mapping Logic for Section 21.1 Table ---
  const isIdentifierChecked = (pdfLabel: string): boolean => {
      const selected = (facts.identifiers || []).map(i => i.toLowerCase());
      const label = pdfLabel.toLowerCase();
      
      if (label.includes("names")) return selected.some(s => s.includes("names"));
      if (label.includes("geographic")) return selected.some(s => s.includes("geographic") || s.includes("address"));
      if (label.includes("elements of dates")) return selected.some(s => s.includes("dates"));
      if (label.includes("telephone")) return selected.some(s => s.includes("telephone"));
      if (label.includes("electronic mail")) return selected.some(s => s.includes("email"));
      if (label.includes("social security")) return selected.some(s => s.includes("social security"));
      if (label.includes("medical record")) return selected.some(s => s.includes("medical record"));
      if (label.includes("web universal")) return selected.some(s => s.includes("urls") || s.includes("web"));
      if (label.includes("internet protocol")) return selected.some(s => s.includes("ip address"));
      if (label.includes("biometric")) return selected.some(s => s.includes("biometric"));
      if (label.includes("full face")) return selected.some(s => s.includes("full face") || s.includes("photo"));
      if (label.includes("any other unique")) return selected.some(s => s.includes("audio") || s.includes("video"));

      return false;
  };

  const handleExportToWord = () => {
    const content = document.getElementById('hrp591-printable-area');
    if (!content) return;

    // Clone to manipulate for export without affecting display
    const clone = content.cloneNode(true) as HTMLElement;
    
    // Remove screen-only elements from clone (like footer placeholders if they are screen only)
    const hiddenElements = clone.querySelectorAll('.print\\:hidden');
    hiddenElements.forEach(el => el.remove());

    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>HRP-591 Protocol</title>
      <style>
        @page { size: 8.5in 11in; margin: 1in; }
        body { font-family: 'Times New Roman', serif; font-size: 11pt; }
        .page-break-after { page-break-after: always; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid black; padding: 4px; }
        .bg-[#D9D9D9] { background-color: #D9D9D9; border: 1px solid #ccc; padding: 8px; font-family: Arial, sans-serif; font-size: 10pt; }
        h1 { font-size: 14pt; text-transform: uppercase; text-align: center; }
        h2 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
        .flex { display: flex; }
        .justify-center { justify-content: center; }
        .items-center { align-items: center; }
        .font-bold { font-weight: bold; }
        .text-center { text-align: center; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
      </style>
    </head><body>`;
    
    const postHtml = `</body></html>`;
    const html = preHtml + clone.innerHTML + postHtml;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
    
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HRP-591_Protocol_${facts.protocolTitle ? facts.protocolTitle.substring(0,20) : 'Draft'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-800/90 overflow-y-auto flex justify-center py-10 backdrop-blur-sm print:bg-white print:p-0 print:block">
      
      {/* Floating Toolbar */}
      <div className="fixed top-4 right-8 flex gap-2 z-[110] print:hidden">
        <button 
            onClick={() => window.print()}
            className="bg-white text-slate-800 font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-slate-100 transition-colors flex items-center"
        >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print PDF
        </button>
        <button 
            onClick={handleExportToWord}
            className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center"
        >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download Word
        </button>
        <button 
            onClick={onClose}
            className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors"
        >
            Close Preview
        </button>
      </div>

      <style>{`
        @media print {
          @page { margin: 1in; size: letter; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .page-break-after { page-break-after: always; }
          .break-inside-avoid { break-inside: avoid; }
          .print-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9pt; color: gray; }
        }
      `}</style>

      <div className="hidden print:block print-footer">
         Page X of 30 (IRB USE ONLY: V.11/01/2025) DO NOT ALTER OR DELETE
      </div>

      <div className="print:w-full" id="hrp591-printable-area">
        
        {/* PAGE 1: Title Page */}
        <Page>
            <div className="flex items-center mb-8 pb-4">
                <img src="https://brand.psu.edu/images/backgrounds/horizontal-mark-registered-symbol.png" alt="Penn State" className="w-48 grayscale opacity-80" />
            </div>
            <h1 className="text-center font-bold text-xl mb-1 uppercase">HRP-591 - Protocol for</h1>
            <h1 className="text-center font-bold text-xl mb-8 uppercase">Human Subject Research</h1>

            <div className="mb-6">
                <strong className="block underline mb-1">Protocol Title:</strong>
                <GrayBox>Provide the full title of the study as listed in item 1 on the “Basic Information” page in CATS IRB (http://irb.psu.edu).</GrayBox>
                <InputText value={facts.protocolTitle} alwaysShowPlaceholder={true} />
            </div>

            <div className="mb-6">
                <strong className="block underline mb-1">Principal Investigator:</strong>
                <div className="font-serif ml-1">
                    Name: {facts.piName || '[Type text here]'}<br/>
                    Department: {facts.piDepartment || '[Type text here]'}<br/>
                    Telephone: {facts.piTelephone || '[Type text here]'}<br/>
                    E-mail Address: {facts.piEmail || '[Type text here]'}
                </div>
            </div>

            <div className="mb-6">
                <strong className="block underline mb-1">Version Date:</strong>
                <GrayBox>Provide a version date for this document...</GrayBox>
                <InputText value={new Date().toLocaleDateString()} />
            </div>

            <div className="mb-8">
                <strong className="block underline mb-1">Clinicaltrials.gov Registration #:</strong>
                <GrayBox>Provide the registration number for this study, if applicable...</GrayBox>
                <InputText value={facts.clinicalTrialsId === 'N/A' ? 'Not applicable' : facts.clinicalTrialsId} />
            </div>

            <div className="mb-4">
                <strong className="block underline mb-2">Important Instructions:</strong>
                <div className="text-sm">This template is provided to help investigators prepare a protocol...</div>
            </div>
            
            <div className="text-sm">
                <strong className="block mb-2">1. GENERAL INSTRUCTIONS:</strong>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Prior to completing this protocol, ensure that you are using the most recent version...</li>
                    <li>Do not change the protocol template version date...</li>
                    <li>If an item is not applicable, please indicate as such...</li>
                </ul>
            </div>
        </Page>

        {/* PAGE 2: Instructions Cont. */}
        <Page>
            <div className="space-y-6">
                <div>
                    <strong className="block mb-2 text-sm">2. CATS IRB LIBRARY:</strong>
                    <ul className="list-disc pl-5 text-sm">
                        <li>Documents referenced in this protocol template can be accessed by clicking the Library link...</li>
                    </ul>
                </div>
                <div>
                    <strong className="block mb-2 text-sm">3. PROTOCOL REVISIONS:</strong>
                    <ul className="list-disc pl-5 text-sm">
                        <li>When making revisions, please follow the instructions outlined in the guides...</li>
                        <li>Update the Version Date on page 1 each time...</li>
                    </ul>
                </div>
                <div className="text-sm pt-4">
                    <p className="font-bold">If you need help:</p>
                    <p className="font-bold">Human Research Protection Program</p>
                    <p>Phone: 814-865-1775</p>
                    <p>Email: irb-orp@psu.edu</p>
                </div>
            </div>
        </Page>

        {/* PAGE 3: TOC */}
        <Page>
            <strong className="block mb-4 text-lg">Table of Contents</strong>
            <ul className="list-none space-y-2 pl-0 font-bold text-sm">
                <li>1.0 Objectives</li>
                <li>2.0 Background</li>
                <li>3.0 Inclusion and Exclusion Criteria</li>
                <li>4.0 Recruitment Methods</li>
                <li>5.0 Consent Process and Documentation</li>
                <li>6.0 HIPAA Research Authorization</li>
                <li>7.0 Study Design and Procedures</li>
                <li>8.0 Number of Subjects and Statistical Plan</li>
                <li>9.0 Data and Safety Monitoring Plan</li>
                <li>10.0 Risks</li>
                <li>11.0 Potential Benefits to Subjects and Others</li>
                <li>12.0 Sharing Results with Subjects</li>
                <li>13.0 Subject Payment and/or Travel Reimbursements</li>
                <li>14.0 Economic Burden to Subjects</li>
                <li>15.0 Resources Available</li>
                <li>16.0 Other Approvals</li>
                <li>17.0 Multi-Site Study</li>
                <li>18.0 Adverse Event Reporting</li>
                <li>19.0 Study Monitoring, Auditing, and Inspecting</li>
                <li>20.0 References</li>
                <li>21.0 Confidentiality, Privacy and Data Management</li>
                <li>22.0 Identifiable Data and Specimen Banking for Future Undetermined Research</li>
            </ul>
        </Page>

        {/* PAGE 4+: Content Sections */}
        <Page className="print:block">
            {/* 1.0 Objectives */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">1.0 Objectives</h2>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">1.1 Study Objectives</strong>
                    <GrayBox>Describe the purpose, specific aims, or objectives...</GrayBox>
                    <InputText value={facts.objectives} alwaysShowPlaceholder={true} />
                </div>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">1.2 Primary Study Endpoints</strong>
                    <GrayBox>State the primary endpoints to be measured...</GrayBox>
                    <NAInput value={facts.primaryEndpoints} />
                </div>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">1.3 Secondary Study Endpoints</strong>
                    <GrayBox>State the secondary endpoints...</GrayBox>
                    <NAInput value={facts.secondaryEndpoints} />
                </div>
            </div>

            {/* 2.0 Background */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">2.0 Background</h2>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">2.1 Scientific Background and Gaps</strong>
                    <GrayBox>Briefly describe the scientific background...</GrayBox>
                    <InputText value={facts.scientificBackground} />
                </div>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">2.2 Previous Data</strong>
                    <GrayBox>Describe any relevant preliminary data.</GrayBox>
                    <NAInput value={facts.previousData} />
                </div>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">2.3 Study Rationale</strong>
                    <GrayBox>Provide the scientific rationale for the research.</GrayBox>
                    <InputText value={facts.studyRationale} />
                </div>
            </div>

            {/* 3.0 Inclusion */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">3.0 Inclusion and Exclusion Criteria</h2>
                <GrayBox>Create a numbered list below in sections 3.1 and 3.2...</GrayBox>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">3.1 Inclusion Criteria</strong>
                    <GrayBox>Create a numbered list of the inclusion criteria...</GrayBox>
                    <InputText value={facts.inclusionCriteria} />
                </div>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">3.1.1 Does this research involve collecting data from individuals residing outside of the US?</strong>
                    <Checkbox checked={!facts.internationalResearch} label="No" />
                    <Checkbox checked={facts.internationalResearch} label="Yes – identify the countries where data collection will take place" />
                    {facts.internationalResearch && <InputText value={facts.internationalCountries} />}
                </div>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">3.2 Exclusion Criteria</strong>
                    <GrayBox>Create a numbered list of the exclusion criteria...</GrayBox>
                    <InputText value={facts.exclusionCriteria} />
                </div>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">3.3 Early Withdrawal of Subjects</strong>
                    <div className="pl-4 mt-2">
                        <strong className="block mb-1">3.3.1 Criteria for removal from study</strong>
                        <GrayBox>Insert subject withdrawal criteria...</GrayBox>
                        <NAInput value={facts.withdrawalCriteria} />

                        <strong className="block mb-1 mt-4">3.3.2 Follow-up for withdrawn subjects</strong>
                        <GrayBox>Describe when and how to withdraw subjects...</GrayBox>
                        <NAInput value={facts.withdrawalFollowUp} />
                    </div>
                </div>
            </div>

            {/* 4.0 Recruitment */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">4.0 Recruitment Methods</h2>
                <GrayBox>• Upload recruitment materials for your study in CATS IRB...</GrayBox>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">4.1 Identification of subjects</strong>
                    <GrayBox>Describe the source of subjects...</GrayBox>
                    <InputText value={facts.recruitmentIdentification} />
                </div>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">4.2 Recruitment process</strong>
                    <GrayBox>Describe how potential subjects first learn about this research...</GrayBox>
                    <NAInput value={facts.recruitmentProcessNarrative} />

                    <div className="pl-4 mt-4">
                        <strong className="block mb-1">4.2.1 How potential subjects will be recruited</strong>
                        <NAInput value={facts.recruitmentHow} />

                        <strong className="block mb-1">4.2.2 Where potential subjects will be recruited</strong>
                        <NAInput value={facts.recruitmentWhere} />

                        <strong className="block mb-1">4.2.3 When potential subjects will be recruited</strong>
                        <NAInput value={facts.recruitmentWhen} />

                        <strong className="block mb-1">4.2.4 Screening and determining eligibility</strong>
                        <GrayBox>Screening involves assessing whether or not a potential subject is eligible...</GrayBox>
                        
                        <div className="mb-4">
                            <strong className="block mb-1 text-sm">4.2.4.1 For the purpose of screening/determining eligibility, is the potential subject providing information through oral or written communication?</strong>
                            <Checkbox checked={facts.screeningOralWritten} label="Yes" />
                            {facts.screeningOralWritten && <InputText value={facts.screeningOralWrittenDesc} />}
                            <Checkbox checked={!facts.screeningOralWritten} label="No" />
                        </div>

                        <div className="mb-4">
                            <strong className="block mb-1 text-sm">4.2.4.2 Is eligibility being determined by obtaining identifiable private information?</strong>
                            <Checkbox checked={facts.screeningRecords} label="Yes" />
                            {facts.screeningRecords && <InputText value={facts.screeningRecordsDesc} />}
                            <Checkbox checked={!facts.screeningRecords} label="No" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 5.0 Consent */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">5.0 Consent Process and Documentation</h2>
                <GrayBox>Refer to HRP-090 and HRP-091...</GrayBox>
                
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">5.1 Consent Process:</strong>
                    <GrayBox>Check all applicable boxes below:</GrayBox>
                    <div className="space-y-1">
                        <Checkbox 
                            checked={facts.consentProcessType?.includes('Written Documentation (Signed Form)')} 
                            label="Written documentation of consent: Informed consent will be sought and documented with a written consent form [Complete Sections 5.2 and 5.6]" 
                        />
                        <Checkbox 
                            checked={facts.consentProcessType?.includes('Waiver of Documentation (Verbal/Implied)')} 
                            label="Waiver of documentation of consent: Informed consent will be sought but subject signature is not required [Complete Sections 5.2, 5.3 and 5.6]" 
                        />
                        <Checkbox 
                            checked={facts.consentProcessType?.includes('Alteration of Consent')} 
                            label="Alteration of consent process [Complete section 5.2, 5.4 and 5.6]" 
                        />
                        <Checkbox 
                            checked={facts.consentProcessType?.includes('Waiver of Consent')} 
                            label="Waiver of consent [Complete Section 5.5]" 
                        />
                    </div>
                </div>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">5.2 Obtaining Informed Consent</strong>
                    <div className="pl-4">
                        <strong className="block mb-1">5.2.1 Consent Process</strong>
                        <GrayBox>Describe the consent process...</GrayBox>
                        <InputText value={facts.consentProcessDescription} />

                        <strong className="block mb-1 mt-4">5.2.2 Coercion or Undue Influence during Consent</strong>
                        <GrayBox>Describe the steps that will be taken to minimize the possibility of coercion...</GrayBox>
                        <InputText value={facts.consentCoercion} />
                    </div>
                </div>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">5.3 Waiver of Written Documentation of Consent</strong>
                    <GrayBox>Review “HRP – 411 – Checklist”...</GrayBox>
                    <NAInput value={facts.waiverDocMaterials} />
                </div>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">5.4 Alteration of consent</strong>
                    <GrayBox>Review “HRP-410-Checklist”...</GrayBox>
                    <NAInput value={facts.waiverAlterationDetails} />
                </div>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">5.5 Waiver of consent</strong>
                    <GrayBox>Review “HRP-410-Checklist”...</GrayBox>
                    <NAInput value={facts.waiverAlterationDetails} />
                </div>
            </div>

            {/* 6.0 HIPAA */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">6.0 HIPAA Research Authorization</h2>
                <GrayBox>This section is about the access, use or disclosure of Protected Health Information (PHI)...</GrayBox>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">6.1 Authorization and/or Waiver or Alteration</strong>
                    <GrayBox>Check all that apply:</GrayBox>
                    <div className="space-y-1">
                        <Checkbox checked={facts.hipaaAuthorization?.includes('Not Applicable')} label="Not applicable, no identifiable protected health information (PHI) is accessed..." />
                        <Checkbox checked={facts.hipaaAuthorization?.includes('Signed Authorization')} label="Signed authorization will be obtained and documented." />
                        <Checkbox checked={facts.hipaaAuthorization?.includes('Partial Waiver (Recruitment)')} label="Partial waiver for recruitment purposes only..." />
                        <Checkbox checked={facts.hipaaAuthorization?.includes('Full Waiver')} label="Full waiver for entire research study..." />
                        <Checkbox checked={facts.hipaaAuthorization?.includes('Alteration (Verbal)')} label="Alteration to waive requirement for written documentation..." />
                    </div>
                </div>

                <div className="pl-6 mb-4">
                    <strong className="block mb-1">6.2 Waiver or Alteration Details</strong>
                    <GrayBox>This section is about the disclosure of PHI...</GrayBox>
                    <NAInput value={facts.hipaaWaiverDetails} />
                </div>
            </div>

            {/* 7.0 Study Design */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">7.0 Study Design and Procedures</h2>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">7.1 Study Design</strong>
                    <GrayBox>Describe and explain the study design.</GrayBox>
                    <InputText value={facts.studyDesign} />
                </div>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">7.2 Study Procedures</strong>
                    <GrayBox>Provide a step-by-step description...</GrayBox>
                    <InputText value={facts.proceduresNarrative} />
                    <div className="pl-4 mt-4">
                        <strong className="block mb-1">7.2.1 Visit 1</strong>
                        <InputText value={facts.proceduresVisit1} />
                        <strong className="block mb-1 mt-4">7.2.2 Visit 2 (If applicable)</strong>
                        <NAInput value={facts.proceduresVisit2} />
                    </div>
                </div>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">7.3 Duration of Participation</strong>
                    <GrayBox>Describe how long subjects will be involved...</GrayBox>
                    <InputText value={facts.duration} />
                </div>
            </div>

            {/* 8.0 Stats */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">8.0 Number of Subjects and Statistical Plan</h2>
                <div className="pl-6">
                    <strong className="block mb-1">8.1 Number of Subjects</strong>
                    <GrayBox>Indicate the maximum number of subjects to be accrued...</GrayBox>
                    <InputText value={facts.sampleSize} />

                    <strong className="block mb-1">8.2 Sample Size Determination</strong>
                    <NAInput value={facts.sampleSizeJustification} />

                    <strong className="block mb-1">8.3 Statistical or Analytic Methods</strong>
                    <InputText value={facts.statisticalMethods} />
                </div>
            </div>

            {/* 9.0 DSM */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">9.0 Data and Safety Monitoring Plan</h2>
                <GrayBox>This section is required when research involves more than Minimal Risk to subjects.</GrayBox>
                <div className="pl-6 mb-4">
                    <strong className="block mb-1">9.1 Periodic evaluation of data</strong>
                    <NAInput value={facts.dsmPlanPeriodicEval} />
                    <strong className="block mb-1">9.2 Data that are reviewed</strong>
                    <NAInput value={facts.dsmPlanDataReviewed} />
                    <strong className="block mb-1">9.3 Method of collection of safety information</strong>
                    <NAInput value={facts.dsmPlanCollectionMethod} />
                </div>
            </div>

            {/* 10.0 Risks */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">10.0 Risks</h2>
                <GrayBox>List the reasonably foreseeable risks, discomforts, hazards, or inconveniences...</GrayBox>
                <InputText value={facts.risks} />
            </div>

            {/* 11.0 Benefits */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">11.0 Potential Benefits to Subjects and Others</h2>
                <div className="pl-6">
                    <strong className="block mb-1">11.1 Potential Benefits to Subjects</strong>
                    <GrayBox>Describe the potential benefits that individual subjects may experience...</GrayBox>
                    <InputText value={facts.benefitsSubjects} />

                    <strong className="block mb-1">11.2 Potential Benefits to Others</strong>
                    <NAInput value={facts.benefitsOthers} />
                </div>
            </div>

            {/* 12.0 Sharing Results */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">12.0 Sharing Results with Subjects</h2>
                <GrayBox>Describe whether results will be shared...</GrayBox>
                <NAInput value={facts.sharingResults} />
            </div>

            {/* 13.0 Payment */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">13.0 Subject Payment and/or Travel Reimbursements</h2>
                <GrayBox>Describe the amount, type, reason/purpose, and timing of any subject payment...</GrayBox>
                <NAInput value={facts.compensation} />
            </div>

            {/* 14.0 Costs */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">14.0 Economic Burden to Subjects</h2>
                <div className="pl-6">
                    <strong className="block mb-1">14.1 Costs</strong>
                    <GrayBox>Describe any costs that subjects may be responsible for...</GrayBox>
                    <NAInput value={facts.costs} />

                    <strong className="block mb-1">14.2 Compensation for research-related injury</strong>
                    <GrayBox>If the research involves more than Minimal Risk...</GrayBox>
                    <NAInput value={facts.injuryCompensation} />
                </div>
            </div>

            {/* 15.0 Resources */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">15.0 Resources Available</h2>
                <div className="pl-6">
                    <strong className="block mb-1">15.1 Facilities and locations</strong>
                    <InputText value={facts.facilities} />
                    <strong className="block mb-1">15.2 Feasibility of recruiting the required number of subjects</strong>
                    <InputText value={facts.recruitmentFeasibility} />
                    <strong className="block mb-1">15.3 PI Time devoted to conducting the research</strong>
                    <InputText value={facts.piTime} />
                    <strong className="block mb-1">15.4 Availability of medical or psychological resources</strong>
                    <NAInput value={facts.medicalResources} />
                    <strong className="block mb-1">15.5 Process for informing Study Team</strong>
                    <InputText value={facts.teamTraining} />
                </div>
            </div>

            {/* 16.0 Approvals */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">16.0 Other Approvals</h2>
                <div className="pl-6">
                    <strong className="block mb-1">16.1 Other Approvals from External Entities</strong>
                    <NAInput value={facts.externalApprovals} />
                    <strong className="block mb-1">16.2 Internal PSU Ancillary Reviews</strong>
                    <p className="mb-4 text-sm">DO NOT ALTER OR DELETE: Ancillary reviews are reviewed by other compliance groups...</p>
                </div>
            </div>

            {/* 17.0 Multi-Site */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">17.0 Multi-Site Study</h2>
                <div className="pl-6">
                    <strong className="block mb-1">17.1 Other sites</strong>
                    <NAInput value={facts.multiSiteDetails} />
                    <strong className="block mb-1">17.2 Communication Plans</strong>
                    <NAInput value={facts.multiSiteDetails} />
                </div>
            </div>

            {/* 18.0 Adverse Events */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">18.0 Adverse Event Reporting</h2>
                <div className="pl-6">
                    <strong className="block mb-1">18.1 Reporting Adverse Reactions...</strong>
                    <p className="mb-4 text-sm italic">In accordance with applicable policies...</p>
                </div>
            </div>

            {/* 19.0 Monitoring */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">19.0 Study Monitoring, Auditing, and Inspecting</h2>
                <div className="pl-6">
                    <strong className="block mb-1">19.1 Auditing and Inspecting</strong>
                    <p className="mb-4 text-sm italic">The investigator will permit study-related monitoring...</p>
                </div>
            </div>

            {/* 20.0 References */}
            <div className="mb-8 break-inside-avoid">
                <h2 className="font-bold text-lg mb-2">20.0 References</h2>
                <GrayBox>List relevant references...</GrayBox>
                <NAInput value={facts.references} />
            </div>

            {/* 21.0 Data Management */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">21.0 Confidentiality, Privacy and Data Management</h2>
                <div className="pl-6">
                    <p className="text-xs mb-4">Please visit https://datastoragefinder.psu.edu...</p>
                    <strong className="block mb-1">21.1 Which of the following identifiers will be recorded for the research project?</strong>
                    <GrayBox>Check all that apply.</GrayBox>
                    <table className="w-full border-collapse border border-black text-sm font-serif mb-6 break-inside-avoid">
                        <thead>
                            <tr>
                                <th className="border border-black p-1 text-left w-2/3">Identifier</th>
                                <th className="border border-black p-1 text-center w-24">Hard Copy Data</th>
                                <th className="border border-black p-1 text-center w-24">Electronic Stored Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                'Names and/or initials (including on signed consent documents)',
                                'All geographic subdivisions smaller than a State...',
                                'All elements of dates (except year) for dates directly related...',
                                'Telephone numbers',
                                'Fax numbers',
                                'Electronic mail addresses',
                                'Social security numbers',
                                'Medical record numbers',
                                'Health plan beneficiary numbers',
                                'Account numbers',
                                'Certificate/license numbers',
                                'Vehicle identifiers and serial numbers...',
                                'Device identifiers and serial numbers',
                                'Web Universal Resource Locators (URLs)',
                                'Internet Protocol (IP) address numbers',
                                'Biometric identifiers, including finger and voice prints',
                                'Full face photographic images and any comparable images',
                                'Any other unique identifying number, characteristic, or code...',
                            ].map(pdfLabel => {
                                const isChecked = isIdentifierChecked(pdfLabel);
                                return (
                                    <tr key={pdfLabel}>
                                        <td className="border border-black p-1">{pdfLabel}</td>
                                        <td className="border border-black p-1 text-center font-bold">{isChecked && facts.paperRecords ? "X" : ""}</td>
                                        <td className="border border-black p-1 text-center font-bold">{isChecked && facts.electronicRecords ? "X" : ""}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <strong className="block mb-1">21.2 Are the identifiers above linked to research data?</strong>
                    <Checkbox checked={!facts.identifiersLinked} label="No – skip to 21.3" />
                    <Checkbox checked={facts.identifiersLinked} label="Yes – complete 21.2.1" />
                    {facts.identifiersLinked && (
                        <div className="pl-4 mt-2">
                            <strong className="block mb-1">21.2.1 Explain how the list that links the code to identifiers is stored...</strong>
                            <InputText value={facts.identifiersLinkDetails} />
                        </div>
                    )}

                    <strong className="block mb-1 mt-4">21.3 Are paper records of research data being collected or stored:</strong>
                    <Checkbox checked={!facts.paperRecords} label="No – skip to 21.4" />
                    <Checkbox checked={facts.paperRecords} label="Yes – complete 21.3.1 and 21.3.2" />
                    {facts.paperRecords && (
                        <div className="pl-4 mt-2">
                            <strong className="block mb-1">21.3.1 Where will the paper records be securely stored?</strong>
                            <InputText value={facts.paperRecordsLocation} />
                            <strong className="block mb-1">21.3.2 Will everyone on the study team have access?</strong>
                            <Checkbox checked={facts.paperRecordsAccess} label="Yes" />
                            <Checkbox checked={!facts.paperRecordsAccess} label="No" />
                        </div>
                    )}

                    <strong className="block mb-1 mt-4">21.4 Are electronic records of research data being collected or stored?</strong>
                    <Checkbox checked={!facts.electronicRecords} label="No – skip to 21.5" />
                    <Checkbox checked={facts.electronicRecords} label="Yes – Complete rest of 21.4" />
                    {facts.electronicRecords && (
                        <div className="pl-4 mt-2">
                            <strong className="block mb-1">21.4.1 How is the data being collected?</strong>
                            <InputText value={facts.electronicCollectionMethod} />
                            <strong className="block mb-1">21.4.3 Indicate where the electronic data... will be stored</strong>
                            <div className="space-y-1 mb-4">
                                <Checkbox checked={facts.storageLocations?.includes('Penn State REDCap')} label="Penn State REDCap" />
                                <Checkbox checked={facts.storageLocations?.includes('Penn State Qualtrics')} label="Penn State Qualtrics" />
                                <Checkbox checked={facts.storageLocations?.includes('Penn State OneDrive/SharePoint')} label="Penn State, College, or Department IT managed file server, OneDrive, or SharePoint" />
                                <Checkbox checked={facts.storageLocations?.includes('Penn State GoogleDrive')} label="Penn State GoogleDrive" />
                                <Checkbox checked={facts.storageLocations?.includes('Other')} label="Other – Specify:" />
                                {facts.storageLocations?.includes('Other') && <InputText value={facts.storageOther} />}
                            </div>
                        </div>
                    )}

                    <strong className="block mb-1 mt-4">21.5 Will any type of recordings... be made during this study?</strong>
                    <Checkbox checked={!facts.recordings || facts.recordings.length === 0 || facts.recordings.includes('None')} label="No – skip to 21.6" />
                    <Checkbox checked={facts.recordings?.includes('Live Stream (No Recording)')} label="Yes – Live video chat ONLY without recording." />
                    <Checkbox checked={facts.recordings?.some(r => ['Audio', 'Video', 'Photographs'].includes(r))} label="Yes – Recording (audio, video, photographs)" />
                    
                    {facts.recordings?.some(r => ['Audio', 'Video', 'Photographs'].includes(r)) && (
                        <div className="pl-4 mt-2">
                            <strong className="block mb-1 mt-2">21.5.1 Select the video chat platform:</strong>
                            <Checkbox checked={facts.recordingVideoPlatform?.includes('Teams')} label="PSH HIPAA Compliant Teams" />
                            <Checkbox checked={facts.recordingVideoPlatform?.includes('Zoom')} label="PSU Zoom" />
                            
                            <strong className="block mb-1 mt-2">21.5.2 Select the type of recording...</strong>
                            <Checkbox checked={facts.recordings?.includes('Audio')} label="Audio – Describe what will be used to capture the audio:" />
                            {facts.recordings?.includes('Audio') && <InputText value={facts.recordingDetails} />}
                            
                            <Checkbox checked={facts.recordings?.includes('Video')} label="Video – Describe what will be used to capture the video:" />
                            {facts.recordings?.includes('Video') && <InputText value={facts.recordingDetails} />}
                        </div>
                    )}
                </div>
            </div>

            {/* 22.0 Banking */}
            <div className="mb-8">
                <h2 className="font-bold text-lg mb-2">22.0 Identifiable Data and Specimen Banking for Future Undetermined Research</h2>
                <div className="pl-6">
                    <strong className="block mb-1">22.1 Data and/or specimens being stored</strong>
                    <NAInput value={facts.bankingDetails} />
                    <strong className="block mb-1">22.2 Location of storage</strong>
                    <NAInput value={facts.bankingDetails} />
                    <strong className="block mb-1">22.3 Duration of storage</strong>
                    <NAInput value={facts.bankingDetails} />
                    <strong className="block mb-1">22.4 Access to data and/or specimens</strong>
                    <NAInput value={facts.bankingDetails} />
                </div>
            </div>
        </Page>
      </div>
    </div>
  );
};

export default HRP591DocumentRenderer;
