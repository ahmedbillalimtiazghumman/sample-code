import {Component, OnDestroy, OnInit} from '@angular/core';
import {map, take} from "rxjs/operators";
import {IApplicationDetails} from "../../../../models/application-detials.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {EligibilityRules} from "../../../../models/application-details.enum";
import { ROUTES, SESSION_KEYS } from 'apps/angular-portal/src/app/shared/constants/urls';
import { SessionStorageService } from 'ngx-webstorage';
import { ClientAddressService } from 'apps/angular-portal/src/app/services/client-address-services/client-address.service';
import get from 'lodash/get';
import { Country } from 'apps/angular-portal/src/app/models/country.interface';
import { Observable } from 'rxjs';
import { ACCOUNT_STATUSES, INTENDED_VALUES } from 'apps/angular-portal/src/app/shared/constants/values';
import { ApplicationDetailsService } from '../../../request-services/request-details/application-details.service';
import { InitiateApplicationService } from 'apps/angular-portal/src/app/services/initiate-application.service';

@Component({
    selector: 'sw-request-details',
    templateUrl: './request-details.component.html',
    styleUrls: ['./request-details.component.scss']
})
export class RequestDetailsComponent implements OnInit, OnDestroy {

    activeState = true;
    applicationDetails$ = this.activatedRoute.data.pipe(map((data) => data.applicationDetails as IApplicationDetails));
    residentialStates = [
        {key:"Own",value:"1"},
        {key:"Rent",value:"2"},
        {key:"Live with parents",value:"3"},
        {key:"Room and board",value:"4"},
        {key:"Other",value:"5"}
    ]
    viewClientURL = 'view-client-url';
    stepperInfoBar: any = {
        type: 'MCA_APPLICATION_STEPPER',
        link: this.viewClientURL
      };
      countriesList = [];
      revealCountry = false;
      showCoApplicantInfo$ = this.initiateApplicationService.secondApplicant$;
      requestApplicants:any;
      coApplicantInfoBar = {}; 

