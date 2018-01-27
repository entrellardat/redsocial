import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { RegisterComponent } from 'app/components/register/register.component';
import { LoginComponent } from 'app/components/login/login.component';
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';

const APP_ROUTES: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent },
];

export const appRoutingProviders : any[] = [];
export const routing : ModuleWithProviders = RouterModule.forRoot(APP_ROUTES);

