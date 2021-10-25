import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';

import { HttpClientModule } from '@angular/common/http';
import { ModalComponent } from './modal/modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ResultadoComponent } from './resultado/resultado.component';
import { ErroresComponent } from './errores/errores.component';

@NgModule({
	declarations: [
		AppComponent,
		EditorComponent,
		ModalComponent,
  ResultadoComponent,
  ErroresComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		BrowserAnimationsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
