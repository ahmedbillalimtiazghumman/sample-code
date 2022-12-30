import {Injectable} from '@angular/core';
import {
    Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';
import {Observable, of} from 'rxjs';
import { SESSION_KEYS } from '../../../shared/constants/urls';
import {ApplicationDetailsService} from "../../request-services/request-details/application-details.service";
import {IApplicationDetails} from "../../../models/application-detials.interface";

@Injectable({
    providedIn: 'any'
})
export class ApplicationDetailsResolver implements Resolve<IApplicationDetails> {
    constructor(private applicationDetailsService: ApplicationDetailsService,
        private $sessionStorage: SessionStorageService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IApplicationDetails> {
        this.$sessionStorage.store(SESSION_KEYS.MCA_REQUEST_ID, route.queryParams['id']);
        return this.applicationDetailsService.getApplicationDetails(route.queryParams['id'] as number);
    }
}
