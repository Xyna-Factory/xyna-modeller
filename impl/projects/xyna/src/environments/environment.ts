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
import { ZetaEnvironment } from '@zeta/api';
import { RuntimeContext } from '@zeta/api/xo/xo-describer';


// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment: ZetaEnvironment = {
    production: false,
    zeta: {
        url: 'https://host-ip-address:host-port/modeller-api/',
        xo: {
            runtimeContext: RuntimeContext.fromApplication('GuiHttp'),
            consistencyCheck: false
        },
        auth: {
            smartCardLogin: false,
            credentialsLogin: true,
            languages: [
                { label: 'English', languageKey: 'en-US' },
                { label: 'Deutsch', languageKey: 'de-DE' }
            ]
        }
    }
};
