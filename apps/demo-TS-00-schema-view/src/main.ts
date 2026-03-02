import '../../../lib/visualization/ui/styles.css';
type JsonObject = Record<string, unknown>;

async function fetchJson(path: string): Promise<JsonObject> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while loading ${path}`);
  }
  return (await response.json()) as JsonObject;
}

function evaluateCompatibility(schemaPath: string, config: JsonObject): string {
  const coordinateSystems = Array.isArray(config.coordinateSystems);
  const units = Array.isArray(config.units);
  const hasV2Version = config.version === '2.0';
  const mobiles = Array.isArray(config.mobiles);

  if (schemaPath === 'simulation-config.schema.json') {
    if (coordinateSystems) {
      return units
        ? 'Legacy-compatible shape detected: coordinateSystems + units (abstract model).'
        : 'Partially legacy-compatible: coordinateSystems found, units missing.';
    }
    return 'Not legacy-compatible: coordinateSystems array missing.';
  }

  if (hasV2Version && coordinateSystems && mobiles) {
    return 'V2-compatible shape detected: version 2.0 + coordinateSystems + mobiles.';
  }

  return 'Not v2-compatible: expected version="2.0" and mobiles array.';
}

async function loadSchemaAndConfig(): Promise<void> {
  const schemaMeta = document.getElementById('schema-meta');
  const schemaStatus = document.getElementById('schema-status');
  const legacySchemaContent = document.getElementById('legacy-schema-content');
  const v2SchemaContent = document.getElementById('v2-schema-content');
  const configContent = document.getElementById('config-content');
  const configSelect = document.getElementById('config-select') as HTMLSelectElement | null;

  if (!schemaMeta || !schemaStatus || !legacySchemaContent || !v2SchemaContent || !configContent || !configSelect) {
    return;
  }

  const legacySchemaPath = 'simulation-config.schema.json';
  const v2SchemaPath = 'simulation-config-v2.schema.json';
  const configPath = configSelect.value;

  try {
    const [legacySchema, v2Schema, config] = await Promise.all([
      fetchJson(legacySchemaPath),
      fetchJson(v2SchemaPath),
      fetchJson(configPath),
    ]);

    schemaMeta.textContent = `Loaded schemas: ${legacySchemaPath} and ${v2SchemaPath}`;

    const legacyCompatibility = evaluateCompatibility(legacySchemaPath, config);
    const v2Compatibility = evaluateCompatibility(v2SchemaPath, config);
    schemaStatus.textContent = `Compatibility • Legacy: ${legacyCompatibility} • V2: ${v2Compatibility}`;

    legacySchemaContent.textContent = JSON.stringify(legacySchema, null, 2);
    v2SchemaContent.textContent = JSON.stringify(v2Schema, null, 2);
    configContent.textContent = JSON.stringify(config, null, 2);
  } catch (error) {
    schemaMeta.textContent = 'Failed to load schema/config';
    schemaStatus.textContent = 'Compatibility: unavailable due to load error';
    const errorText = `Error loading schema lab data: ${String(error)}`;
    legacySchemaContent.textContent = errorText;
    v2SchemaContent.textContent = errorText;
    configContent.textContent = errorText;
  }
}

async function init() {
  setupInfoModal();
  const configSelect = document.getElementById('config-select') as HTMLSelectElement | null;

  await loadSchemaAndConfig();

  configSelect?.addEventListener('change', () => {
    loadSchemaAndConfig();
  });

  console.log('Demo 00: Schema Lab started');
}

/**
 * Set up info modal interactions
 */
function setupInfoModal() {
  const infoIcon = document.getElementById('info-icon');
  const infoModal = document.getElementById('info-modal');
  const infoClose = document.getElementById('info-close');

  if (!infoIcon || !infoModal || !infoClose) return;

  // Open modal on icon click
  infoIcon.addEventListener('click', () => {
    infoModal.classList.add('visible');
  });

  // Close modal on close button click
  infoClose.addEventListener('click', () => {
    infoModal.classList.remove('visible');
  });

  // Close modal on backdrop click
  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
      infoModal.classList.remove('visible');
    }
  });

  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && infoModal.classList.contains('visible')) {
      infoModal.classList.remove('visible');
    }
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
