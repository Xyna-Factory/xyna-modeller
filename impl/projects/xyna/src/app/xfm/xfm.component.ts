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
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { RIGHT_FACTORY_MANAGER } from '@fman/const';
import { FactoryManagerName, FactoryManagerVersion } from '@fman/version';
import { ProcessModellerName, ProcessModellerVersion } from '@pmod/version';
import { MessageBusService } from '@yggdrasil/events';
import { YggdrasilName, YggdrasilVersion } from '@yggdrasil/version';
import { ApiService, RuntimeContext, RuntimeContextSelectionSettings, XoRuntimeContext } from '@zeta/api';
import { RightsInterceptor } from '@zeta/api/rights.interceptor';
import { AuthService } from '@zeta/auth';
import { AuthEventService } from '@zeta/auth/auth-event.service';
import { KeyboardEventType, KeyDistributionService } from '@zeta/base';
import { I18nService, LocaleService } from '@zeta/i18n';
import { RuntimeContextSelectionComponent } from '@zeta/nav';
import { XcDialogService, XcMenuItem, XcMenuServiceDirective, XcNavListItem, XcNavListOrientation, XcStatusBarComponent } from '@zeta/xc';

import { debounceTime } from 'rxjs/operators';

import { I18nModule } from '../zeta/i18n/i18n.module';
import { XcModule } from '../zeta/xc/xc.module';
import { RIGHT_ACM } from './acm/const';
import { AccessControlManagementName, AccessControlManagementVersion } from './acm/version';
import { xfm_translations_de_DE } from './locale/xfm-translations.de-DE';
import { xfm_translations_en_US } from './locale/xfm-translations.en-US';
import { RIGHT_PROCESS_MODELLER } from './processmodeller/const';
import { ModellerSettingsDialogComponent } from './processmodeller/modeller-settings-dialog/modeller-settings-dialog.component';
import { RIGHT_PROCESS_MONITOR } from './processmonitor/const';
import { ProcessMonitorName, ProcessMonitorVersion } from './processmonitor/version';
import { APPLICATION_TEST_FACTORY, RIGHT_TEST_FACTORY } from './testfactory/const';
import { TestFactoryName, TestFactoryVersion } from './testfactory/version';


@Component({
    templateUrl: './xfm.component.html',
    styleUrls: ['./xfm.component.scss'],
    imports: [XcModule, I18nModule, XcMenuServiceDirective, RouterOutlet]
})
export class XfmComponent implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly dialogService = inject(XcDialogService);
    private readonly authService = inject(AuthService);
    readonly authEvents = inject(AuthEventService);
    private readonly i18n = inject(I18nService);
    private readonly keyService = inject(KeyDistributionService);
    private readonly router = inject(Router);
    readonly messageBus = inject(MessageBusService);


    readonly navListItems: XcNavListItem[] = [];
    readonly navListOrientation = XcNavListOrientation.TOP;

    readonly usermenuItems: XcMenuItem[] = [];
    readonly applicationVersions: string[];

    @ViewChild(XcStatusBarComponent)
    statusBar: XcStatusBarComponent;

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
        this.i18n.setTranslations(LocaleService.DE_DE, xfm_translations_de_DE);
        this.i18n.setTranslations(LocaleService.EN_US, xfm_translations_en_US);

        const navListItems = [
            { link: 'Process-Modeller', icon: 'processmodeller', iconStyle: 'modeller', name: ProcessModellerName, class: 'processmodeller', tooltip: this.i18n.translate('xfm.processmodeller-tooltip') },
            { link: 'Factory-Manager', icon: 'factorymanager', iconStyle: 'modeller', name: FactoryManagerName, class: 'factorymanager', tooltip: this.i18n.translate('xfm.factorymanager-tooltip') },
            { link: 'Process-Monitor', icon: 'processmonitor', iconStyle: 'modeller', name: ProcessMonitorName, class: 'processmonitor', tooltip: this.i18n.translate('xfm.processmonitor-tooltip') },
            { link: 'Test-Factory', icon: 'testfactory', iconStyle: 'modeller', name: TestFactoryName, class: 'testfactory', tooltip: this.i18n.translate('xfm.testfactory-tooltip') },
            { link: 'acm', icon: 'testfactory', iconStyle: 'modeller', name: AccessControlManagementName, class: 'acm', tooltip: this.i18n.translate('xfm.acm-tooltip') }
        ];

        this.apiService.getRuntimeContexts(false).subscribe({
            next: (rtcArr: XoRuntimeContext[]) => {

                const hasTestFactoryRTC = rtcArr.some(rtc => rtc.name === APPLICATION_TEST_FACTORY);

                [
                    RIGHT_PROCESS_MODELLER,
                    RIGHT_FACTORY_MANAGER,
                    RIGHT_PROCESS_MONITOR,
                    RIGHT_TEST_FACTORY,
                    RIGHT_ACM
                ].forEach((right, idx) => {
                    if (this.authService.hasRight(right)) {
                        if (right === RIGHT_TEST_FACTORY) {
                            if (hasTestFactoryRTC) {
                                this.navListItems.push(navListItems[idx]);
                            }
                        } else {
                            this.navListItems.push(navListItems[idx]);
                        }
                    }
                });

            },
            error: error => this.dialogService.error(error)
        });

        this.applicationVersions = [
            ['Xyna Factory Server', this.authEvents.sessionInfoSubject.value?.xynaVersion ?? ''],
            [ProcessModellerName, ProcessModellerVersion],
            [FactoryManagerName, FactoryManagerVersion],
            [ProcessMonitorName, ProcessMonitorVersion],
            [TestFactoryName, TestFactoryVersion],
            [AccessControlManagementName, AccessControlManagementVersion],
            [YggdrasilName, YggdrasilVersion]
        ].map(version => version.join(': '));

        this.usermenuItems.push(
            <XcMenuItem>{
                name: this.authService.username,
                icon: 'user',
                disabled: true
            },
            <XcMenuItem>{
                name: this.i18n.translate('xfm.settings'), icon: 'settings',
                click: () => this.dialogService.custom(ModellerSettingsDialogComponent)
            },
            <XcMenuItem>{
                name: 'Logout',
                icon: 'arrowleft',
                click: () => this.authService.logout().subscribe()
            }
        );

        RightsInterceptor.errorChange.pipe(
            debounceTime(500)
        ).subscribe({
            next: errorObject => this.dialogService.error(this.i18n.translate(errorObject.message), null, errorObject.exceptionMessage)
        });

        this.messageBus.startUpdates();
        this.authEvents.didLogout.subscribe({
            next: () => {
                // reload page on logout (triggered by user or loss of session) to cleanup cache
                window.location.reload();
                this.messageBus.stopUpdates();
            }
        });
    }


    ngOnInit() {
        this.keyService.keyEvents
            .subscribe({
                next: eventObject => {
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
                }
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

    openWiki() {
        window.open('https://github.com/Xyna-Factory/xyna/wiki', '_blank');
    }
}
