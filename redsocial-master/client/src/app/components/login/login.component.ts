import { ActivatedRoute, Params , Router} from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { User } from '../../Models/user';    // Modelo
import { UserService } from 'app/Services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [] ,
  providers: [UserService]
})
export class LoginComponent implements OnInit {
  public title: string ;
  public user : User ;
  public status : String ;
  constructor(
    private _route : ActivatedRoute ,
    private _router : Router , 
    private _userService : UserService
  ) {
     this.title = "Identificate";
     this.user = new User (
      '' ,
      '' ,
      '' ,
      '' ,
      '' ,
      '' ,
      'ROLE_USER' ,  
      '' ,
      ''  );
   }

  ngOnInit() {
  }

  onSubmit(form){ 
      this._userService.login(this.user).subscribe(
        response=>{
          console.log(response.user);
        }
        ,
        error=>{
          var errorMessage = <any>error ;
          console.log(errorMessage);

          if( errorMessage){
            this.status = error ;
          }
        });
  }


}
