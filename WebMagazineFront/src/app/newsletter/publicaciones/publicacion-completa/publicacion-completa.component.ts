import { Component, OnInit, ViewChild } from '@angular/core';
import { Publicacion } from '../../models/publicacion';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicacionesServiceService } from '../../service/publicaciones.service';
import { LugaresServiceService } from '../../service/lugares.service';
import { TagsServiceService } from '../../service/tags.service';
import { CategoriasServiceService } from '../../service/categorias.service';
import { Lateral } from '../../models/lateral';
import { LateralServiceService } from '../../service/lateral.service';
import { UsuariosService } from 'src/app/security/service/usuarios.service';
import { LikesService } from '../../service/likes.service';
import { Like } from '../../models/like';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { paypalConfig } from 'src/environments/paypalConfig';
import { ModalReceiptComponent } from 'src/app/ecommerce/components/modal-receipt/modal-receipt.component';
declare const twttr: any;
declare var $: any;

@Component({
  selector: 'app-publicacion-completa',
  templateUrl: './publicacion-completa.component.html',
  styleUrls: ['./publicacion-completa.component.css']
})
export class PublicacionCompletaComponent implements OnInit {

  publicacion: Publicacion = new Publicacion();
  url: string = "";
  id: string = "";
  publicacionesCerca: Publicacion[] = [];
  publicacionesRelacionadas: Publicacion[] = [];
  fechaFormateada: string = "";
  lateral: Lateral = new Lateral();
  palabrasClave: string = "";
  rol: string | null = "";
  numeroLikes: string = "";
  keyWords: string = "";

  @ViewChild('modalVinoPaypal') modalPaypal: any;
  public payPalConfig?: IPayPalConfig;
  clientId: string = paypalConfig.clientId;


  constructor(
    private activatedRoute: ActivatedRoute,
    private publicacionesService: PublicacionesServiceService,
    private lugarService: LugaresServiceService,
    private tagService: TagsServiceService,
    private categoriaService: CategoriasServiceService,
    private router: Router,
    private lateralService: LateralServiceService,
    private usuarioService: UsuariosService,
    private likeService: LikesService,
    private modalService:  NgbModal) { }

  ngOnInit(): void {
    this.getLateral();
    this.getUrl();
    this.rol = sessionStorage.getItem("rol");
    if (this.rol == "ROLE_ADMIN" || this.rol == "ROLE_WRITER" || this.rol == "ROLE_USER_SUBSCRIBED" || this.rol == "ROLE_USER_MEMBER") {
      this.getPublicacion();
    } else {
      this.getPublicacionFree();
    }
  }

  getUrl(): void {
    this.activatedRoute.params.subscribe(params => {
      this.url = params['titulo'];
    })
  }

  getPublicacion(): void {
    this.publicacionesService.getPublicacion(this.url).subscribe(publicacion => {
      this.publicacion = publicacion;
      this.getFechaPublicacion();
      this.publicacion.id = this.publicacionesService.getId(publicacion);
      this.getLikes(this.publicacion);
      this.publicacionesService.getAutorFromPublicacion(publicacion).subscribe(autor => {
        this.publicacion.autor = autor;
      })
      this.publicacionesService.getTagsFromPublicacion(publicacion).subscribe(tags => {
        this.publicacion.tags = tags;
        this.publicacion.tags.forEach(tag => {
          tag.id = this.tagService.getId(tag);
        });
        this.getPublicacionesRelacionadas();
      })
      this.publicacionesService.getLugarFromPublicacion(publicacion).subscribe(lugar => {
        this.publicacion.lugar = lugar;
        this.publicacion.lugar.id = this.lugarService.getId(lugar);
        this.getPublicacionesCerca();
      })
      this.publicacionesService.getCategoriaFromPublicacion(publicacion).subscribe(categoria => {
        this.publicacion.categoria = categoria;
        this.publicacion.categoria.id = this.categoriaService.getId(categoria);
      })
      this.formatoContenidoMultimedia();
      this.showPublicacion();
      this.generarKeyWords();
      this.guardarLocalStorageMeta();


    })
  }

