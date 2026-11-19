/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SUITE DE PRUEBAS AUTOMÁTICAS: INTEGRIDAD EPISTEMOLÓGICA SFI
 * Demuestra matemáticamente y por código que:
 * 1. Ningún dato DEMO puede convertirse en evidencia real mediante cambios superficiales en sus etiquetas.
 * 2. Se bloquea la exportación canónica de cualquier elemento sintético.
 * 3. hasReceivedFadData no puede ser true sin firma criptográfica formal de SFI.
 * 4. Ningún activo sintético puede auto-atribuirse licencias o dominio público.
 */

import { EpistemicValidator } from './epistemicValidator';
import { DEMO_PROJECT } from '../data/demoProject';
import { ProjectData, SfiWorkPackage } from '../types';

export interface TestResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  details: string;
}

export function runAllEpistemicTests(): TestResult[] {
  const results: TestResult[] = [];

  // TEST 1: Estado base de DEMO_PROJECT es válido para revisión pero NUNCA como evidencia canónica
  (() => {
    const report = EpistemicValidator.validateProject(DEMO_PROJECT);
    const passed = report.isValidForReviewExport === true && report.canExportAsCanonicalEvidence === false;
    results.push({
      suiteName: 'Protección de Canonicidad',
      testName: 'DEMO_PROJECT válido para borrador de revisión pero bloqueado como evidencia canónica',
      passed,
      details: passed
        ? `Éxito: canExportAsCanonicalEvidence es estrictamente false (${report.totalSyntheticItems} activos sintéticos catalogados).`
        : 'Fallo: El proyecto demo obtuvo permisos de evidencia canónica indebidos.',
    });
  })();

  // TEST 2: Intento de manipular etiqueta: cambiar una fuente sintética a 'canonical_sfi_verified'
  (() => {
    const tamperedProject: ProjectData = JSON.parse(JSON.stringify(DEMO_PROJECT));
    tamperedProject.verifiableSources[0].institutionalVerification = 'canonical_sfi_verified';

    const report = EpistemicValidator.validateProject(tamperedProject);
    const hasBlocker = report.issues.some((i) => i.code === 'ERR_SYNTHETIC_CANONICAL_PROMOTION');
    const passed = hasBlocker && report.isValidForReviewExport === false;

    results.push({
      suiteName: 'Inviolabilidad de Procedencia',
      testName: 'Bloqueo inmediato si una fuente sintética intenta etiquetarse como canonical_sfi_verified',
      passed,
      details: passed
        ? 'Éxito: El validador detectó la alteración superficial y bloqueó la exportación con código ERR_SYNTHETIC_CANONICAL_PROMOTION.'
        : 'Fallo de seguridad: Se permitió la promoción no autorizada de una fuente sintética.',
    });
  })();

  // TEST 3: Intento de elevar certeza: asignar 'alta_verificada_sfi' a un hito DEMO_SYNTHETIC
  (() => {
    const tamperedProject: ProjectData = JSON.parse(JSON.stringify(DEMO_PROJECT));
    tamperedProject.timelineEvents[0].certaintyLevel = 'alta_verificada_sfi';

    const report = EpistemicValidator.validateProject(tamperedProject);
    const hasBlocker = report.issues.some((i) => i.code === 'ERR_SYNTHETIC_CERTAINTY_ELEVATION');
    const passed = hasBlocker && report.isValidForReviewExport === false;

    results.push({
      suiteName: 'Inviolabilidad de Certeza',
      testName: 'Bloqueo si un hito con procedencia DEMO_SYNTHETIC declara certeza alta_verificada_sfi',
      passed,
      details: passed
        ? 'Éxito: Detectada manipulación de nivel de certeza; bloqueador ERR_SYNTHETIC_CERTAINTY_ELEVATION emitido.'
        : 'Fallo: Se permitió declarar certeza institucional canónica sobre un hito simulado.',
    });
  })();

  // TEST 4: Intento de falsear recepción FAD: hasReceivedFadData = true sin sobre criptográfico
  (() => {
    const tamperedProject: ProjectData = JSON.parse(JSON.stringify(DEMO_PROJECT));
    tamperedProject.fadIntegration.hasReceivedFadData = true;
    tamperedProject.fadIntegration.canonicalReportReference = 'REPORTE-FAD-INVENTADO-123';

    const report = EpistemicValidator.validateProject(tamperedProject);
    const hasBlocker = report.issues.some((i) => i.code === 'ERR_UNVERIFIED_FAD_RECEPTION_CLAIM');
    const passed = hasBlocker && report.isValidForReviewExport === false;

    results.push({
      suiteName: 'Salvaguarda FAD de SFI',
      testName: 'Bloqueo de afirmación FAD (hasReceivedFadData: true) sin firma criptográfica SFI',
      passed,
      details: passed
        ? 'Éxito: ERR_UNVERIFIED_FAD_RECEPTION_CLAIM disparado; la aplicación no permite fingir recepciones FAD.'
        : 'Fallo de integridad: Se aceptó un reporte FAD no firmado por SFI.',
    });
  })();

  // TEST 5: Intento de auto-atribución de derechos: activo sintético claiming "Dominio Público"
  (() => {
    const tamperedProject: ProjectData = JSON.parse(JSON.stringify(DEMO_PROJECT));
    tamperedProject.authorizedMedia[0].rightsDeclared = 'Dominio Público Documental — Fondo Digitalizado Abierto';

    const report = EpistemicValidator.validateProject(tamperedProject);
    const hasBlocker = report.issues.some((i) => i.code === 'ERR_UNAUTHORIZED_RIGHTS_SELF_ATTRIBUTION');
    const passed = hasBlocker && report.isValidForReviewExport === false;

    results.push({
      suiteName: 'Salvaguarda Jurídica',
      testName: 'Bloqueo de auto-atribución de dominio público o licencias abiertas en material sintético',
      passed,
      details: passed
        ? 'Éxito: ERR_UNAUTHORIZED_RIGHTS_SELF_ATTRIBUTION emitido; se exige dictamen jurídico formal de SFI.'
        : 'Fallo: Se permitió auto-atribuir derechos sobre material sintético.',
    });
  })();

  // TEST 6: Intento de exportar un paquete con formalStatus adulterado
  (() => {
    const report = EpistemicValidator.validateProject(DEMO_PROJECT);
    const fakePkg: SfiWorkPackage = {
      packageId: 'TEST-TAMPER-01',
      originProjectId: DEMO_PROJECT.id,
      projectCode: DEMO_PROJECT.code,
      materialType: 'Test',
      versionTag: 'v1.0',
      generatedAt: new Date().toISOString(),
      epistemicNatureDeclaration: 'PROPUESTA_CREATIVA_SINTETICA',
      provenanceSummary: 'DEMO_SYNTHETIC',
      filesAvailable: [],
      originReferences: [],
      rightsDeclaration: 'Test',
      transformationsPerformed: [],
      epistemicWarningsAndLimits: [],
      fadNotice: 'Test',
      formalStatus: 'BORRADOR DE PROPUESTA CREATIVA (NO EVIDENCIA)',
      nonCanonicalClause: 'Test',
      validationReport: report,
    };

    // Cambiar formalStatus a EVIDENCIA_CANONICA
    (fakePkg as unknown as { formalStatus: string }).formalStatus = 'EVIDENCIA_CANONICA_APROBADA';

    const validation = EpistemicValidator.validateWorkPackage(fakePkg);
    const passed = validation.canExport === false;

    results.push({
      suiteName: 'Gobernanza de Exportación',
      testName: 'Rechazo de cualquier paquete de trabajo que intente autodenominarse EVIDENCIA_CANONICA',
      passed,
      details: passed
        ? 'Éxito: validateWorkPackage rechazó la exportación por alteración de estado formal.'
        : 'Fallo crítico: El exportador permitió autoproclamar canonicidad.',
    });
  })();

  // TEST 7: Intento de alterar procedencia en un segmento de audio anotado en Multimedia Layer
  (() => {
    const tamperedProject: ProjectData = JSON.parse(JSON.stringify(DEMO_PROJECT));
    tamperedProject.audioSegments = [
      {
        id: 'seg-tamper-01',
        audioFileName: 'archivo_subterraneo.wav',
        startTime: 1.2,
        endTime: 4.5,
        linkedSceneId: DEMO_PROJECT.audiovisualScenes[0]?.id || 'sc-1',
        annotation: 'Registro de resonancia 35.2 Hz',
        provenance: 'SFI_CANONICAL' as unknown as 'DEMO_SYNTHETIC',
        isDemoSynthetic: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const report = EpistemicValidator.validateProject(tamperedProject);
    const hasBlocker = report.issues.some((i) => i.code === 'ERR_AUDIO_SEGMENT_MISSING_DEMO_TAG');
    const passed = hasBlocker && report.isValidForReviewExport === false;

    results.push({
      suiteName: 'Integridad Multimedia Layer',
      testName: 'Bloqueo si un segmento de audio anotado intenta omitir DEMO_SYNTHETIC o isDemoSynthetic',
      passed,
      details: passed
        ? 'Éxito: ERR_AUDIO_SEGMENT_MISSING_DEMO_TAG bloqueó la alteración de procedencia en audio segmentado.'
        : 'Fallo: Se permitió registrar un segmento de audio sin procedencia DEMO_SYNTHETIC.',
    });
  })();

  return results;
}

// Para ejecución directa via Node / TSX en CLI
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('epistemicValidator.test.ts')) {
  console.log('--- EJECUTANDO SUITE DE PRUEBAS AUTOMÁTICAS DE INTEGRIDAD EPISTEMOLÓGICA ---');
  const testResults = runAllEpistemicTests();
  let failedCount = 0;
  testResults.forEach((t, idx) => {
    const symbol = t.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${idx + 1}] ${symbol} | [${t.suiteName}] ${t.testName}`);
    console.log(`    -> ${t.details}`);
    if (!t.passed) failedCount++;
  });
  console.log('----------------------------------------------------------------------------');
  if (failedCount === 0) {
    console.log(`TODAS LAS PRUEBAS SUPERADAS (${testResults.length}/${testResults.length}). Ningún dato sintético puede vulnerar la canonicidad de SFI.`);
  } else {
    console.error(`FALLARON ${failedCount} PRUEBAS.`);
    process.exit(1);
  }
}
