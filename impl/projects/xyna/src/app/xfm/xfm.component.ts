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
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { RIGHT_FACTORY_MANAGER } from '@fman/const';
import { FactoryManagerName, FactoryManagerVersion } from '@fman/version';
import { ProcessModellerName, ProcessModellerVersion } from '@pmod/version';
import { MessageBusService } from '@yggdrasil/events';
import { YggdrasilName, YggdrasilVersion } from '@yggdrasil/version';
import { ApiService, RuntimeContext, RuntimeContextSelectionSettings } from '@zeta/api';
import { RightsInterceptor } from '@zeta/api/rights.interceptor';
import { AuthService } from '@zeta/auth';
import { AuthEventService } from '@zeta/auth/auth-event.service';
import { KeyboardEventType, KeyDistributionService } from '@zeta/base';
import { I18nService, LocaleService } from '@zeta/i18n';
import { RuntimeContextSelectionComponent } from '@zeta/nav';
import { XcDialogService, XcMenuItem, XcNavListItem, XcNavListOrientation, XcStatusBarComponent } from '@zeta/xc';

import { debounceTime } from 'rxjs/operators';

import { RIGHT_ACM } from './acm/const';
import { AccessControlManagementName, AccessControlManagementVersion } from './acm/version';
import { xfm_translations_de_DE } from './locale/xfm-translations.de-DE';
import { xfm_translations_en_US } from './locale/xfm-translations.en-US';
import { RIGHT_PROCESS_MODELLER } from './processmodeller/const';
import { ModellerSettingsDialogComponent } from './processmodeller/modeller-settings-dialog/modeller-settings-dialog.component';
import { RIGHT_PROCESS_MONITOR } from './processmonitor/const';
import { ProcessMonitorName, ProcessMonitorVersion } from './processmonitor/version';
import { RIGHT_TEST_FACTORY } from './testfactory/const';
import { TestFactoryName, TestFactoryVersion } from './testfactory/version';


@Component({
    templateUrl: './xfm.component.html',
    styleUrls: ['./xfm.component.scss'],
    standalone: false
})
export class XfmComponent implements OnInit {

    readonly navListItems: XcNavListItem[] = [];
    readonly navListOrientation = XcNavListOrientation.TOP;

    readonly usermenuItems: XcMenuItem[] = [];
    readonly applicationVersions: string[];

    @ViewChild(XcStatusBarComponent)
    statusBar: XcStatusBarComponent;


    constructor(
        private readonly apiService: ApiService,
        private readonly dialogService: XcDialogService,
        private readonly authService: AuthService,
        readonly authEvents: AuthEventService,
        private readonly i18n: I18nService,
        private readonly keyService: KeyDistributionService,
        private readonly router: Router,
        readonly messageBus: MessageBusService
    ) {
        this.i18n.setTranslations(LocaleService.DE_DE, xfm_translations_de_DE);
        this.i18n.setTranslations(LocaleService.EN_US, xfm_translations_en_US);

        const navListItems = [
            { link: 'Process-Modeller', icon: 'processmodeller', iconStyle: 'modeller', name: ProcessModellerName, class: 'processmodeller', tooltip: this.i18n.translate('xfm.processmodeller-tooltip') },
            { link: 'Factory-Manager', icon: 'factorymanager', iconStyle: 'modeller', name: FactoryManagerName, class: 'factorymanager', tooltip: this.i18n.translate('xfm.factorymanager-tooltip') },
            { link: 'Process-Monitor', icon: 'processmonitor', iconStyle: 'modeller', name: ProcessMonitorName, class: 'processmonitor', tooltip: this.i18n.translate('xfm.processmonitor-tooltip') },
            { link: 'Test-Factory', icon: 'testfactory', iconStyle: 'modeller', name: TestFactoryName, class: 'testfactory', tooltip: this.i18n.translate('xfm.testfactory-tooltip') },
            { link: 'acm', icon: 'testfactory', iconStyle: 'modeller', name: AccessControlManagementName, class: 'acm', tooltip: this.i18n.translate('xfm.acm-tooltip') }
        ];

        [
            RIGHT_PROCESS_MODELLER,
            RIGHT_FACTORY_MANAGER,
            RIGHT_PROCESS_MONITOR,
            RIGHT_TEST_FACTORY,
            RIGHT_ACM
        ].forEach((right, idx) => {
            if (authService.hasRight(right)) {
                this.navListItems.push(navListItems[idx]);
            }
        });

        this.applicationVersions = [
            ['Xyna Factory Server', authEvents.sessionInfoSubject.value?.xynaVersion ?? ''],
            [ProcessModellerName, ProcessModellerVersion],
            [FactoryManagerName, FactoryManagerVersion],
            [ProcessMonitorName, ProcessMonitorVersion],
            [TestFactoryName, TestFactoryVersion],
            [AccessControlManagementName, AccessControlManagementVersion],
            [YggdrasilName, YggdrasilVersion]
        ].map(version => version.join(': '));

        this.usermenuItems.push(
            <XcMenuItem>{
                name: authService.username,
                icon: 'user',
                disabled: true
            },
            <XcMenuItem>{
                name: i18n.translate('xfm.settings'), icon: 'settings',
                click: () => dialogService.custom(ModellerSettingsDialogComponent)
            },
            <XcMenuItem>{
                name: 'Logout',
                icon: 'arrowleft',
                click: () => authService.logout().subscribe()
            }
        );

        RightsInterceptor.errorChange.pipe(
            debounceTime(500)
        ).subscribe(errorObject =>
            this.dialogService.error(this.i18n.translate(errorObject.message), null, errorObject.exceptionMessage)
        );

        messageBus.startUpdates();
        authEvents.didLogout.subscribe(() => {
            // reload page on logout (triggered by user or loss of session) to cleanup cache
            window.location.reload();
            messageBus.stopUpdates();
        });
    }