  getPublicacionFree() {
    this.publicacionesService.getPublicacionFree(this.url).subscribe(publicacion => {
      this.publicacion = publicacion;
      this.getFechaPublicacion();
      this.publicacion.id = this.publicacionesService.getId(publicacion);
      this.publicacionesService.getAutorFromPublicacion(publicacion).subscribe(autor => {
        this.publicacion.autor = autor;
      })
      this.publicacionesService.getTagsFromPublicacion(publicacion).subscribe(tags => {
        this.publicacion.tags = tags;
        this.publicacion.tags.forEach(tag => {
          tag.id = this.tagService.getId(tag);
        });
        this.getPublicacionesRelacionadas();
      })
      this.publicacionesService.getLugarFromPublicacion(publicacion).subscribe(lugar => {
        this.publicacion.lugar = lugar;
        this.publicacion.lugar.id = this.lugarService.getId(lugar);
        this.getPublicacionesCerca();
      })
      this.publicacionesService.getCategoriaFromPublicacion(publicacion).subscribe(categoria => {
        this.publicacion.categoria = categoria;
        this.publicacion.categoria.id = this.categoriaService.getId(categoria);
      })
      this.likeService.getLikes(publicacion.id).subscribe(likes => {
        this.numeroLikes = likes.length.toString();
      })
      this.formatoContenidoMultimedia()
      this.showPublicacion();
      this.generarKeyWords();
      this.guardarLocalStorageMeta();
    })
  }

  formatoContenidoMultimedia() {
    /*Formato de los videos de Youtube*/
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('<iframe class="ql-video ql-align-center" frameborder="0" allowfullscreen="true" src="https://www.youtube.com', '<div class="iframe-container d-flex justify-content-center"><iframe class="ql-video"allowfullscreen="true" tipo="youtube" src="https://www.youtube.com');
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('<iframe class="ql-video ql-align-center" allowfullscreen="true" src="https://www.youtube.com', '<div class="iframe-container d-flex justify-content-center"><iframe class="ql-video" allowfullscreen="true" tipo="youtube" src="https://www.youtube.com');

    /*Formato de los podcast de Spotify*/
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('<iframe style="border-radius:12px" src="https://open.spotify.com', '<div class="iframe-container d-flex justify-content-center"><iframe class="ql-video ql-align-center" allowfullscreen="true" tipo="podcast" src="https://open.spotify.com');
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('<iframe class="ql-video ql-align-center" src="https://open.spotify.com', '<div class="iframe-container d-flex justify-content-center"><iframe class="ql-video ql-align-center" allowfullscreen="true" tipo="podcast" src="https://open.spotify.com');
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('<iframe class="ql-video ql-align-center" allowfullscreen="true" src="https://open.spotify.com', '<div class="iframe-container d-flex justify-content-center"><iframe class="ql-video ql-align-center" allowfullscreen="true" tipo="podcast" src="https://open.spotify.com');
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('<iframe class="ql-video" src="https://open.spotify.com', '<div class="iframe-container d-flex justify-content-center"><iframe class="ql-video ql-align-center" allowfullscreen="true" tipo="podcast" src="https://open.spotify.com');
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('<iframe class="ql-video" allowfullscreen="true" src="https://open.spotify.com', '<div class="iframe-container d-flex justify-content-center"><iframe class="ql-video ql-align-center" allowfullscreen="true" tipo="podcast" src="https://open.spotify.com');

    /* Cierre de iframe comun para Youtube y Spotify */
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('</iframe>', '</iframe></div>');

    /*Centrar imagenes y meterlas en un imagen-container*/
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('<p><img', '<p class="ql-align-center imagen-container text-center"><img')
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('<p class="ql-align-center"><img', '<p class="ql-align-center imagen-container text-center"><img')
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('width="100%">', 'width="100%"></p>');
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('width="75%">', 'width="75%"></p>');
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('width="50%">', 'width="50%"></p>');
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('width="35%">', 'width="35%"></p>');
    this.publicacion.htmlPublicacion = this.publicacion.htmlPublicacion.replaceAll('width="20%">', 'width="20%"></p>');

  }
  getPublicacionesCerca() {
    this.publicacionesService.getPublicacionesCerca(this.publicacion.lugar.lugarNombre, this.publicacion.id).subscribe(publicacionesCerca => {
      this.publicacionesCerca = publicacionesCerca;
      this.publicacionesCerca.forEach(publicacionCerca => {
        publicacionCerca.id = this.publicacionesService.getId(publicacionCerca);
        publicacionCerca.subtitulo = publicacionCerca.subtitulo.substring(0, 120) + "...";
        this.publicacionesService.getCategoriaFromPublicacion(publicacionCerca).subscribe(categoria => {
          publicacionCerca.categoria = categoria;
          this.publicacionesService.getAutorFromPublicacion(publicacionCerca).subscribe(autor => {
            publicacionCerca.autor = autor;
          })
        })
      });
    })
  }

