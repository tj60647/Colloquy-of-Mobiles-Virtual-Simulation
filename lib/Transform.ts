/**
 * Transform.ts
 *
 * Represents a position and orientation in 3D space with hierarchical caching.
 * Migrated from Transform.js to be platform-agnostic (no p5.js dependency).
 */

import { Vector3 } from './math/Vector3';

export interface Euler {
  yaw: number;
  pitch: number;
  roll: number;
}

// ID generation with counter to prevent collisions
let nextId = 1;
function generateId(): number {
  return Date.now() * 1000 + (nextId++ % 1000);
}

export class Transform {
  // Private fields backing the properties
  private _position: Vector3;
  private _rotation: Euler; // yaw, pitch, roll

  // Caching and hierarchy implementation
  private _cachedGlobalPosition: Vector3 | null = null;
  private _cachedGlobalOrientation: Euler | null = null;
  private _cachedGlobalForward: Vector3 | null = null;

  private _needsPositionUpdate: boolean = true;
  private _needsOrientationUpdate: boolean = true;

  private _lastParentGlobalPosition: Vector3 | null = null;
  private _lastParentGlobalOrientation: Euler | null = null;

  public parent: Transform | null = null;
  public children: Transform[] = [];

  public name: string;
  public readonly id: number;

  constructor(
    parent: Transform | null = null,
    localPosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    localOrientation: { yaw: number; pitch: number; roll: number } = { yaw: 0, pitch: 0, roll: 0 },
    name: string = 'Unnamed Transform',
    id?: number // Optional - generates new ID if not provided
  ) {
    this.parent = parent;
    this._position = new Vector3(localPosition.x, localPosition.y, localPosition.z);
    this._rotation = { ...localOrientation };
    this.name = name;
    this.id = id !== undefined ? id : generateId();

    if (this.parent) {
      this.parent.addChild(this);
      this._lastParentGlobalPosition = this.parent.getGlobalPosition().clone();
      this._lastParentGlobalOrientation = { ...this.parent.getGlobalOrientation() };
    }
  }

  // Position Accessors
  get x() {
    return this._position.x;
  }
  set x(v: number) {
    this._position.x = v;
    this._needsPositionUpdate = true;
    this.markChildrenForUpdate();
  }
  get y() {
    return this._position.y;
  }
  set y(v: number) {
    this._position.y = v;
    this._needsPositionUpdate = true;
    this.markChildrenForUpdate();
  }
  get z() {
    return this._position.z;
  }
  set z(v: number) {
    this._position.z = v;
    this._needsPositionUpdate = true;
    this.markChildrenForUpdate();
  }

  get localPosition(): Vector3 {
    return this._position.clone();
  }
  set localPosition(v: Vector3) {
    this._position.copy(v);
    this._needsPositionUpdate = true;
    this.markChildrenForUpdate();
  }

  // Orientation Accessors
  get yaw() {
    return this._rotation.yaw;
  }
  set yaw(v: number) {
    this._rotation.yaw = v;
    this._needsOrientationUpdate = true;
    this.markChildrenForUpdate();
  }
  get pitch() {
    return this._rotation.pitch;
  }
  set pitch(v: number) {
    this._rotation.pitch = v;
    this._needsOrientationUpdate = true;
    this.markChildrenForUpdate();
  }
  get roll() {
    return this._rotation.roll;
  }
  set roll(v: number) {
    this._rotation.roll = v;
    this._needsOrientationUpdate = true;
    this.markChildrenForUpdate();
  }

  // Hierarchy
  addChild(child: Transform) {
    if (!child || this.children.includes(child)) {
      return; // Already a child or null
    }

    // Check for circular reference (would this create a cycle?)
    if (this.isAncestor(child)) {
      console.error(
        `Cannot add child "${child.name}" to "${this.name}": would create circular reference`
      );
      return;
    }

    // Check if child is trying to be its own parent
    if (child === this) {
      console.error(`Cannot add "${this.name}" as its own child`);
      return;
    }

    this.children.push(child);
    child.parent = this;
    child.markChildrenForUpdate();
  }

  /**
   * Check if a given transform is an ancestor of this transform.
   * Used to prevent circular references in the scene graph.
   */
  private isAncestor(potentialAncestor: Transform): boolean {
    let current = this.parent;
    const visited = new Set<Transform>();

    while (current) {
      if (visited.has(current)) {
        // Already visited this node, there's a cycle in the existing hierarchy
        return true;
      }
      visited.add(current);

      if (current === potentialAncestor) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  removeChild(child: Transform) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
      child.markChildrenForUpdate();
    }
  }

  markChildrenForUpdate() {
    // Use iterative approach with visited set to prevent infinite recursion
    const toVisit: Transform[] = [this];
    const visited = new Set<Transform>();

    while (toVisit.length > 0) {
      const current = toVisit.pop()!;

      if (visited.has(current)) {
        // Cycle detected, skip to prevent infinite loop
        continue;
      }
      visited.add(current);

      // Mark all children of current node
      for (const child of current.children) {
        child._needsPositionUpdate = true;
        child._needsOrientationUpdate = true;
        toVisit.push(child);
      }
    }
  }

