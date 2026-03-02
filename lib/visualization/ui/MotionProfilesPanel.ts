export interface MotionProfilePanelState {
  totalDistance: number;
  maxVelocity: number;
  maxAcceleration: number;
  yoyoMode: boolean;
  isPaused: boolean;
}

export interface MotionProfilePanelOptions {
  distanceSliderId?: string;
  distanceValueId?: string;
  velocitySliderId?: string;
  velocityValueId?: string;
  accelSliderId?: string;
  accelValueId?: string;
  yoyoCheckboxId?: string;
  playPauseBtnId?: string;
  resetBtnId?: string;
  controlsSectionId?: string;
  controlsToggleId?: string;
  vizSectionId?: string;
  vizToggleId?: string;
  defaultControlsCollapsed?: boolean;
  defaultVizCollapsed?: boolean;
  initialState: MotionProfilePanelState;
  onDistanceChange: (value: number) => void;
  onVelocityChange: (value: number) => void;
  onAccelerationChange: (value: number) => void;
  onYoyoModeChange: (enabled: boolean) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onSectionCollapseChange?: (section: 'controls' | 'visualization', collapsed: boolean) => void;
}

export interface MotionProfilePanelApi {
  setPaused: (paused: boolean) => void;
  setYoyoMode: (enabled: boolean) => void;
  setValues: (state: Omit<MotionProfilePanelState, 'isPaused'>) => void;
  setCollapsed: (section: 'controls' | 'visualization', collapsed: boolean) => void;
  getCollapsed: () => { controls: boolean; visualization: boolean };
}

