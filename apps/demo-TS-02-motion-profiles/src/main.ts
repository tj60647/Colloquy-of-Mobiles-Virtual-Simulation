/**
 * Demo 2: Motion Profiles
 *
 * Visualizes the actual MotionProfile.ts trapezoidal motion system.
 * Shows position, velocity, acceleration, and jerk over time with acceleration, cruise, and deceleration phases.
 * Includes a circular visualization showing the current rotation state with vector display.
 */

import '../../../lib/visualization/ui/styles.css';
import type { MotionPoint } from '../../../lib/subsystems/MotionProfile';
import { setupMotionProfilePanel, type MotionProfilePanelApi } from '../../../lib/visualization/ui';
import { LocalMotionProfileAdapter } from './LocalMotionProfileAdapter';
import type { MotionProfileSnapshot } from './motionProfileContracts';

/**
 * Main application class for motion profile visualization
 */
class Demo2App {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private simulationAdapter: LocalMotionProfileAdapter;
  private snapshot: MotionProfileSnapshot;
  private unsubscribeSnapshot: (() => void) | null = null;
  private motionProfilePanel: MotionProfilePanelApi | null = null;
  private readonly onResize: () => void;
  
  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;

    this.simulationAdapter = new LocalMotionProfileAdapter({
      totalDistance: 120,
      maxVelocity: 15,
      maxAcceleration: 15,
      timestep: 1 / 40,
      yoyoMode: true,
    });
    this.snapshot = this.simulationAdapter.getSnapshot();
    this.unsubscribeSnapshot = this.simulationAdapter.subscribe((nextSnapshot) => {
      this.snapshot = nextSnapshot;
    });
    
    this.onResize = () => this.resize();

    // Handle canvas resizing
    this.resize();
    window.addEventListener('resize', this.onResize);
    
