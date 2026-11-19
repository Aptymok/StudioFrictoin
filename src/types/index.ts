/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SFI CREATIVE COMPANION — Type Definitions
 * Herramienta complementaria e independiente para System Friction Institute.
 * Enforces strict epistemological integrity and separates:
 * OBJETIVO | HIPÓTESIS | SIMULACIÓN | RESULTADO OBSERVADO
 */

export type EpistemicStatusType =
  | 'OBJETIVO'
  | 'HIPOTESIS'
  | 'SIMULACION'
  | 'RESULTADO_OBSERVADO';

export type EpistemicCategory =
  | 'hecho_observado'
  | 'decision_documentada'
  | 'inferencia'
  | 'hipotesis'
  | 'reconstruccion_creativa'
  | 'ausencia_de_evidencia';

export type CertaintyLevel =
  | 'simulacion_teorica_demo'
  | 'propuesta_creativa_demo'
  | 'vacio_critico_declarado'
  | 'inferencia_no_verificada'
  | 'alta_verificada_sfi'; // Only permitted if authenticated by SFI canonical signature

export type InstitutionalVerification =
  | 'DEMO_SYNTHETIC'
  | 'unverified_pending'
  | 'canonical_sfi_verified'; // Strictly blocked for any synthetic demo item

export interface VerifiableSource {
  id: string;
  title: string;
  archiveReference: string;
  year: number;
  custodian: string;
  institutionalVerification: InstitutionalVerification;
  provenance: 'DEMO_SYNTHETIC' | 'SFI_CANONICAL_ENVELOPE';
  sourceQuote?: string;
  epistemicNature: EpistemicStatusType;
  accessStatus: 'simulacion_demo' | 'restringido_autorizado' | 'copia_digital_verificada';
}

export interface AuthorizedMedia {
  id: string;
  title: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  rightsDeclared: string; // Must NOT self-attribute automatic copyright/public domain
  provenance: 'DEMO_SYNTHETIC';
  timestamp: string;
  isDemoSynthetic: boolean;
  notes?: string;
  epistemicNature: EpistemicStatusType;
}

export interface EpistemicTimelineEvent {
  id: string;
  year: string;
  exactDate?: string;
  title: string;
  description: string;
  epistemicCategory: EpistemicCategory;
  epistemicNature: EpistemicStatusType;
  provenance: 'DEMO_SYNTHETIC';
  isCreativeRecreation: boolean;
  transitionOrIdentityShift?: string;
  contradictoryNote?: string;
  primarySources: string[];
  certaintyLevel: CertaintyLevel;
}

export type PlatformFormat = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin' | 'web';

export interface PlatformSpec {
  aspectRatio: string;
  formatName: string;
  dimensions: string;
  technicalNote: string;
  cropFocus: string;
}

export interface VisualAssetProposal {
  id: string;
  title: string;
  sourceAssetId?: string;
  provenanceRecord: 'DEMO_SYNTHETIC';
  isDemoSynthetic: boolean;
  status: 'propuesta_conceptual_demo' | 'activo_sintetico_renderizado';
  rightsWarning: string;
  imageUrl: string;
  caption: string;
  editablePrompt?: string;
  technicalSpecs: {
    aspect: string;
    lighting: string;
    palette: string;
    optics: string;
  };
  visualType: 'fotografia_simulada' | 'micrografia_simulada' | 'reconstruccion_3d' | 'concepto_artistico' | 'storyboard' | 'infografia' | 'miniatura' | 'carrusel';
  platformAdaptations: Record<PlatformFormat, PlatformSpec>;
  preferredSelection?: boolean;
  preferenceRationale?: string;
  preferenceEpistemicNature?: EpistemicStatusType;
}

export interface AudiovisualScene {
  id: string;
  sceneNumber: number;
  shotNumber: number;
  shotType: string;
  durationSeconds: number;
  visualDescription: string;
  audioVoiceover: string;
  authorizedAudioCue: string;
  rightsAndProvenance: string;
  provenance: 'DEMO_SYNTHETIC';
  isDemoSynthetic: boolean;
  subtitleText: string;
  formatHorizontalPrompt: string;
  formatVerticalPrompt: string;
  externalRenderInstructions: {
    cameraMotion: string;
    colorGradeLUT: string;
    targetBitrate: string;
    promptText: string;
  };
}

export interface FadRecommendationViewer {
  hasReceivedFadData: boolean; // Must remain false until genuine SFI verified reception
  receptionTimestamp?: string;
  canonicalReportReference?: string;
  frictionIndexObserved?: string;
  advisoriesReceived: string[];
  systemDisclaimer: string;
  simulationMockOnly?: boolean;
}

