/*
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Copyright 2023 Xyna GmbH, Germany
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';

import { environment } from '@environments/environment';

import { Observable, of } from 'rxjs';

import { PlaygroundComponent } from './playground.component';


const root = 'Playground';

@Injectable({ providedIn: 'root' })
export class PlaygroundGuardService  {
    canActivate(activatedRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Observable<boolean> {
        return of(!environment.production);
    }
}

export const playgroundGuardCanActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> => inject(PlaygroundGuardService).canActivate(route, state);


export const PlaygroundRoutes: Routes = [
    {
        path: '',
        redirectTo: root,
        pathMatch: 'full'
    },
    {
        path: root,
        component: PlaygroundComponent,
        data: {
            reuse: root,
            title: root
        },
        canActivate: [playgroundGuardCanActivate]
    }
];

export const PlaygroundRoutingModules = [
    RouterModule.forChild(PlaygroundRoutes)
];

export const PlaygroundRoutingProviders = [
    PlaygroundGuardService
];
