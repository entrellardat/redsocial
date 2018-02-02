import { Component, OnInit} from '@angular/core';
import { Router , ActivatedRoute , Params } from '@angular/router' ;
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { UserService } from 'app/Services/user.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: [] ,
  providers: [UserService]
})
export class RegisterComponent implements OnInit {
  title : String  ;
  public user : User ;
  status : String ;
  constructor(
    private _route: ActivatedRoute ,
    private _router: Router ,
    private _userService: UserService
  ) { 
      this.title = 'Registrate';
      this.user = new User (  
          '' ,
          '' ,
          '' ,
          '' ,
          '' ,
          '' ,
          'ROLE_USER' ,
          '' 
      );
  }

  ngOnInit() {
  }

  onSubmit(form){
   this._userService.register(this.user).subscribe(response=>
   {
      console.log('entro');
      if(response.user && response.user._id){
        this.status = 'success';
        // resetear formulario
        form.reset();
      }
      else{
        this.status = 'error';
      }
   },
   error=>{
      console.log(<any>error)
   });
  
}

}
