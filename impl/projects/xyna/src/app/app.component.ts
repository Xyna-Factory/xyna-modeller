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
import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { I18nService, LocaleService } from '@zeta/i18n';

import { AppTitleComponent } from '@zeta/nav';
import { XcMenuComponent, XcMenuService } from '@zeta/xc';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent extends AppTitleComponent {

    title = 'Xyna';

    visible = true;


    constructor(
        router: Router,
        titleService: Title,
        readonly menuService: XcMenuService,
        readonly localeService: LocaleService,
        readonly i18nService: I18nService
    ) {
        super(router, titleService, menuService);
        i18nService.contextDismantlingSearch = true;
        localeService.languageChange.subscribe(() => {
            this.visible = false;
            setTimeout(() => {
                this.visible = true;
            }, 0);
        });
    }

    @ViewChild(XcMenuComponent)
    set menu(value: XcMenuComponent) {
        this.menuService.component = value;
    }


    // Performance Leak Detection:
    // remove comment slashes from following code to check for unnecessary detection changes

    // tslint:disable-next-line: use-life-cycle-interface
    // ngAfterViewChecked() {
    //     console.count('ngAfterViewChecked@XfmComponent');
    // }
}
