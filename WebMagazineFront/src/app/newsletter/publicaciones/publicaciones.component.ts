import { Component, OnInit } from '@angular/core';
import { Publicacion } from '../models/publicacion';
import { PublicacionesServiceService } from '../service/publicaciones.service';
import { ImagenInicio } from '../models/imagenInicio';
import { ImagenesService } from '../service/imagenes.service';
import { Router } from '@angular/router';
import { LateralServiceService } from '../service/lateral.service';
import { Lateral } from '../models/lateral';
import { MetaService } from '../service/meta.service';
declare const twttr: any;

@Component({
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.css']
})
export class PublicacionesComponent implements OnInit {
  publicaciones: Publicacion[] = [];
  publicacionesDestacadas: Publicacion[] = [];
  publicacionesCarousel: Publicacion[] = [];
  urlImagenLateralDerecha: string = "";
  imagenInicioDerecha: ImagenInicio = new ImagenInicio();
  imagenInicioIzquierda: ImagenInicio = new ImagenInicio();
  imagenInicioCentral: ImagenInicio = new ImagenInicio();
  tituloUrl: string = "";
  lateral: Lateral = new Lateral();
  palabrasClave: string = "";
  rol: string | null = "";
  pagina: number = 0;

  constructor(
    private publicacionesService: PublicacionesServiceService,
    private imagenesService: ImagenesService,
    private router: Router,
    private lateralService: LateralServiceService,
    private metaService: MetaService) { }

  ngOnInit() {
    this.guardarLocalStorageMeta();
    this.setMetaTagsFromLocalStorage();
    this.getImagenesInicio();
    this.rol = sessionStorage.getItem('rol');
    if (this.rol == "ROLE_ADMIN" || this.rol == "ROLE_WRITER" || this.rol == "ROLE_USER_SUSCRIBED" || this.rol == "ROLE_USER_MEMBER") {
      this.getPublicacionesRecientes();
    } else {
      this.getPublicacionesRecientesFree();
    }
    this.getPublicacionesDestacadas();
    this.getPublicacionesCarousel();
    this.getLateral();
  }

  /* Publicaciones recientes - 12 ultimas */
  getPublicacionesRecientes() {
    this.publicaciones = [];
    this.publicacionesService.getPublicacionesRecientes().subscribe(publicaciones => {
      this.publicaciones = publicaciones;
      this.publicaciones.forEach(publicacion => {
        publicacion.id = this.publicacionesService.getId(publicacion);
        this.publicacionesService.getCategoriaFromPublicacion(publicacion).subscribe(categoria => {
          publicacion.categoria = categoria;
          this.publicacionesService.getAutorFromPublicacion(publicacion).subscribe(autor => {
            publicacion.autor = autor;

          })
        })
      });
    })
  }

  /* Publicaciones recientes - 12 ultimas */
  getPublicacionesRecientesFree() {
    this.publicaciones = [];
    this.publicacionesService.getPublicacionesRecientesFree().subscribe(publicaciones => {
      this.publicaciones = publicaciones;
      this.publicaciones.forEach(publicacion => {
        publicacion.id = this.publicacionesService.getId(publicacion);
        this.publicacionesService.getCategoriaFromPublicacion(publicacion).subscribe(categoria => {
          publicacion.categoria = categoria;
          this.publicacionesService.getAutorFromPublicacion(publicacion).subscribe(autor => {
            publicacion.autor = autor;

          })
        })
      });
    })
  }

  /* Publicaciones marcadas como destacadas */
  getPublicacionesDestacadas() {
    this.publicacionesDestacadas = [];
    this.publicacionesService.getPublicacionesDestacadas().subscribe(publicaciones => {
      this.publicacionesDestacadas = publicaciones;
      this.publicacionesDestacadas.forEach(publicacion => {
        publicacion.id = this.publicacionesService.getId(publicacion);
        this.publicacionesService.getCategoriaFromPublicacion(publicacion).subscribe(categoria => {
          publicacion.categoria = categoria;
          this.publicacionesService.getAutorFromPublicacion(publicacion).subscribe(autor => {
            publicacion.autor = autor;

          })
        })
      });
    })
  }

  /* Publicaciones agregadas al Carrusel */
  getPublicacionesCarousel() {
    this.publicacionesService.getPublicacionesCarousel().subscribe(publicacionesCarousel => {
      this.publicacionesCarousel = publicacionesCarousel;
      this.publicacionesCarousel.forEach(publicacionCarousel => {
        publicacionCarousel.id = this.publicacionesService.getId(publicacionCarousel);
        publicacionCarousel.subtitulo = publicacionCarousel.subtitulo.substring(0, 160) + "...";

      });
    })
  }

  /* Imagenes de inicio promo izda, central y dcha */
  getImagenesInicio() {
    this.imagenesService.getImagenesInicio().subscribe(imagenesInicio => {
      imagenesInicio.forEach(imagenInicio => {
        if (imagenInicio.posicion == "derecha") {
          this.imagenInicioDerecha = imagenInicio;
        }
        if (imagenInicio.posicion == "izquierda") {
          this.imagenInicioIzquierda = imagenInicio;
        }
        if (imagenInicio.posicion == "centro") {
          this.imagenInicioCentral = imagenInicio;
        }
      });
    })
  }

  /* routing a una publicacion a partir de su titulo */
  irAPublicacion(publicacion: Publicacion) {
    this.router.navigate(["/publicaciones/" + publicacion.url]);
  }

