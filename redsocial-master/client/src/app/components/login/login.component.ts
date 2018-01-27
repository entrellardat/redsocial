import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  public title:string ;
  constructor() { 
     this.title = "Identificate";
   }

  ngOnInit() {
  }

}
