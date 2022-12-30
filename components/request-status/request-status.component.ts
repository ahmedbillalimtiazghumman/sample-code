import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";
import { SessionStorageService } from 'ngx-webstorage';
import { ROUTES, SESSION_KEYS } from 'apps/angular-portal/src/app/shared/constants/urls';
import { ApplicationDetailsService } from '../../../request-services/request-details/application-details.service';
import {IApplicationDetails} from "../../../../models/application-detials.interface";
import { ACCOUNT_STATUSES } from 'apps/angular-portal/src/app/shared/constants/values';
import { InitiateApplicationService } from 'apps/angular-portal/src/app/services/initiate-application.service';

@Component({
    selector: 'sw-request-status',
    templateUrl: './request-status.component.html',
    styleUrls: ['./request-status.component.scss']
})
export class RequestStatusComponent implements OnInit, OnDestroy {

    queryParam$: Observable<string>;
    applicationDetails$ = this.activatedRoute.data.pipe(map((data) => data.applicationDetails as IApplicationDetails));
    viewClientURL = 'view-client-url';
    mcaReqId = '';
    stepperInfoBar: any = {
        type: 'MCA_APPLICATION_STEPPER',
        link: this.viewClientURL
      };
      showCoApplicantInfo$ = this.initiateApplicationService.secondApplicant$;
      requestApplicants:any;
      coApplicantInfoBar = {}; 

    constructor(private activatedRoute: ActivatedRoute,
                private router: Router,
                private $sessionStorage: SessionStorageService,
                private applicationDetailsService: ApplicationDetailsService,
                private initiateApplicationService:InitiateApplicationService
    ) {
    }

    ngOnInit() {
        this.queryParam$ = this.activatedRoute.queryParams.pipe(map(qParams => qParams['id']));
        const customerInfo = this.$sessionStorage.retrieve(SESSION_KEYS.CUSTOMER);
        const cif = this.$sessionStorage.retrieve(SESSION_KEYS.CUSTOMER_CIF);
        this.mcaReqId = this.$sessionStorage.retrieve(SESSION_KEYS.MCA_REQUEST_ID);
        const customerFullName = `${customerInfo.firstName ? customerInfo.firstName : customerInfo.name} ${customerInfo.lastName ? customerInfo.lastName : ''}`;

        this.stepperInfoBar = {
          ...this.stepperInfoBar,
          ...customerInfo,
          cif: cif,
          requestId: this.mcaReqId,
          name: customerFullName
        };
        // Display co Apllicant info bar 
        this.applicationDetails$.subscribe(request =>{
            this.requestApplicants = request?.details?.stakeHolders?.applicants;
            if (this.requestApplicants.length > 1) {
                    //  Two Applicants
                    const coApplicantInfo = this.applicationDetailsService.getCoApplicantDetails(this.requestApplicants[1]);
                   //  this.$sessionStorage.store(SESSION_KEYS.MCA_COAPPLICANT, coApplicantInfo);
                    this.initiateApplicationService.coApplicantData$.subscribe(data => {
                      if (!Object.keys(data).length) {
                       this.initiateApplicationService.coApplicantData$.next(coApplicantInfo);
                       this.initiateApplicationService.showCoApplicantHeading$.next(true);
                      }
                    })
                    
                    this.coApplicantInfoBar = { 
                     ...this.stepperInfoBar,
                     ...coApplicantInfo,
                     cif: coApplicantInfo.ecifId,
                     requestId: this.mcaReqId,
                     name: coApplicantInfo.name
                   }
            }
            
        })

    }

    goToRequestHistory(){
        this.router.navigate([`/${ROUTES.REQUEST_HISTORY}`]);
    }


    refreshPage(): void {
        this.applicationDetails$ = this.applicationDetailsService.getApplicationDetails(parseInt(this.mcaReqId));
    }

    redirectToRequestDetails(id: string): void {
        this.router.navigate(['request/details'], {queryParams: {id}});
    }

    truncateDecimal(decimal:number){
        return Math.round(decimal * 100) / 100;
    }

    goToDashboard(){
        this.router.navigate([ROUTES.CUSTOMER_PROFILE]);
      }

      modifyRequestType(reqType , productCode){
        let modifyType = '';

        if (reqType === "APPL_DEPOSIT_SAVINGS") {
          modifyType = 'External Account Registration';
          if (productCode === 'deposit_foreigncurrency.savings.gbp') {
            modifyType+= ' GBP Savings'
          }
          if (productCode === 'deposit_foreigncurrency.savings.eur') {
            modifyType+= ' EUR Savings'
          }
          if (productCode === 'deposit_foreigncurrency.savings.inr') {
            modifyType+= ' INR Savings'
          }
          if (productCode === 'deposit_foreigncurrency.savings.php') {
            modifyType+= ' PHP Savings'
          }
          if (productCode === 'deposit_foreigncurrency.savings.cnh') {
            modifyType+= ' CNH Savings'
          }

          return modifyType
        }

        return reqType
      }
      enableRefresh(fullfilment){ 
        if (fullfilment.length > 1) {
            if ((fullfilment[0].accountNumber == null || fullfilment[0].accountNumber == '') || (fullfilment[1].accountNumber == null || fullfilment[1].accountNumber == '') ) {
                return true
            }
        }
        if (fullfilment.length > 0) {
            if (fullfilment[0].accountNumber == null || fullfilment[0].accountNumber == '') {
                return true
            }
        }
        return false
      }
      getAccountStatus(status) {
        if (status) {
          return ACCOUNT_STATUSES.find(ac => ac.key == status).value;
        } else {
          return "-"
        }
      }
      ngOnDestroy() {
        this.initiateApplicationService.coApplicantData$.next({});
        this.initiateApplicationService.showCoApplicantHeading$.next(false);
      }
      
}