  getPublicacionesRelacionadas() {
    this.publicacionesService.getPublicacionesRelacionadas(this.publicacion.id).subscribe(publicacionesRelacionadas => {
      this.publicacionesRelacionadas = publicacionesRelacionadas;
      this.publicacionesRelacionadas.forEach(publicacionRelacionada => {
        publicacionRelacionada.id = this.publicacionesService.getId(publicacionRelacionada);
        publicacionRelacionada.subtitulo = publicacionRelacionada.subtitulo.substring(0, 120) + "...";
        this.publicacionesService.getCategoriaFromPublicacion(publicacionRelacionada).subscribe(categoria => {
          publicacionRelacionada.categoria = categoria;
          this.publicacionesService.getAutorFromPublicacion(publicacionRelacionada).subscribe(autor => {
            publicacionRelacionada.autor = autor;
          })
        })
      });
    })
  }

  showPublicacion() {
    var body = document.querySelector("#article");
    var html = document.createElement("div");
    /* html.setAttribute("class", "d-flex"); */
    html.innerHTML = this.publicacion.htmlPublicacion;
    body?.appendChild(html)
  }

  eliminarPublicacion() {
    $('#eliminarPublicacionModal').modal('show');
  }

  eliminarPublicacionConfirmado() {
    this.publicacionesService.deletePublicacion(this.publicacion.id).subscribe(response => {
      this.router.navigate(['#'])
    });
  }
  getFechaPublicacion() {
    if (this.publicacion.fechaPublicacion) {
      this.fechaFormateada = this.publicacion.fechaPublicacion.split("T")[0];
    }else{
      this.fechaFormateada = "2000-01-01"
    }
    
  }

  getLateral() {
    this.lateralService.getLateral().subscribe(lateral => {
      this.lateral = lateral;
      this.showHtmlPodcast();
      this.showHtmlTwitter();
      this.showHtmlTwitter2();
      this.showHtmlTwitter3();
      this.showHtmlPodcastSM();
    })
  }

  showHtmlTwitter() {
    var twitterContainer = document.querySelector("#twitter");
    var tweetContainer = document.createElement('div');
    tweetContainer.classList.add('twitter-tweet');
    tweetContainer.innerHTML = this.lateral.htmlTwitter;
    twitterContainer?.appendChild(tweetContainer);
   
  }

  showHtmlTwitter2() {
    var twitterContainer = document.querySelector("#twitter2");
    var tweetContainer = document.createElement('div');
    tweetContainer.classList.add('twitter-tweet');
    tweetContainer.innerHTML = this.lateral.htmlTwitter2;
    twitterContainer?.appendChild(tweetContainer);

  }

  showHtmlTwitter3() {
    var twitterContainer = document.querySelector("#twitter3");
    var tweetContainer = document.createElement('div');
    tweetContainer.classList.add('twitter-tweet');
    tweetContainer.innerHTML = this.lateral.htmlTwitter3;
    twitterContainer?.appendChild(tweetContainer);
    twttr.widgets.load();
  }