export interface CampaignCycle {
  id: string;
  title: string;
  cycleType: '15_dias' | '90_dias';
  hypothesis: string; // Marked as HIPÓTESIS
  targetAudience: string;
  channel: string;
  format: string;
  requiredMaterial: string[];
  observableIndicator: string; // Target observable outcome, explicitly marked as OBJETIVO DE MEDICIÓN
  necessaryEvidence: string;
  identifiedRisks: string[];
  decisionCriteria: {
    maintain: string;
    modify: string;
    halt: string;
  };
  schedule: Array<{
    periodLabel: string;
    focus: string;
    actionableGate: string;
  }>;
}

export interface VersionComparisonData {
  id: string;
  title: string;
  focusArea: string;
  versionA: {
    label: string;
    tag: string;
    description: string;
    imageUrl: string;
    hypothesis: string; // HIPÓTESIS
    creativeApproach: string;
  };
  versionB: {
    label: string;
    tag: string;
    description: string;
    imageUrl: string;
    hypothesis: string; // HIPÓTESIS
    creativeApproach: string;
  };
  maintainedElements: string[];
  changedElements: string[];
  evidenceDrivingChange: string;
  expectedValidation: string; // OBJETIVO
  falsificationCriteria: string; // CRITERIO DE FALSACIÓN
  recordedPreference?: 'version_a' | 'version_b' | 'reiterar';
  preferenceRationale?: string;
  updatedAt?: string;
}

export interface ValidationIssue {
  severity: 'CRITICAL_BLOCKER' | 'WARNING';
  code: string;
  message: string;
  targetId?: string;
}

export interface EpistemicValidationReport {
  isValidForReviewExport: boolean;
  canExportAsCanonicalEvidence: boolean; // Always false for Creative Companion
  issues: ValidationIssue[];
  totalSyntheticItems: number;
  syntheticSourcesCount: number;
  syntheticMediaCount: number;
  hasAttemptedCanonicalPromotion: boolean;
  hasFadClaimWithoutVerification: boolean;
  validatedAt: string;
}

export interface SfiWorkPackage {
  packageId: string;
  originProjectId: string;
  projectCode: string;
  materialType: string;
  versionTag: string;
  generatedAt: string;
  epistemicNatureDeclaration: 'PROPUESTA_CREATIVA_SINTETICA';
  provenanceSummary: 'DEMO_SYNTHETIC';
  filesAvailable: Array<{
    filename: string;
    format: string;
    sizeOrDuration: string;
    integrityRef: string;
    category: string;
    isDemoSynthetic: boolean;
    provenance: 'DEMO_SYNTHETIC';
    rightsDisclaimer: string;
  }>;
  originReferences: Array<{
    refCode: string;
    archiveTitle: string;
    verificationStatus: InstitutionalVerification;
    provenance: 'DEMO_SYNTHETIC' | 'SFI_CANONICAL_ENVELOPE';
  }>;
  rightsDeclaration: string;
  transformationsPerformed: string[];
  epistemicWarningsAndLimits: string[];
  fadNotice: string;
  formalStatus: 'BORRADOR DE PROPUESTA CREATIVA (NO EVIDENCIA)';
  nonCanonicalClause: string;
  validationReport: EpistemicValidationReport;
}

export interface AudioWaveformSegment {
  id: string;
  audioFileName: string;
  startTime: number;
  endTime: number;
  linkedSceneId: string;
  annotation: string;
  provenance: 'DEMO_SYNTHETIC';
  isDemoSynthetic: boolean;
  createdAt: string;
}

export interface WorldSpectrumAxis {
  key: string;
  label: string;
  hypothesisVal: number;
  observedVal: number;
  referenceVal: number;
  targetVal: number;
  unit: string;
}

export interface MusicChannelConfig {
  id: string;
  name: string;
  instrument: string;
  frequencyHz: number;
  pan: number;
  gain: number;
  muted: boolean;
  solo: boolean;
}

export interface ProjectData {
  id: string;
  name: string;
  code: string;
  objective: string;
  isDemo: boolean;
  visualIdentity: {
    palette: string[];
    typographyGuidelines: string;
    stylisticTone: string;
  };
  historicalSummary: string;
  verifiableSources: VerifiableSource[];
  authorizedMedia: AuthorizedMedia[];
  targetAudiences: string[];
  targetPlatforms: PlatformFormat[];
  restrictions: string[];
  creativeHypothesis: string;
  measurableGoal: string;
  timelineEvents: EpistemicTimelineEvent[];
  visualProposals: VisualAssetProposal[];
  audiovisualScenes: AudiovisualScene[];
  fadIntegration: FadRecommendationViewer;
  campaigns: CampaignCycle[];
  versionComparisons: VersionComparisonData[];
  audioSegments?: AudioWaveformSegment[];
  spectrumVectors?: WorldSpectrumAxis[];
}