  // Global Accessors
  getGlobalPosition(): Vector3 {
    if (this.parentHasChanged()) {
      this._needsPositionUpdate = true;
    }

    if (!this._needsPositionUpdate && this._cachedGlobalPosition) {
      return this._cachedGlobalPosition;
    }

    const calculated = this.calculatePosition();
    this._cachedGlobalPosition = calculated;
    this._needsPositionUpdate = false;
    this.updateLastParentTransform();
    return calculated;
  }

  getGlobalOrientation(): Euler {
    if (this.parentHasChanged()) {
      this._needsOrientationUpdate = true;
    }

    if (!this._needsOrientationUpdate && this._cachedGlobalOrientation) {
      return this._cachedGlobalOrientation;
    }

    const calculated = this.calculateOrientation();
    this._cachedGlobalOrientation = calculated;
    this._needsOrientationUpdate = false;
    this.updateLastParentTransform();
    return calculated;
  }

  getLocalForwardVector(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  getGlobalForwardVector(): Vector3 {
    // Legacy convention: Forward is (0, 1, 0) local?
    // Based on Transform.js line 319: return createVector(0, 1, 0);

    if (this.parentHasChanged()) {
      this._needsOrientationUpdate = true;
    }

    // We could cache forward vector too if expensive.
    // But calculate from orientation is fast enough?
    const ori = this.getGlobalOrientation();

    const forward = new Vector3(0, 1, 0); // Local Forward
    return this.applyRotation(forward, ori.yaw, ori.pitch, ori.roll);
  }

  // Helpers
  private calculatePosition(): Vector3 {
    if (!this.parent) return this._position.clone();

    const parentPos = this.parent.getGlobalPosition();
    const parentOri = this.parent.getGlobalOrientation();

    // Apply parent rotation to local position
    const rotated = this.applyRotation(
      this._position,
      parentOri.yaw,
      parentOri.pitch,
      parentOri.roll
    );

    // Translate
    return Vector3.add(rotated, parentPos);
  }

  private calculateOrientation(): Euler {
    const parentOri = this.parent
      ? this.parent.getGlobalOrientation()
      : { yaw: 0, pitch: 0, roll: 0 };
    return {
      yaw: this._rotation.yaw + parentOri.yaw,
      pitch: this._rotation.pitch + parentOri.pitch,
      roll: this._rotation.roll + parentOri.roll,
    };
  }

  private applyRotation(v: Vector3, yaw: number, pitch: number, roll: number): Vector3 {
    // Rotation logic ported from Transform.js (which used p5)
    // Rotates around Z (Roll), then X (Pitch), then Y (Yaw)?
    // Original code:
    // 1. Roll (Z)
    // 2. Pitch (X)
    // 3. Yaw (Y)
    // Each step returns new vector.

    // We can do this manually.
    let x = v.x,
      y = v.y,
      z = v.z;

    // 1. Roll (Z)
    const radRoll = Vector3.toRadians(roll);
    let cr = Math.cos(radRoll),
      sr = Math.sin(radRoll);
    let x1 = x * cr - y * sr;
    let y1 = x * sr + y * cr;
    let z1 = z;

    // 2. Pitch (X)
    const radPitch = Vector3.toRadians(pitch);
    let cp = Math.cos(radPitch),
      sp = Math.sin(radPitch);
    let x2 = x1;
    let y2 = y1 * cp - z1 * sp;
    let z2 = y1 * sp + z1 * cp;

    // 3. Yaw (Y)
    const radYaw = Vector3.toRadians(yaw);
    let cy = Math.cos(radYaw),
      sy = Math.sin(radYaw);
    let x3 = x2 * cy + z2 * sy;
    let y3 = y2;
    let z3 = -x2 * sy + z2 * cy;

    return new Vector3(x3, y3, z3);
  }

  private parentHasChanged(): boolean {
    if (!this.parent) return false;

    const currentPos = this.parent.getGlobalPosition();
    const currentOri = this.parent.getGlobalOrientation();

    // Simple dirty check using JSON (expensive but robust, used in legacy)
    // Optimized: check values directly.
    if (!this._lastParentGlobalPosition || !this._lastParentGlobalOrientation) return true;

    // Check Position
    if (
      Math.abs(currentPos.x - this._lastParentGlobalPosition.x) > 0.0001 ||
      Math.abs(currentPos.y - this._lastParentGlobalPosition.y) > 0.0001 ||
      Math.abs(currentPos.z - this._lastParentGlobalPosition.z) > 0.0001
    )
      return true;

    // Check Orientation
    if (
      Math.abs(currentOri.yaw - this._lastParentGlobalOrientation.yaw) > 0.0001 ||
      Math.abs(currentOri.pitch - this._lastParentGlobalOrientation.pitch) > 0.0001 ||
      Math.abs(currentOri.roll - this._lastParentGlobalOrientation.roll) > 0.0001
    )
      return true;

    return false;
  }

  private updateLastParentTransform() {
    if (this.parent) {
      this._lastParentGlobalPosition = this.parent.getGlobalPosition().clone();
      this._lastParentGlobalOrientation = { ...this.parent.getGlobalOrientation() };
    }
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      localPosition: { x: this._position.x, y: this._position.y, z: this._position.z },
      localOrientation: { ...this._rotation },
      parentId: this.parent ? this.parent.id : null,
    };
  }

  static fromJSON(json: any, parent: Transform | null = null): Transform {
    return new Transform(parent, json.localPosition, json.localOrientation, json.name, json.id);
  }
}
