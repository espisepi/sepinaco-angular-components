import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgtCanvas } from 'angular-three/dom';
import { RoutedScene } from './routed-scene';

@Component({
  template: `
		<div
     style="
     position: absolute;
     top: 0;
     left: 0;
     width: 100vw;
     height: 100vh;
     "
     class="h-svh">
			<ngt-canvas shadows [camera]="{ position: [0, 0, 20], fov: 50 }">
				<app-routed-scene *canvasContent />
			</ngt-canvas>
		</div>

		<ul
     style="
     position: absolute;
     bottom: 1rem;
     right: 1rem;
     display: flex;
     gap: 0.5rem;
     list-style: none;
     padding: 0;
     margin: 0;
     "
     class="absolute top-4 left-4 flex items-center gap-2">
			<li>
				<a
					routerLink="knot"
					class="underline"
					routerLinkActive="text-blue-500"
					[routerLinkActiveOptions]="{ exact: true }"
				>
					knot
				</a>
			</li>
			<li>
				<a
					routerLink="torus"
					class="underline"
					routerLinkActive="text-blue-500"
					[routerLinkActiveOptions]="{ exact: true }"
				>
					torus
				</a>
			</li>
			<li>
				<a
					routerLink="bomb"
					class="underline"
					routerLinkActive="text-blue-500"
					[routerLinkActiveOptions]="{ exact: true }"
				>
					bomb
				</a>
			</li>
		</ul>
	`,
  imports: [RoutedScene, RouterLink, RouterLinkActive, NgtCanvas],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'routed' },
})
export default class Routed { }