    // Setup UI controls
    this.motionProfilePanel = setupMotionProfilePanel({
      initialState: {
        totalDistance: this.snapshot.params.totalDistance,
        maxVelocity: this.snapshot.params.maxVelocity,
        maxAcceleration: this.snapshot.params.maxAcceleration,
        yoyoMode: this.snapshot.params.yoyoMode,
        isPaused: this.snapshot.isPaused,
      },
      onDistanceChange: (value: number) => {
        this.simulationAdapter.setDistance(value);
      },
      onVelocityChange: (value: number) => {
        this.simulationAdapter.setMaxVelocity(value);
      },
      onAccelerationChange: (value: number) => {
        this.simulationAdapter.setMaxAcceleration(value);
      },
      onYoyoModeChange: (enabled: boolean) => {
        this.simulationAdapter.setYoyoMode(enabled);
        this.syncPanelState();
      },
      onPlayPause: () => {
        this.togglePause();
      },
      onReset: () => {
        this.reset();
      },
      onSectionCollapseChange: (section, collapsed) => {
        if (section === 'visualization') {
          requestAnimationFrame(() => this.resize());
        }
      },
    });
    this.syncPanelState();
    this.setupJsonDisplay();
  }
  
  /**
   * Resize canvas to match window size
   */
  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width));
    this.canvas.height = Math.max(1, Math.floor(rect.height));
  }
  
  private syncPanelState(): void {
    this.motionProfilePanel?.setPaused(this.snapshot.isPaused);
    this.motionProfilePanel?.setYoyoMode(this.snapshot.params.yoyoMode);
    this.motionProfilePanel?.setValues({
      totalDistance: this.snapshot.params.totalDistance,
      maxVelocity: this.snapshot.params.maxVelocity,
      maxAcceleration: this.snapshot.params.maxAcceleration,
      yoyoMode: this.snapshot.params.yoyoMode,
    });
    this.refreshJsonDisplay();
  }

  private setupJsonDisplay(): void {
    const toggleButton = document.getElementById('json-toggle');
    const jsonPanel = document.getElementById('json-panel');
    const closeButton = document.getElementById('json-close');
    const jsonContent = document.getElementById('json-content');

    if (!toggleButton || !jsonPanel || !closeButton || !jsonContent) {
      return;
    }

    this.refreshJsonDisplay();

    toggleButton.addEventListener('click', () => {
      const isVisible = jsonPanel.classList.toggle('visible');
      toggleButton.textContent = isVisible ? 'Hide JSON' : 'Show JSON';
      this.refreshJsonDisplay();
      if (isVisible) {
        toggleButton.style.display = 'none';
      }
    });

    closeButton.addEventListener('click', () => {
      jsonPanel.classList.remove('visible');
      toggleButton.textContent = 'Show JSON';
      toggleButton.style.display = 'block';
    });
  }

  private buildSimulationConfigJson(): Record<string, unknown> {
    const { totalDistance, maxVelocity, maxAcceleration, timestep, yoyoMode } = this.snapshot.params;

    return {
      $schema: 'https://colloquy-of-mobiles.org/schemas/simulation-config-v2.schema.json',
      version: '2.0',
      metadata: {
        name: 'Demo 2 Motion Profile Configuration',
        date: new Date().toISOString().slice(0, 10),
        description: `Motion profile preview (distance=${totalDistance}deg, maxVelocity=${maxVelocity}deg/s, maxAcceleration=${maxAcceleration}deg/s^2, yoyoMode=${yoyoMode})`,
      },
      simulation: {
        timestep,
      },
      coordinateSystems: [
        {
          id: 'world',
          name: 'World',
          parent: null,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
        },
        {
          id: 'motion_profile_mobile_cs',
          name: 'Motion Profile Mobile Coordinate System',
          parent: 'world',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
        },
      ],
      mobiles: [
        {
          id: 'motion_profile_mobile',
          name: 'Motion Profile Mobile',
          mobileType: 'female',
          coordinateSystem: 'motion_profile_mobile_cs',
        },
      ],
    };
  }

  private formatConfigJson(payload: Record<string, unknown>): string {
    return JSON.stringify(payload, null, 2);
  }

  private refreshJsonDisplay(): void {
    const jsonContent = document.getElementById('json-content');
    if (!jsonContent) {
      return;
    }
    jsonContent.textContent = this.formatConfigJson(this.buildSimulationConfigJson());
  }
  
  /**
   * Toggle pause state
   */
  private togglePause(): void {
    this.simulationAdapter.togglePause();
    this.motionProfilePanel?.setPaused(this.snapshot.isPaused);
  }
  
  /**
   * Reset simulation
   */
  private reset(): void {
    this.simulationAdapter.reset();
    this.syncPanelState();
  }
  
  /**
   * Start animation loop
   */
  start(): void {
    const animate = (timestamp: number) => {
      this.simulationAdapter.step();
      
      // Render
      this.render();
      
      // Continue loop
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  /**
   * Render graphs on canvas
   */
  private render(): void {
    const { width, height } = this.canvas;
    
    // Clear canvas with white background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, width, height);
    
    const profile = this.snapshot.profile;
    if (profile.length === 0) {
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.font = '20px monospace';
      this.ctx.fillText('No motion profile generated', width / 2 - 150, height / 2);
      return;
    }
    
    // Layout dimensions inside motion profile graphs container
    const panelPadding = 16;
    const graphX = panelPadding;
    const graphWidth = width - panelPadding * 2;
    
    // Circular visualization at top
    const circleY = panelPadding;
    const circleHeight = Math.min(220, Math.max(140, height * 0.24));
    this.drawCircularVisualization(graphX, circleY, graphWidth, circleHeight);
    
    // Graph layout (four horizontal graphs stacked below circular viz)
    const graphStartY = circleY + circleHeight + 20;
    const graphHeight = Math.max(70, (height - graphStartY - panelPadding) / 4);
    
    const graphs = [
      { y: graphStartY, label: 'Position (θ)', data: 'position', color: '#3498db', unit: '°', maxY: this.snapshot.params.totalDistance },
      { y: graphStartY + graphHeight, label: 'Velocity (dθ/dt)', data: 'velocity', color: '#2ecc71', unit: '°/s', maxY: this.snapshot.params.maxVelocity },
      { y: graphStartY + 2 * graphHeight, label: 'Acceleration (d²θ/dt²)', data: 'acceleration', color: '#e74c3c', unit: '°/s²', maxY: this.snapshot.params.maxAcceleration },
      { y: graphStartY + 3 * graphHeight, label: 'Jerk (d³θ/dt³)', data: 'jerk', color: '#9b59b6', unit: '°/s³', maxY: null }
    ];
    
    // Draw each graph
    graphs.forEach((graph) => {
      this.drawGraph(graphX, graph.y, graphWidth, graphHeight - 30, graph as any);
    });
    
    const showOverlayBoxes = graphWidth >= 760 && height >= 560;
    if (showOverlayBoxes) {
      // Draw phase indicators
      this.drawPhaseIndicators(graphX + 12, circleY + 12);
      
      // Draw profile info
      this.drawProfileInfo(graphX + graphWidth - 272, circleY + 12);
    }
  }
  
  /**
   * Draw a single graph
   */
  private drawGraph(x: number, y: number, width: number, height: number, config: any): void {
    const ctx = this.ctx;
    const profile = this.snapshot.profile;
    
    // Leave space for axis labels
    const leftMargin = 60;
    const bottomMargin = 30;
    const graphX = x + leftMargin;
    const graphY = y;
    const graphWidth = width - leftMargin;
    const graphHeight = height - bottomMargin;
    
    // Draw background
    ctx.fillStyle = 'rgba(245, 245, 245, 0.8)';
    ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
    
    // Draw border
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);
    
    // Draw label
    ctx.fillStyle = '#2c3e50';
    ctx.font = '14px monospace';
    ctx.fillText(config.label, graphX + 10, graphY + 20);
    
    // Find min/max for scaling
    let minValue = Infinity;
    let maxValue = -Infinity;
    profile.forEach((point: MotionPoint) => {
      const value = (point as any)[config.data];
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
    });
    
    // Use slider max if provided, otherwise use data max
    if (config.maxY !== null && config.maxY !== undefined) {
      maxValue = config.maxY;
      minValue = Math.min(minValue, -config.maxY); // Allow negative range for symmetric graphs
    }
    
    // Draw Y-axis labels and ticks
    const valueRange = maxValue - minValue;
    ctx.fillStyle = '#2c3e50';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    
    // Draw 5 Y-axis ticks
    for (let i = 0; i <= 4; i++) {
      const value = minValue + (valueRange * i / 4);
      const tickY = graphY + graphHeight - (graphHeight * i / 4);
      
      // Draw tick line
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(graphX, tickY);
      ctx.lineTo(graphX + graphWidth, tickY);
      ctx.stroke();
      
      // Draw tick label
      ctx.fillText(value.toFixed(0), graphX - 5, tickY + 4);
    }
    
    // Draw Y-axis unit label (rotated)
    ctx.save();
    ctx.translate(x + 15, graphY + graphHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(config.unit, 0, 0);
    ctx.restore();
    
    // Draw vertical tick lines at ALL sample points
    const scaleX = graphWidth / (profile.length - 1);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    profile.forEach((point: MotionPoint, i: number) => {
      const tickX = graphX + i * scaleX;
      ctx.beginPath();
      ctx.moveTo(tickX, graphY);
      ctx.lineTo(tickX, graphY + graphHeight);
      ctx.stroke();
    });
    
    // Draw X-axis time labels
    ctx.fillStyle = '#2c3e50';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    const totalTime = profile.length * this.snapshot.params.timestep;
    for (let i = 0; i <= 4; i++) {
      const time = (totalTime * i / 4);
      const tickX = graphX + (graphWidth * i / 4);
      ctx.fillText(time.toFixed(1) + 's', tickX, graphY + graphHeight + 20);
    }
    
    // Reset text alignment
    ctx.textAlign = 'left';
    
    // Draw data
    if (profile.length > 1) {
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const scaleY = valueRange > 0 ? (graphHeight * 0.9) / valueRange : 1;
      
      profile.forEach((point: MotionPoint, i: number) => {
        const px = graphX + i * scaleX;
        const value = (point as any)[config.data];
        const py = graphY + graphHeight * 0.95 - (value - minValue) * scaleY;
        
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      
      ctx.stroke();
      
      // Draw current position marker
      const currentPoint = profile[this.snapshot.currentIndex];
      const currentValue = (currentPoint as any)[config.data];
      const markerX = graphX + this.snapshot.currentIndex * scaleX;
      const markerY = graphY + graphHeight * 0.95 - (currentValue - minValue) * scaleY;
      
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw current value
      ctx.fillStyle = config.color;
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`${currentValue.toFixed(1)}${config.unit}`, graphX + graphWidth - 120, graphY + 20);
    }
  }
  
  /**
   * Draw circular visualization of rotation with vectors
   */
  private drawCircularVisualization(x: number, y: number, width: number, height: number): void {
    const ctx = this.ctx;
    const profile = this.snapshot.profile;
    const currentPoint = profile[this.snapshot.currentIndex];
    const { totalDistance } = this.snapshot.params;
    
    // Center of visualization
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2.5;
    
    // Draw background
    ctx.fillStyle = 'rgba(245, 245, 245, 0.8)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Draw title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('Rotation State', x + 10, y + 20);
    
    // Calculate adjusted position (centered around 0)
    const adjustedPosition = currentPoint.position - totalDistance / 2;
    
    // Draw current angle display
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${adjustedPosition.toFixed(1)}°`, x + 10, y + 45);
    
    // Draw circular path
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw range of motion arc (from -totalDistance/2 to +totalDistance/2)
    const startAngle = ((-totalDistance / 2) * Math.PI) / 180 - Math.PI / 2;
    const endAngle = ((totalDistance / 2) * Math.PI) / 180 - Math.PI / 2;
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
    
    // Draw start and end markers
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(startX, startY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endX, endY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw angle labels at start and end
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${(-totalDistance / 2).toFixed(0)}°`, startX, startY - 12);
    ctx.fillText(`${(totalDistance / 2).toFixed(0)}°`, endX, endY - 12);
    ctx.textAlign = 'left';
    
    // Draw center point
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Calculate position on circle using adjusted position
    const angleRad = (adjustedPosition * Math.PI) / 180;
    const posX = centerX + radius * Math.cos(angleRad - Math.PI / 2); // -90° to start at top
    const posY = centerY + radius * Math.sin(angleRad - Math.PI / 2);
    
    // Draw position marker
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(posX, posY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw position line from center
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(posX, posY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Vector scaling factors
    const velScale = 0.5;
    const accelScale = 2.0;
    const jerkScale = 0.05;
    
    // In yo-yo mode, velocity/acceleration/jerk are already signed correctly in the profile
    // (negative during return journey), so we use them directly
    
    // Draw vectors from largest to smallest so velocity (smallest) is on top
    
    // Draw jerk vector (tangent direction, rate of change of acceleration) - drawn first (bottom layer)
    if (Math.abs(currentPoint.jerk) > 0.1) {
      const jerkLength = Math.abs(currentPoint.jerk) * jerkScale;
      const jerkAngle = angleRad + (currentPoint.jerk > 0 ? 0 : Math.PI); // Tangent direction
      const jerkEndX = posX + jerkLength * Math.cos(jerkAngle);
      const jerkEndY = posY + jerkLength * Math.sin(jerkAngle);
      
      this.drawArrow(ctx, posX, posY, jerkEndX, jerkEndY, '#9b59b6', 'Jerk');
    }
    
    // Draw acceleration vector (radial for circular motion) - drawn second (middle layer)
    if (Math.abs(currentPoint.acceleration) > 0.1) {
      const accelLength = Math.abs(currentPoint.acceleration) * accelScale;
      const accelAngle = angleRad + (currentPoint.acceleration > 0 ? 0 : Math.PI); // Along tangent
      const accelEndX = posX + accelLength * Math.cos(accelAngle);
      const accelEndY = posY + accelLength * Math.sin(accelAngle);
      
      this.drawArrow(ctx, posX, posY, accelEndX, accelEndY, '#e74c3c', 'Accel');
    }
    
    // Draw velocity vector (tangent to circle) - drawn last (top layer)
    if (Math.abs(currentPoint.velocity) > 0.1) {
      const velLength = Math.abs(currentPoint.velocity) * velScale;
      const velAngle = angleRad + (currentPoint.velocity > 0 ? 0 : Math.PI); // Tangent direction
      const velEndX = posX + velLength * Math.cos(velAngle);
      const velEndY = posY + velLength * Math.sin(velAngle);
      
      this.drawArrow(ctx, posX, posY, velEndX, velEndY, '#2ecc71', 'Velocity');
    }
    
    // Draw legend
    const legendX = x + 10;
    const legendY = y + height - 50;
    ctx.font = '11px monospace';
    
    const legends = [
      { color: '#3498db', label: 'Position' },
      { color: '#2ecc71', label: 'Velocity' },
      { color: '#e74c3c', label: 'Acceleration' },
      { color: '#9b59b6', label: 'Jerk' },
    ];
    
    legends.forEach((leg, i) => {
      const lx = legendX + (i % 2) * 120;
      const ly = legendY + Math.floor(i / 2) * 18;
      
      ctx.fillStyle = leg.color;
      ctx.fillRect(lx, ly - 8, 12, 12);
      ctx.fillStyle = '#2c3e50';
      ctx.fillText(leg.label, lx + 18, ly + 2);
    });
  }
  
  /**
   * Draw an arrow for vector visualization
   */
  private drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label?: string): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length < 1) return;
    
    const angle = Math.atan2(dy, dx);
    const arrowSize = 8;
    
    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - arrowSize * Math.cos(angle - Math.PI / 6),
      y2 - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - arrowSize * Math.cos(angle + Math.PI / 6),
      y2 - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Draw phase indicators (Acceleration, Cruise, Deceleration)
   */
  private drawPhaseIndicators(x: number, y: number): void {
    const ctx = this.ctx;
    const profile = this.snapshot.profile;
    const currentPoint = profile[this.snapshot.currentIndex];
    
    // Determine current phase based on acceleration
    let phase = 'Cruise';
    let phaseColor = '#2ecc71';
    
    if (Math.abs(currentPoint.acceleration) > 0.1) {
      if (currentPoint.acceleration > 0) {
        phase = 'Acceleration';
        phaseColor = '#3498db';
      } else {
        phase = 'Deceleration';
        phaseColor = '#e74c3c';
      }
    }
    
    // Draw phase indicator box
    ctx.fillStyle = 'rgba(245, 245, 245, 0.9)';
    ctx.fillRect(x, y, 250, 120);
    
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.4)';
    ctx.strokeRect(x, y, 250, 120);
    
    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Current Phase', x + 10, y + 25);
    
    // Phase name
    ctx.fillStyle = phaseColor;
    ctx.font = 'bold 24px monospace';
    ctx.fillText(phase, x + 10, y + 60);
    
    // Progress
    const progress = ((this.snapshot.currentIndex / profile.length) * 100).toFixed(1);
    ctx.fillStyle = '#5a6c7d';
    ctx.font = '14px monospace';
    ctx.fillText(`Progress: ${progress}%`, x + 10, y + 90);
    ctx.fillText(`Point: ${this.snapshot.currentIndex + 1}/${profile.length}`, x + 10, y + 110);
  }
  
  /**
   * Draw profile information
   */
  private drawProfileInfo(x: number, y: number): void {
    const ctx = this.ctx;
    const profile = this.snapshot.profile;
    const { totalDistance, maxVelocity, maxAcceleration, timestep } = this.snapshot.params;
    
    // Draw info box
    ctx.fillStyle = 'rgba(245, 245, 245, 0.9)';
    ctx.fillRect(x, y, 260, 180);
    
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.4)';
    ctx.strokeRect(x, y, 260, 180);
    
    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Profile Stats', x + 10, y + 25);
    
    // Stats
    ctx.font = '13px monospace';
    ctx.fillStyle = '#5a6c7d';
    const sampleFreq = 1 / timestep;
    const lines = [
      `Distance: ${totalDistance.toFixed(0)}°`,
      `Max Vel: ${maxVelocity.toFixed(0)}°/s`,
      `Max Accel: ${maxAcceleration.toFixed(0)}°/s²`,
      `Duration: ${(profile.length * timestep).toFixed(2)}s`,
      `Samples: ${profile.length}`,
      `Sample Rate: ${sampleFreq.toFixed(0)} Hz`,
      `Timestep: ${(timestep * 1000).toFixed(1)}ms`,
    ];
    
    lines.forEach((line, i) => {
      ctx.fillText(line, x + 10, y + 55 + i * 18);
    });
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    window.removeEventListener('resize', this.onResize);
    this.unsubscribeSnapshot?.();
    this.unsubscribeSnapshot = null;
  }
}

/**
 * Initialize and start the demo
 */
async function init() {
  const app = new Demo2App();
  
  // Setup UI
  setupInfoModal();
  // Note: No camera controls needed for this 2D demo
  
  // Start animation
  app.start();
  console.log('Demo 2: Motion Profiles started');
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
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
