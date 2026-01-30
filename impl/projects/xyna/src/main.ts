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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication, BrowserModule, Title } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { environment } from '@environments/environment';
import { I18nModule } from '@zeta/i18n';

import { AppComponent } from './app/app.component';
import { AppRoutingModules, AppRoutingProviders } from './app/app.routing';


if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(I18nModule),
        importProvidersFrom(...AppRoutingModules),
        ...AppRoutingProviders,
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
}).catch(err => console.log(err));