  showHtmlPodcast() {
    var podcastContainer = document.querySelector("#podcast");
    var html = document.createElement("div");
    html.innerHTML = this.lateral.htmlPodcast;
    podcastContainer?.appendChild(html);
    console.log(html.innerHTML)
  }
  showHtmlPodcastSM() {
    var podcastContainer = document.querySelector("#podcastSM");
    var html = document.createElement("div");
    html.innerHTML = this.lateral.htmlPodcast;
    podcastContainer?.appendChild(html);
    console.log(html.innerHTML)
  }
  buscarPublicacionesPorPalabras() {
    console.log(this.palabrasClave)
    let palabrasClaveArray = this.palabrasClave.split(" ");
    const url = `/publicaciones-buscador/?palabrasClave=${encodeURIComponent(JSON.stringify(palabrasClaveArray))}`;
    this.router.navigateByUrl(url);
  }
  like() {
    this.usuarioService.getUsuarioFromToken().subscribe(usuario => {
      usuario.id = this.usuarioService.getId(usuario);
      let like = new Like();
      like.usuario = usuario;
      this.likeService.postLike(this.publicacion.id, usuario).subscribe(like => {
        this.getLikes(this.publicacion);
      });
    })
  }
  getLikes(publicacion: Publicacion) {
    this.likeService.getLikes(publicacion.id).subscribe(likes => {
      likes.forEach(like => {
        like.id = this.likeService.getId(like);
      });
      this.publicacion.likesRecibidos = likes;
      this.numeroLikes = likes.length.toString();
    })
  }

  invitarVino(){
    this.pagar("3");
  }

  pagar(precio: string): void {
    this.modalService.open(this.modalPaypal, {
      size: 'm',
      windowClass: 'modalVinoPaypal'
    });
   this.initConfig(precio);
  }

  // metodo paypal
  private initConfig(precio: string): void {
    this.payPalConfig = {
      currency: 'EUR',
      //colocar id de la pagina paypal developer, en proyecto meter variable en enviroment
      clientId: this.clientId,
      createOrderOnClient: (data) =>
        <ICreateOrderRequest>{
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                //en que moneda lo queremos mirar doc de paypal
                currency_code: 'EUR',
                //colocamos el valor total de los items del carro en string
                value: precio,
                breakdown: {
                  item_total: {
                    currency_code: 'EUR',
                    value: precio,
                  },
                },
              },
              // colocamos los items del carrito con el metodo getItemsList
              items: [{name: "suscripcion", quantity: "1", unit_amount: {value: precio, currency_code: 'EUR'}}],
            },
          ],
        },
      advanced: {
        commit: 'true',
      },
      style: {
        label: 'paypal',
        layout: 'vertical',
      },
      onApprove: (data, actions) => {
        //mostramos un spinner mientras se procesa el pago
        /* this.spinner.show(); */
        console.log(
          'onApprove - transaction was approved, but not authorized',
          data,
          actions
        );
        actions.order.get().then((details: any) => {
          console.log(
            'onApprove - you can get full order details inside onApprove: ',
            details
          );
        });
      },
      onClientAuthorization: (data) => {
        console.log(
          'onClientAuthorization - you should probably inform your server about completed transaction at this point',
          data
        );
          this.modalService.dismissAll();
          $('#pagadoVinoModal').modal('show');
      },
      onCancel: (data, actions) => {
        this.modalService.dismissAll();
        console.log('OnCancel', data, actions);
      },
      onError: (err) => {
        this.modalService.dismissAll();
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };
  }

  openModal(items: any, amount: any): void {
    const modalRef = this.modalService.open(ModalReceiptComponent, { size: 'lg' });
    modalRef.componentInstance.items = items;
    modalRef.componentInstance.amount = amount
  }

  generarKeyWords(){
    this.publicacion.url.split('-').forEach(keyWord => {
      if (this.keyWords!="") {
        this.keyWords = this.keyWords + ", " + keyWord;
      }else{
        this.keyWords = keyWord;
      }
      
    });
  };

  guardarLocalStorageMeta(){
    localStorage.setItem("title", this.publicacion.titulo);
    localStorage.setItem("description", this.publicacion.subtitulo);
    localStorage.setItem("keyWords", this.keyWords);
    localStorage.setItem("autor", this.publicacion.autor.nombre + " " + this.publicacion.autor.apellido1 + " " + this.publicacion.autor.apellido2);
    localStorage.setItem("url", this.publicacion.url);
  }
}
