import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ApplicationDetailsComponent} from './application-details.component';
import {RouterModule, Routes} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {FdsLibAngularModule} from "@mobilelivenpm/fds-angular";
import {ApplicationDetailsService} from "../request-services/request-details/application-details.service";
import {ApplicationDetailsResolver} from "./resolver/application-details.resolver";
import {RequestDetailsComponent} from "./components/request-details/request-details.component";
import {RequestStatusComponent} from "./components/request-status/request-status.component";
import { SharedModule } from '../../shared/shared.module';


const routes: Routes = [
    {
        path: 'details',
        component: RequestDetailsComponent,
        resolve: {
            applicationDetails: ApplicationDetailsResolver
        },
        data: {
            pageTitle: 'application-details.details-title'
        }
    },
    {
        path: 'status',
        component: RequestStatusComponent,
        resolve: {
            applicationDetails: ApplicationDetailsResolver
        },
        data: {
            pageTitle: 'application-details.status-title'
        }
    }
];


@NgModule({
    declarations: [
        ApplicationDetailsComponent,
        RequestDetailsComponent,
        RequestStatusComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,
        FdsLibAngularModule,
        SharedModule
    ],
    providers: [
        ApplicationDetailsService,
        ApplicationDetailsResolver
    ]
})
export class ApplicationDetailsModule {
}