  /* Sección lateral con podcast y tweets */
  getLateral() {
    this.lateralService.getLateral().subscribe(lateral => {
      this.lateral = lateral;
      this.showHtmlPodcast();
      this.showHtmlPodcastSM();
      this.showHtmlTwitter();
    
    })
  }

  /* Mostrar los 3 tweets */
  showHtmlTwitter() {
    for (let index = 0; index < 4; index++) {
    var twitterContainer = document.querySelector("#twitter" + index);
    var tweetContainer = document.createElement('div');
    tweetContainer.classList.add('twitter-tweet');
    tweetContainer.innerHTML = this.lateral.htmlTwitter;
    twitterContainer?.appendChild(tweetContainer); 
    }
    this.loadTwitterWidgets();
  }

  /* Cargar los widgets de Twitter */
  loadTwitterWidgets() {
    if (twttr) {
      twttr.widgets.load();
    }
  }

  /* Mostrar el podcast */
  showHtmlPodcast() {
    var podcastContainer = document.querySelector("#podcast");
    var html = document.createElement("div");
    html.innerHTML = this.lateral.htmlPodcast;
    podcastContainer?.appendChild(html);
  }
/* Mostrar el podcast en pantallas pequeñas */
  showHtmlPodcastSM() {
    var podcastContainer = document.querySelector("#podcastSM");
    var html = document.createElement("div");
    html.classList.add("podcastSM-container");
    html.classList.add("justify-content-center");
    html.innerHTML = this.lateral.htmlPodcast;
    podcastContainer?.appendChild(html);
  }

  /* Buscador */
  buscarPublicacionesPorPalabras() {
    let palabrasClaveArray = this.palabrasClave.split(" ");
    const url = `/publicaciones-buscador/?palabrasClave=${encodeURIComponent(JSON.stringify(palabrasClaveArray))}`;
    this.router.navigateByUrl(url);
  }

  /* Navegar entre páginas */
  getPaginaSiguiente() {
    this.pagina++;
    /* Para usuarios con suscripcion */
    if (this.rol == "ROLE_ADMIN" || this.rol == "ROLE_WRITER" || this.rol == "ROLE_USER_SUSCRIBED" || this.rol == "ROLE_USER_MEMBER") {
      this.publicacionesService.getPublicacionesRecientesPagina(this.pagina).subscribe(publicaciones => {
        this.publicaciones = publicaciones;
        this.publicaciones.forEach(publicacion => {
          publicacion.id = this.publicacionesService.getId(publicacion);
          this.publicacionesService.getCategoriaFromPublicacion(publicacion).subscribe(categoria => {
            publicacion.categoria = categoria;
            this.publicacionesService.getAutorFromPublicacion(publicacion).subscribe(autor => {
              publicacion.autor = autor;
            })
          })
        });
      }, err => {
        /* Si no existe siguiente página volver a la que estaba */
        this.pagina--;
      })
    } else {
      /* Para usuarios sin suscripcion */
      this.publicacionesService.getPublicacionesRecientesFreePagina(this.pagina).subscribe(publicaciones => {

        if (publicaciones[0]!=undefined) {
          this.publicaciones = publicaciones;
        this.publicaciones.forEach(publicacion => {
          publicacion.id = this.publicacionesService.getId(publicacion);
          this.publicacionesService.getCategoriaFromPublicacion(publicacion).subscribe(categoria => {
            publicacion.categoria = categoria;
            this.publicacionesService.getAutorFromPublicacion(publicacion).subscribe(autor => {
              publicacion.autor = autor;
            })
          })
        });
        }else{
          this.pagina--;
        }
      }, err => {
        /* Si no existe siguiente página volver a la que estaba */
        this.pagina--;
      })
    }
  }

  getPaginaAnterior() {
    /* Para usuarios con suscripcion */
    if (this.rol == "ROLE_ADMIN" || this.rol == "ROLE_WRITER" || this.rol == "ROLE_USER_SUSCRIBED" || this.rol == "ROLE_USER_MEMBER") {
      if (this.pagina > 0) {
        this.pagina--;
        this.publicacionesService.getPublicacionesRecientesPagina(this.pagina).subscribe(publicaciones => {
          this.publicaciones = publicaciones;
          this.publicaciones.forEach(publicacion => {
            publicacion.id = this.publicacionesService.getId(publicacion);
            this.publicacionesService.getCategoriaFromPublicacion(publicacion).subscribe(categoria => {
              publicacion.categoria = categoria;
              this.publicacionesService.getAutorFromPublicacion(publicacion).subscribe(autor => {
                publicacion.autor = autor;
              })
            })
          });
        })
      }
    } else {
      /* Para usuarios sin suscripcion */
      if (this.pagina > 0) {
        this.pagina--;
        this.publicacionesService.getPublicacionesRecientesFreePagina(this.pagina).subscribe(publicaciones => {
          this.publicaciones = publicaciones;
          this.publicaciones.forEach(publicacion => {
            publicacion.id = this.publicacionesService.getId(publicacion);
            this.publicacionesService.getCategoriaFromPublicacion(publicacion).subscribe(categoria => {
              publicacion.categoria = categoria;
              this.publicacionesService.getAutorFromPublicacion(publicacion).subscribe(autor => {
                publicacion.autor = autor;
              })
            })
          });
        })
      }
    }
  }
  /* Guardar en localStorage los datos de las etiquetas meta */
  guardarLocalStorageMeta() {
    this.metaService.guardarLocalStorageMetaPaginaPrincipal();
  }

  /* Crear las meta tags */
  setMetaTagsFromLocalStorage() {
    this.metaService.setMetaTagsFromLocalStorage();
  }
}