export function setupMotionProfilePanel(options: MotionProfilePanelOptions): MotionProfilePanelApi {
  const {
    distanceSliderId = 'distance-slider',
    distanceValueId = 'distance-value',
    velocitySliderId = 'velocity-slider',
    velocityValueId = 'velocity-value',
    accelSliderId = 'accel-slider',
    accelValueId = 'accel-value',
    yoyoCheckboxId = 'yoyo-checkbox',
    playPauseBtnId = 'play-pause-btn',
    resetBtnId = 'reset-btn',
    controlsSectionId = 'profile-panel',
    controlsToggleId = 'motion-controls-toggle',
    vizSectionId = 'motion-viz-section',
    vizToggleId = 'motion-viz-toggle',
    defaultControlsCollapsed = false,
    defaultVizCollapsed = false,
    initialState,
    onDistanceChange,
    onVelocityChange,
    onAccelerationChange,
    onYoyoModeChange,
    onPlayPause,
    onReset,
    onSectionCollapseChange,
  } = options;

  const distanceSlider = document.getElementById(distanceSliderId) as HTMLInputElement | null;
  const distanceValue = document.getElementById(distanceValueId) as HTMLElement | null;
  const velocitySlider = document.getElementById(velocitySliderId) as HTMLInputElement | null;
  const velocityValue = document.getElementById(velocityValueId) as HTMLElement | null;
  const accelSlider = document.getElementById(accelSliderId) as HTMLInputElement | null;
  const accelValue = document.getElementById(accelValueId) as HTMLElement | null;
  const yoyoCheckbox = document.getElementById(yoyoCheckboxId) as HTMLInputElement | null;
  const playPauseBtn = document.getElementById(playPauseBtnId) as HTMLButtonElement | null;
  const resetBtn = document.getElementById(resetBtnId) as HTMLButtonElement | null;
  const controlsSection = document.getElementById(controlsSectionId) as HTMLElement | null;
  const controlsToggle = document.getElementById(controlsToggleId) as HTMLButtonElement | null;
  const vizSection = document.getElementById(vizSectionId) as HTMLElement | null;
  const vizToggle = document.getElementById(vizToggleId) as HTMLButtonElement | null;

  if (
    !distanceSlider ||
    !distanceValue ||
    !velocitySlider ||
    !velocityValue ||
    !accelSlider ||
    !accelValue ||
    !yoyoCheckbox ||
    !playPauseBtn ||
    !resetBtn
  ) {
    console.warn('Motion profile panel elements not found');
    return {
      setPaused: () => {},
      setYoyoMode: () => {},
      setValues: () => {},
      setCollapsed: () => {},
      getCollapsed: () => ({ controls: false, visualization: false }),
    };
  }

  let controlsCollapsed = defaultControlsCollapsed;
  let vizCollapsed = defaultVizCollapsed;

  const setSectionCollapsed = (section: 'controls' | 'visualization', collapsed: boolean): void => {
    if (section === 'controls') {
      controlsCollapsed = collapsed;
      if (controlsSection) {
        controlsSection.classList.toggle('is-collapsed', collapsed);
      }
      if (controlsToggle) {
        controlsToggle.setAttribute('aria-expanded', String(!collapsed));
      }
    } else {
      vizCollapsed = collapsed;
      if (vizSection) {
        vizSection.classList.toggle('is-collapsed', collapsed);
      }
      if (vizToggle) {
        vizToggle.setAttribute('aria-expanded', String(!collapsed));
      }
    }

    if (onSectionCollapseChange) {
      onSectionCollapseChange(section, collapsed);
    }
  };

  const updatePlayPauseLabel = (paused: boolean): void => {
    playPauseBtn.textContent = paused ? '▶ Play' : '⏸ Pause';
  };

  const updateDistanceDisplay = (value: number): void => {
    distanceValue.textContent = `${value.toFixed(0)}°`;
  };

  const updateVelocityDisplay = (value: number): void => {
    velocityValue.textContent = `${value.toFixed(0)}°/s`;
  };

  const updateAccelerationDisplay = (value: number): void => {
    accelValue.textContent = `${value.toFixed(0)}°/s²`;
  };

  const syncState = (state: MotionProfilePanelState): void => {
    distanceSlider.value = String(state.totalDistance);
    velocitySlider.value = String(state.maxVelocity);
    accelSlider.value = String(state.maxAcceleration);
    yoyoCheckbox.checked = state.yoyoMode;
    updateDistanceDisplay(state.totalDistance);
    updateVelocityDisplay(state.maxVelocity);
    updateAccelerationDisplay(state.maxAcceleration);
    updatePlayPauseLabel(state.isPaused);
  };

  syncState(initialState);

  distanceSlider.addEventListener('input', (event) => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    updateDistanceDisplay(value);
    onDistanceChange(value);
  });

  velocitySlider.addEventListener('input', (event) => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    updateVelocityDisplay(value);
    onVelocityChange(value);
  });

  accelSlider.addEventListener('input', (event) => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    updateAccelerationDisplay(value);
    onAccelerationChange(value);
  });

  yoyoCheckbox.addEventListener('change', (event) => {
    const enabled = (event.target as HTMLInputElement).checked;
    onYoyoModeChange(enabled);
  });

  playPauseBtn.addEventListener('click', () => {
    onPlayPause();
  });

  resetBtn.addEventListener('click', () => {
    onReset();
  });

  controlsToggle?.addEventListener('click', () => {
    setSectionCollapsed('controls', !controlsCollapsed);
  });

  vizToggle?.addEventListener('click', () => {
    setSectionCollapsed('visualization', !vizCollapsed);
  });

  setSectionCollapsed('controls', controlsCollapsed);
  setSectionCollapsed('visualization', vizCollapsed);

  return {
    setPaused: (paused: boolean) => {
      updatePlayPauseLabel(paused);
    },
    setYoyoMode: (enabled: boolean) => {
      yoyoCheckbox.checked = enabled;
    },
    setValues: (state: Omit<MotionProfilePanelState, 'isPaused'>) => {
      distanceSlider.value = String(state.totalDistance);
      velocitySlider.value = String(state.maxVelocity);
      accelSlider.value = String(state.maxAcceleration);
      updateDistanceDisplay(state.totalDistance);
      updateVelocityDisplay(state.maxVelocity);
      updateAccelerationDisplay(state.maxAcceleration);
      yoyoCheckbox.checked = state.yoyoMode;
    },
    setCollapsed: (section: 'controls' | 'visualization', collapsed: boolean) => {
      setSectionCollapsed(section, collapsed);
    },
    getCollapsed: () => ({
      controls: controlsCollapsed,
      visualization: vizCollapsed,
    }),
  };
}