    accountUsages = [
      { label: 'Car', value: INTENDED_VALUES.CAR },
      { label: "Education/Child's Education", value: INTENDED_VALUES.CHILD_EDUCATION },
      { label: 'Extra Retirement savings', value: INTENDED_VALUES.RETIREMENT_SAVINGS },
      { label: 'Vacation', value: INTENDED_VALUES.VACATION },
      { label: 'Direct Deposit of Payroll or Pension Inc', value: INTENDED_VALUES.DIRECT_DEPOSIT },
      { label: 'Expenses(Household/Family)', value: INTENDED_VALUES.EXPENSES },
      { label: 'Emergency Fund', value: INTENDED_VALUES.EMERGENCY_FUND },
      { label: 'Home', value: INTENDED_VALUES.HOME },
    ];

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private $sessionStorage: SessionStorageService,
        private clientAddressService: ClientAddressService,
        private applicationDetailsService: ApplicationDetailsService,
        private initiateApplicationService:InitiateApplicationService
    ) {
    }

    ngOnInit() {
    const customerInfo = this.$sessionStorage.retrieve(SESSION_KEYS.CUSTOMER);
        const cif = this.$sessionStorage.retrieve(SESSION_KEYS.CUSTOMER_CIF);
        const mcaReqId = this.$sessionStorage.retrieve(SESSION_KEYS.MCA_REQUEST_ID);
        if (!customerInfo || !cif || !mcaReqId) {
            return;
        }
        const customerFullName = `${customerInfo.firstName ? customerInfo.firstName : customerInfo.name} ${customerInfo.lastName ? customerInfo.lastName : ''}`;

        this.stepperInfoBar = {
          ...this.stepperInfoBar,
          ...customerInfo,
          cif: cif,
          requestId: mcaReqId,
          name: customerFullName
        };

        // Display co Apllicant info bar 
        this.applicationDetails$.subscribe(request =>{
          this.requestApplicants = request?.details?.stakeHolders?.applicants;
          if (this.requestApplicants.length > 1) {
                  //  Two Applicants
                  const coApplicantInfo = this.applicationDetailsService.getCoApplicantDetails(this.requestApplicants[1]);
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
                   requestId: mcaReqId,
                   name: coApplicantInfo.name
                 }
                 
          }
          
      })

        // this.getCountriesData()
    }

    eligibilityRule(ruleId: string, rulesStatus): EligibilityRules {
      if (ruleId == 'SIN_CHECK' && rulesStatus == 'FAIL') {
        ruleId = 'SIN_CHECK_FAILED'
      }
        return EligibilityRules[ruleId];
    }

      truncateDecimal(decimal:number){
          let extendedDecimal = decimal * 100;
          const decimalLength = this.countDecimals(extendedDecimal);
          if (decimalLength > 2) {
              return Math.round(extendedDecimal).toFixed(2);
          }else{
              return extendedDecimal
          }

    }
    countDecimals(value){
        if(Math.floor(value) === value) return 0;
        return value.toString().split(".")[1].length || 0;
    }

   maskSin(sin){
    const firstDigitStr = String(sin)[0];
    return firstDigitStr + '** *** ***';

   }

    sortRules(rules:any){
        let sortedRules = [];
        if (rules) {
          rules.map((rule) => {
            if (rule.ruleId === "RESIDENT_CANADA") {
              sortedRules.splice(0,0,rule)
            }
            if (rule.ruleId === "RESIDENT_QUEBEC") {
              sortedRules.splice(1,0,rule)
            }
            if (rule.ruleId === "SIN_CHECK") {
              sortedRules.splice(2,0,rule)
            }
            if (rule.ruleId === "AGE_OF_MAJORITY") {
              sortedRules.splice(3,0,rule)
            }
            if (rule.ruleId === "ACTIVE_DEBIT_CARD") {
              sortedRules.splice(4,0,rule)
            }
            if (rule.ruleId === "CLOSE_FOR_CAUSE") {
              sortedRules.splice(5,0,rule)
            }

          });
        }
        return sortedRules
      }

       formatPhoneNumber(phoneNumberString: string = ''): string {
        const cleaned = ('' + phoneNumberString).replace(/\D/g, '')
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
        if (match) {
            return `(${match[1]})-${match[2]}-${match[3]}`
        }
        return ''
    }
    checkResidentialStatus(residentialStatus){
        let rStatus = '';
        if (residentialStatus) {
            this.residentialStates.map(rs=>{
                if (rs.value == residentialStatus) {
                    rStatus = rs.key;
                    return rStatus
                }
            })
        }
        return rStatus;
    }


      getCountriesList(): Observable<Country[]> {
        return this.clientAddressService
            .fetchCountriesList()
            .pipe(
                map(entry => {
                    const {mappingSet} = entry;
                    return mappingSet.map(country => {
                        const {values} = country as any;
                        const countryObj = {};
                        return values.map(value => {
                            if (['CountryCode', 'CountryName'].includes(value.key)) {
                                countryObj[value.key] = value.value;
                            }
                            return countryObj;
                        })[0];
                    });
                })
            )
    }

    getCountriesData(){
      this.getCountriesList().pipe(take(1)).subscribe(res=>{
        if (res) {
          this.countriesList = res;
          this.revealCountry = true;
        }
      })
    }

  getCountry(countryId){
    if (this.countriesList.length) {
      const country = this.countriesList.filter(country => (country.CountryCode == countryId))[0] as any;
      if (country && country.CountryName) {
        return country.CountryName
      }
      return ''
    }
  }

    goToRequestHistory() {
        // this.$sessionStorage.store(SESSION_KEYS.APPLICATION_DETAIL, application);
        this.router.navigate([ROUTES.REQUEST_HISTORY]);
    }

    goToDashboard(){
      this.router.navigate([ROUTES.CUSTOMER_PROFILE]);
    }

    trimString(key:string){
      let word = '';
      const result = key.split(/(?=[A-Z])/);
      if (result.length) {
       result.map(result => {
        word +=   result + ' '
        })
      }
      return word;
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

    getIntentdedUse(value) {
      return this.accountUsages.find(ac => ac.value == value).label
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
