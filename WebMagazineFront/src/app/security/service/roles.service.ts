import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { Direccion } from 'src/app/ecommerce/models/direccion';
import { EmailDTO } from 'src/app/security/models/email-dto';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/usuario';
import { Rol } from 'src/app/newsletter/models/Rol';
const EMAIL = 'email';
const ROL = 'rol';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient) { }

  endpoint: string = environment.urlAPI;
  endpointBack: string = environment.urlBack;

  getRolesFromUsuario(usuario: Usuario): Observable<Rol[]> {   
    return this.http.get<any>(this.endpoint + "/usuarios/search/getRolesFromUsuario/" + usuario.id).pipe(map(response=>response._embedded.roles));
  }

}