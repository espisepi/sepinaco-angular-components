import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  Directive,
  DestroyRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { beforeRender, NgtArgs, NgtVector3 } from 'angular-three';
import { NgtrCuboidCollider, NgtrPhysics, NgtrRigidBody, revoluteJoint } from 'angular-three-rapier';
// import { ResetOrbitControls } from '../reset-orbit-controls';

@Directive({ selector: '[rigidBody][wheel]' })
export class WheelJoint {
  body = input.required<NgtrRigidBody>({ alias: 'wheel' });
  bodyAnchor = input.required<NgtVector3>({ alias: 'position' });

  private wheel = inject(NgtrRigidBody, { host: true });
  private rigidBody = computed(() => this.body().rigidBody());

  constructor() {
    revoluteJoint(this.rigidBody, this.wheel.rigidBody, {
      data: () => ({ body1Anchor: this.bodyAnchor(), body2Anchor: [0, 0, 0], axis: [0, 0, 1] }),
    });
  }
}

@Component({
  selector: 'app-car-rapier',
  template: `
    <ngtr-physics>
      <ng-template>
        <ngt-group>
          <ngt-object3D rigidBody="fixed" [position]="[0, -6, 0]" [cuboidCollider]="[50, 0.1, 50]">
            <ngt-mesh receiveShadow [rotation.x]="-Math.PI / 2">
              <ngt-plane-geometry *args="[100, 100]" />
              <ngt-mesh-standard-material color="#444" />
            </ngt-mesh>
          </ngt-object3D>

          <ngt-object3D #carBody="rigidBody" rigidBody="dynamic" [options]="{ colliders: 'cuboid' }">
            <ngt-mesh castShadow receiveShadow name="chassis" [scale]="[6, 1, 1.9]">
              <ngt-box-geometry />
              <ngt-mesh-standard-material color="red" />
            </ngt-mesh>
          </ngt-object3D>

          @for (position of wheelPositions; track $index) {
            <ngt-object3D
              rigidBody="dynamic"
              [position]="position"
              [options]="{ colliders: 'hull' }"
              [wheel]="carBody"
            >
              <ngt-mesh castShadow receiveShadow [rotation.x]="Math.PI / 2">
                <ngt-cylinder-geometry *args="[1, 1, 1, 32]" />
                <ngt-mesh-standard-material color="grey" />
              </ngt-mesh>
            </ngt-object3D>
          }
        </ngt-group>
      </ng-template>
    </ngtr-physics>
	`,
  // hostDirectives: [ResetOrbitControls],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NgtrCuboidCollider, NgtrPhysics, NgtrRigidBody, WheelJoint, NgtArgs],
})
export default class Car {
  private readonly carBody = viewChild.required<NgtrRigidBody>('carBody');
  private readonly pressedKeys = new Set<string>();
  private readonly destroyRef = inject(DestroyRef);

  protected wheelPositions: NgtVector3[] = [
    [-3, 0, 2],
    [-3, 0, -2],
    [3, 0, 2],
    [3, 0, -2],
  ];
  protected readonly Math = Math;

  constructor() {
    const keydown = (event: KeyboardEvent) => {
      if (this.isControlKey(event.code)) {
        event.preventDefault();
        this.pressedKeys.add(event.code);
      }

      if (event.code === 'KeyR') {
        this.resetCar();
      }
    };
    const keyup = (event: KeyboardEvent) => this.pressedKeys.delete(event.code);

    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
    });

    beforeRender(({ delta }) => this.drive(delta));
  }

  private drive(delta: number) {
    const body = this.carBody().rigidBody();
    if (!body) return;

    const acceleration = this.getThrottle();
    const steering = this.getSteering();
    const rotation = body.rotation();
    const forward = {
      x: 1 - 2 * (rotation.y * rotation.y + rotation.z * rotation.z),
      z: 2 * (rotation.x * rotation.y + rotation.w * rotation.z),
    };
    const impulseStrength = 45 * delta;

    if (acceleration !== 0) {
      body.applyImpulse(
        { x: forward.x * acceleration * impulseStrength, y: 0, z: forward.z * acceleration * impulseStrength },
        true,
      );
    }

    if (steering !== 0) {
      body.applyTorqueImpulse({ x: 0, y: steering * 18 * delta, z: 0 }, true);
    }

    if (this.pressedKeys.has('Space')) {
      const velocity = body.linvel();
      body.setLinvel({ x: velocity.x * 0.88, y: velocity.y, z: velocity.z * 0.88 }, true);
    }
  }

  private getThrottle() {
    return Number(this.pressedKeys.has('KeyW') || this.pressedKeys.has('ArrowUp')) -
      Number(this.pressedKeys.has('KeyS') || this.pressedKeys.has('ArrowDown'));
  }

  private getSteering() {
    return Number(this.pressedKeys.has('KeyD') || this.pressedKeys.has('ArrowRight')) -
      Number(this.pressedKeys.has('KeyA') || this.pressedKeys.has('ArrowLeft'));
  }

  private isControlKey(code: string) {
    return ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Space'].includes(code);
  }

  private resetCar() {
    const body = this.carBody().rigidBody();
    if (!body) return;

    body.setTranslation({ x: 0, y: 0, z: 0 }, true);
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }
}
