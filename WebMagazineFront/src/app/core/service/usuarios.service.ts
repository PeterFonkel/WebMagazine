import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { Direccion } from 'src/app/ecommerce/models/direccion';
import { Usuario } from 'src/app/newsletter/models/usuario';
import { EmailDTO } from 'src/app/security/models/email-dto';
import { TokenDTO } from 'src/app/security/models/token-dto';
import { environment } from 'src/environments/environment';
const EMAIL = 'email';
const ROL = 'rol';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http: HttpClient) { }

  endpoint: string = environment.urlAPI;
  endpointBack: string = environment.urlBack;

  getUsuarios(): Observable<Usuario[]> {   
    return this.http.get<any>(this.endpoint + "/usuarios").pipe(map(response=>response._embedded.usuarios));
  }

  getUsuariosFromUrls(urls: string[]): Observable<Usuario[]> {   
    const requests = urls.map(url => this.http.get<Usuario>(url));
    return forkJoin(requests);
  }

  getDireccionPorUrl(url: string): Observable<Direccion>{
    //para simplificar devolvemos la primera direccion, cambiar si se quiere implementar que un usuario tenga varias direcciones
    return this.http.get<any>(url).pipe(map(response=>response._embedded.direcciones[0]));
  }

  extraerUrlDireccionUsuario(usuario: any): string{
    return usuario._links.direcciones.href
  }

  extraerUrlUsuario(usuario: any): string{
    return usuario._links.usuario.href
  }

  extraerUrlDireccion(direccion: any): string {
    return direccion._links.self.href
  }

  getUsuario(url: string): Observable<Usuario>{
    return this.http.get<Usuario>(url);
  }

  getId(p: any): string {
    let url = p._links.self.href;
    let trozos = url.split("/");
    return trozos[trozos.length - 1];
  }
  getUsuarioFromEmail(email: string): Observable<Usuario>{
    let emailDto = new EmailDTO();
    emailDto.value = email;
    return this.http.post<any>(this.endpointBack + "/usuarios/search/usuarioFromEmail", emailDto)
  }
  public setUser(email: string): void {
    sessionStorage.removeItem(EMAIL);
    sessionStorage.setItem(EMAIL, email);
  }
  public setRol(rol: string): void {
    sessionStorage.removeItem(ROL);
    sessionStorage.setItem(ROL, rol);
  }

}
