import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Application, Domain, Certificate,APIResponse, Destination, IPMethod } from '../models';
import { ApplicationService } from '../application.service'; 
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.css']
})
export class ApplicationDetailComponent implements OnInit {
  @Input() application: Application;
  readOnlyValue: boolean = true;
  readOnlyButtonText: string = "Edit"
  certIcon: string = "assets/images/cert.png";
  optionCertificates: Certificate[];
  no_certificate:Certificate;
  enum_ip_method_values: number[]=[];

  constructor(    
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private router: Router,
    private messageService: MessageService,
    private http: HttpClient
  ) {
    /*
    route.params.forEach(params => {
      this.getApplication();
    });
    */
  }

  getApplication(): void {
    const id = +this.route.snapshot.paramMap.get('id');    
    if(id>0) {
      var self = this;
      this.applicationService.getResponse('getapp', function(obj: Application){
        self.application = obj;
      },id);
    } else {
      this.readOnlyValue = false;
      this.application=new Application();
      this.application.id=0;
      this.application.internal_scheme="http";
      this.application.redirect_https=true;
      this.application.hsts_enabled=true;
      this.application.waf_enabled=true;
      this.application.domains=[];
      this.application.ip_method=1;
      this.application.destinations=[];
      this.addDomain();
      this.addDestination();
    }
  }

  setApplication() {
    var self=this;
    this.applicationService.getResponse('updateapp', function(obj: Application){
      let new_id = obj.id;
      if(self.application.id == new_id)  {
        self.application = obj;
      }       
      else {
        self.application.id = new_id;
        self.router.navigate(['/application/'+ new_id]);
      }
      self.readOnlyValue = true;
      self.readOnlyButtonText="Edit";
      self.messageService.add("Application "+ obj.name +" Saved.");
    }, null, self.application);
  }

  deleteApplication() {
    if(!confirm("Are you sure to delete application: "+this.application.name+"?")) return;
    var self = this;
    this.applicationService.getResponse('delapp',function(){
      self.messageService.add(self.application.name +" deleted.");                  
      self.router.navigate(['/applications']);
    },this.application.id,null);
  }

  addDestination(): void {
    if(this.readOnlyValue) return;
    var new_dest: Destination=new Destination();
    new_dest.id = 0;
    new_dest.destination = "";
    new_dest.app_id = this.application.id;
    new_dest.node_id = 0;
    this.application.destinations.push(new_dest);
    //console.log(this.application.destinations);
  }

  delDestination(i: number): void {
    if(this.readOnlyValue) return;
    if(this.application.destinations.length==1) {
      alert("At least one item is required!");
      return;
    }
    this.application.destinations.splice(i,1);
    //console.log(this.application.destinations);
  }

  showDestDialog(i:number) {
    let dest = this.application.destinations[i];
    
  }

/*
  addStaticDir():void{
    if(this.readOnlyValue) return;
    this.application.static_dirs.push("");
    console.log(this.application.static_dirs);
  }

  delStaticDir(i:number):void{
    if(this.readOnlyValue) return;
    if(this.application.static_dirs.length==1) {
      alert("At least one item is required, keep it empty if not required !");
      return;
    }
    this.application.static_dirs.splice(i,1);
    console.log(this.application.static_dirs);
  }
*/

  addDomain():void{
    if(this.readOnlyValue) return;
    var new_domain: Domain=new Domain();
    new_domain.name="";
    new_domain.id=0;
    new_domain.app_id=this.application.id;
    new_domain.cert_id=0;
    this.application.domains.push(new_domain);
    //console.log(this.application.domains);
  }


  delDomain(i:number):void{
    if(this.readOnlyValue) return;
    if(this.application.domains.length==1) {
      alert("At least one item is required!");
      return;
    }
    this.application.domains.splice(i,1);
    //console.log(this.application.domains);
  }
  
  ngOnInit() {
    //init IPMethod enum
    var enum_ip_method_values = Object.values(IPMethod);
    var ip_method_length = (enum_ip_method_values.length)/2;
    this.enum_ip_method_values = enum_ip_method_values.slice(ip_method_length);  
    
    if(this.applicationService.domains==null || this.applicationService.domains.length==0) {
      this.applicationService.getDomains();
    }
    if(this.applicationService.certificates==null || this.applicationService.certificates.length==0) {
      this.applicationService.getCertificates();
    }    
    this.getApplication();
    this.no_certificate = new Certificate();
    this.no_certificate.id=0;
    this.no_certificate.common_name='No Certificate (HTTP Only)';
    this.getCertificates();
  }


  getCertificates() {
    var self = this;
    this.applicationService.getResponse('getcerts', function(obj: Certificate[]){
      self.optionCertificates = obj.concat(self.no_certificate);
    });
  }


  trackByFn(index: any, item: any) {
    return index;
  }
 
  changeEditable() {
    this.readOnlyValue = !this.readOnlyValue;
    if(this.readOnlyValue) {
      this.readOnlyButtonText="Edit";
    } else {
      this.readOnlyButtonText="Cancel";
    }
  }

  getIPMethodEnumString(value: number) {
    return IPMethod[value];
  }


}