    ngOnInit() {
        this.keyService.keyEvents
            .subscribe(eventObject => {
                const key = eventObject.key.toLowerCase();
                if ((key === 'f') && eventObject.ctrl && eventObject.shift && this.authService.hasRight(RIGHT_FACTORY_MANAGER)) {
                    if (eventObject.type === KeyboardEventType.KEY_TYPE_DOWN) {
                        eventObject.preventDefault();
                    } else {
                        eventObject.execute(
                            () => this.router.navigate(['xfm/Factory-Manager/'])
                        );
                    }
                }
                if ((key === 'u') && eventObject.ctrl && eventObject.shift && this.authService.hasRight(RIGHT_ACM)) {
                    if (eventObject.type === KeyboardEventType.KEY_TYPE_DOWN) {
                        eventObject.preventDefault();
                    } else {
                        eventObject.execute(
                            () => this.router.navigate(['xfm/acm/'])
                        );
                    }
                }
                if ((key === 'p') && eventObject.ctrl && eventObject.shift && this.authService.hasRight(RIGHT_PROCESS_MODELLER)) {
                    if (eventObject.type === KeyboardEventType.KEY_TYPE_DOWN) {
                        eventObject.preventDefault();
                    } else {
                        eventObject.execute(
                            () => this.router.navigate(['xfm/Process-Modeller/'])
                        );
                    }
                }
                if ((key === 'm') && eventObject.ctrl && eventObject.shift && this.authService.hasRight(RIGHT_PROCESS_MONITOR)) {
                    if (eventObject.type === KeyboardEventType.KEY_TYPE_DOWN) {
                        eventObject.preventDefault();
                    } else {
                        eventObject.execute(
                            () => this.router.navigate(['xfm/Process-Monitor/'])
                        );
                    }
                }
                if ((key === 't') && eventObject.ctrl && eventObject.shift && this.authService.hasRight(RIGHT_TEST_FACTORY)) {
                    if (eventObject.type === KeyboardEventType.KEY_TYPE_DOWN) {
                        eventObject.preventDefault();
                    } else {
                        eventObject.execute(
                            () => this.router.navigate(['xfm/Test-Factory/'])
                        );
                    }
                }

                this.navListItems.forEach((item, index) => {
                    if ((key === (index + 1).toString()) && eventObject.ctrl) {
                        if (eventObject.type === KeyboardEventType.KEY_TYPE_DOWN) {
                            eventObject.preventDefault();
                        } else {
                            eventObject.execute(
                                () => this.router.navigate(['xfm/' + item.link + '/'])
                            );
                        }
                    }
                });
            });
    }


    get currentRuntimeContext(): RuntimeContext {
        return this.apiService.runtimeContext;
    }


    changeRuntimeContext() {
        // open dialog callback
        const openRuntimeContextSelectionDialog = (settings?: RuntimeContextSelectionSettings) => {
            this.dialogService.custom(RuntimeContextSelectionComponent, settings).afterDismiss().subscribe();
        };
        // notify any observers otherwise, just open the dialog
        if (this.apiService.runtimeContextSelectionSubject.observers.length) {
            this.apiService.runtimeContextSelectionSubject.next(openRuntimeContextSelectionDialog);
        } else {
            openRuntimeContextSelectionDialog();
        }
    }
}
