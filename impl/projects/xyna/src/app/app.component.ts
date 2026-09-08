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
import { ChangeDetectorRef, Component, inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { RouterOutlet } from '@angular/router';
import { I18nService, LocaleService } from '@zeta/i18n';
import { AppTitleComponent } from '@zeta/nav';
import { XcMenuTriggerDirective } from '@zeta/xc';
import { XcContextMenuService } from '@zeta/xc/xc-menu/xc-context-menu.service';

import { XcMenuComponent } from './zeta/xc/xc-menu/xc-menu.component';
import { XcMenuService } from './zeta/xc/xc-menu/xc-menu.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [XcMenuComponent, RouterOutlet, XcMenuTriggerDirective, MatMenuModule],
})
export class AppComponent extends AppTitleComponent {

  protected readonly localeService = inject(LocaleService);
  protected readonly i18nService = inject(I18nService);
  protected readonly menuService = inject(XcMenuService);
  protected readonly contextMenuService = inject(XcContextMenuService);
  private readonly cdr = inject(ChangeDetectorRef);

  title = 'Xyna';

  constructor() {
    super();
    this.i18nService.contextDismantlingSearch = true;

    // OnPush needs an explicit change detection trigger when the locale changes,
    // since it is not driven by an @Input(), signal or async pipe.
    this.localeService.languageChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  // TODO: Skipped for migration because:
  //  Accessor queries cannot be migrated as they are too complex.
  @ViewChild(XcMenuComponent)
  set menu(value: XcMenuComponent) {
    this.menuService.component = value;
  }

  // TODO: Skipped for migration because:
  //  Accessor queries cannot be migrated as they are too complex.
  @ViewChild('contextMenuTrigger', {
    read: XcMenuTriggerDirective
  })

  set contextTrigger(value: XcMenuTriggerDirective) {
    this.contextMenuService.trigger = value;
  }

  // Performance Leak Detection:
  // remove comment slashes from following code to check for unnecessary detection changes

  // tslint:disable-next-line: use-life-cycle-interface
  // ngAfterViewChecked() {
  //     console.count('ngAfterViewChecked@XfmComponent');
  // }
}
