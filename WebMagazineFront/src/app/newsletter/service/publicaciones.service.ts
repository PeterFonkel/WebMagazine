import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Publicacion } from '../models/publicacion';
import { environment } from 'src/enviroments/enviroment';
import { Autor } from '../models/autor';
import { Tag } from '../models/Tag';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesServiceService {
  endpoint: string = environment.urlAPI;

  constructor(private http: HttpClient) { }

  getPublicaciones(): Observable<Publicacion[]>{
    return this.http.get<any>(this.endpoint + "/publicaciones").pipe(map(response=>response._embedded.publicaciones))
  }

  getPublicacionesDestacadas(): Observable<Publicacion[]>{
    return this.http.get<any>(this.endpoint + "/publicaciones/search/publicacionesDestacadas").pipe(map(response=>response._embedded.publicaciones))
  }

  postPublicacion(publicacion: Publicacion): Observable<Publicacion>{
    return this.http.post<any>(this.endpoint + "/publicaciones", publicacion).pipe(map(response=>response.publicacion))
  }

  getId(p: any): string {
    let url = p._links.self.href;
    let trozos = url.split("/");
    return trozos[trozos.length - 1];
  }
  getAutorFromPublicacion(publicacion: any): Observable<Autor> {
    return this.http.get<any>(publicacion._links.autor.href);
  }
  getTagsFromPublicacion(publicacion: any): Observable<Tag[]> {
    return this.http.get<any>(publicacion._links.tags.href).pipe(map(response=>response._embedded.tags))
    ;
  }
  
  getPublicacion(id: string): Observable<Publicacion>{
    return this.http.get<any>(this.endpoint + "/publicaciones/" + id)
  }
}